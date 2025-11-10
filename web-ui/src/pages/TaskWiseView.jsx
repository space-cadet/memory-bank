import { useEffect, useState } from 'react';
import { taskAPI, searchAPI } from '../services/api';
import DocumentCard from '../components/DocumentCard';
import './TaskWiseView.css';

export default function TaskWiseView({ onSelectDocument, searchQuery }) {
  const [tasks, setTasks] = useState([]);
  const [selectedTask, setSelectedTask] = useState(null);
  const [taskDocuments, setTaskDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchResults, setSearchResults] = useState([]);

  useEffect(() => {
    const loadTasks = async () => {
      try {
        setLoading(true);
        const response = await taskAPI.getAll();
        setTasks(response.data.tasks);
        if (response.data.tasks.length > 0) {
          setSelectedTask(response.data.tasks[0].id);
        }
        setError(null);
      } catch (err) {
        setError('Failed to load tasks');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadTasks();
  }, []);

  useEffect(() => {
    if (selectedTask) {
      const loadTaskDocuments = async () => {
        try {
          const response = await taskAPI.getDocuments(selectedTask);
          setTaskDocuments(response.data.documents);
        } catch (err) {
          console.error('Failed to load task documents:', err);
          setTaskDocuments([]);
        }
      };

      loadTaskDocuments();
    }
  }, [selectedTask]);

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
    return <div className="task-wise-view loading">Loading tasks...</div>;
  }

  if (error) {
    return <div className="task-wise-view error">{error}</div>;
  }

  const docsToShow = searchQuery ? searchResults : taskDocuments;

  return (
    <div className="task-wise-view">
      <div className="view-container">
        <aside className="task-sidebar">
          <h3>Tasks ({tasks.length})</h3>
          <div className="task-list">
            {tasks.map(task => (
              <button
                key={task.id}
                className={`task-item ${selectedTask === task.id ? 'active' : ''}`}
                onClick={() => setSelectedTask(task.id)}
              >
                <span className="task-id">{task.id}</span>
                <span className="task-count">{task.documentCount}</span>
              </button>
            ))}
          </div>
        </aside>

        <main className="task-content">
          <div className="view-header">
            <h2>✓ {selectedTask || 'Select a Task'}</h2>
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
                  : 'No documents for this task'}
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
