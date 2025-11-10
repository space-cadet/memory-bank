import { useEffect, useState } from 'react';
import { documentAPI, searchAPI } from '../services/api';
import DocumentCard from '../components/DocumentCard';
import './ChronologicalView.css';

export default function ChronologicalView({ onSelectDocument, searchQuery }) {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filteredDocs, setFilteredDocs] = useState([]);

  useEffect(() => {
    const loadDocuments = async () => {
      try {
        setLoading(true);
        const response = await documentAPI.getChronological();
        setDocuments(response.data.documents);
        setError(null);
      } catch (err) {
        setError('Failed to load documents');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadDocuments();
  }, []);

  useEffect(() => {
    if (searchQuery) {
      const performSearch = async () => {
        try {
          const response = await searchAPI.search(searchQuery);
          setFilteredDocs(response.data.results);
        } catch (err) {
          console.error('Search failed:', err);
          setFilteredDocs([]);
        }
      };

      performSearch();
    } else {
      setFilteredDocs(documents);
    }
  }, [searchQuery, documents]);

  if (loading) {
    return <div className="chronological-view loading">Loading documents...</div>;
  }

  if (error) {
    return <div className="chronological-view error">{error}</div>;
  }

  const docsToShow = searchQuery ? filteredDocs : documents;

  return (
    <div className="chronological-view">
      <div className="view-header">
        <h2>📅 Chronological View</h2>
        <p>{docsToShow.length} documents {searchQuery ? `matching "${searchQuery}"` : ''}</p>
      </div>

      {docsToShow.length === 0 ? (
        <div className="empty-state">
          {searchQuery ? (
            <>
              <p>No documents match your search for "{searchQuery}"</p>
            </>
          ) : (
            <>
              <p>No documents found</p>
            </>
          )}
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
    </div>
  );
}
