import { useEffect, useState } from 'react';
import { topicAPI, searchAPI } from '../services/api';
import DocumentCard from '../components/DocumentCard';
import './TopicWiseView.css';

export default function TopicWiseView({ onSelectDocument, searchQuery }) {
  const [topics, setTopics] = useState([]);
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [topicDocuments, setTopicDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchResults, setSearchResults] = useState([]);

  useEffect(() => {
    const loadTopics = async () => {
      try {
        setLoading(true);
        const response = await topicAPI.getAll();
        setTopics(response.data.topics);
        if (response.data.topics.length > 0) {
          setSelectedTopic(response.data.topics[0].name);
        }
        setError(null);
      } catch (err) {
        setError('Failed to load topics');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadTopics();
  }, []);

  useEffect(() => {
    if (selectedTopic) {
      const loadTopicDocuments = async () => {
        try {
          const response = await topicAPI.getDocuments(selectedTopic);
          setTopicDocuments(response.data.documents);
        } catch (err) {
          console.error('Failed to load topic documents:', err);
          setTopicDocuments([]);
        }
      };

      loadTopicDocuments();
    }
  }, [selectedTopic]);

  useEffect(() => {
    if (searchQuery) {
      const performSearch = async () => {
        try {
          const response = await searchAPI.search(searchQuery);
          setSearchResults(response.data.results);
        } catch (err) {
          console.error('Search failed:', err);
          setSearchResults([]);
        }
      };

      performSearch();
    } else {
      setSearchResults([]);
    }
  }, [searchQuery]);

  if (loading) {
    return <div className="topic-wise-view loading">Loading topics...</div>;
  }

  if (error) {
    return <div className="topic-wise-view error">{error}</div>;
  }

  const docsToShow = searchQuery ? searchResults : topicDocuments;

  return (
    <div className="topic-wise-view">
      <div className="view-container">
        <aside className="topic-sidebar">
          <h3>Topics ({topics.length})</h3>
          <div className="topic-list">
            {topics.map(topic => (
              <button
                key={topic.name}
                className={`topic-item ${selectedTopic === topic.name ? 'active' : ''}`}
                onClick={() => setSelectedTopic(topic.name)}
                title={topic.name}
              >
                <span className="topic-name">{topic.name}</span>
                <span className="topic-count">{topic.documentCount}</span>
              </button>
            ))}
          </div>
        </aside>

        <main className="topic-content">
          <div className="view-header">
            <h2>📚 {selectedTopic || 'Select a Topic'}</h2>
            <p>
              {docsToShow.length} documents
              {searchQuery ? ` matching "${searchQuery}"` : ''}
            </p>
          </div>

          {docsToShow.length === 0 ? (
            <div className="empty-state">
              <p>
                {searchQuery
                  ? `No documents match your search for "${searchQuery}"`
                  : 'No documents for this topic'}
              </p>
            </div>
          ) : (
            <div className="documents-list">
              {docsToShow.map(doc => (
                <DocumentCard
                  key={doc.id}
                  document={doc}
                  onClick={() => onSelectDocument(doc)}
                />
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
