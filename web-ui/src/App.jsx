import { useState, useCallback } from 'react';
import Navigation from './components/Navigation';
import ChronologicalView from './pages/ChronologicalView';
import TaskWiseView from './pages/TaskWiseView';
import TopicWiseView from './pages/TopicWiseView';
import DocumentDetail from './pages/DocumentDetail';
import './App.css';

export default function App() {
  const [currentView, setCurrentView] = useState('chronological');
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  const handleViewChange = useCallback((view) => {
    setCurrentView(view);
    setSelectedDocument(null);
    setSearchQuery('');
  }, []);

  const handleDocumentSelect = useCallback((document) => {
    setSelectedDocument(document);
  }, []);

  const handleDocumentClose = useCallback(() => {
    setSelectedDocument(null);
  }, []);

  const handleSearch = useCallback((query) => {
    setSearchQuery(query);
  }, []);

  if (selectedDocument) {
    return (
      <div className="app">
        <Navigation onViewChange={handleViewChange} currentView={currentView} />
        <DocumentDetail document={selectedDocument} onClose={handleDocumentClose} />
      </div>
    );
  }

  return (
    <div className="app">
      <Navigation onViewChange={handleViewChange} currentView={currentView} onSearch={handleSearch} />
      <main className="main-content">
        {currentView === 'chronological' && (
          <ChronologicalView onSelectDocument={handleDocumentSelect} searchQuery={searchQuery} />
        )}
        {currentView === 'tasks' && (
          <TaskWiseView onSelectDocument={handleDocumentSelect} searchQuery={searchQuery} />
        )}
        {currentView === 'topics' && (
          <TopicWiseView onSelectDocument={handleDocumentSelect} searchQuery={searchQuery} />
        )}
      </main>
    </div>
  );
}
