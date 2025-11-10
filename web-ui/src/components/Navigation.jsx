import { useState } from 'react';
import './Navigation.css';

export default function Navigation({ onViewChange, currentView, onSearch }) {
  const [searchValue, setSearchValue] = useState('');

  const handleSearchChange = (e) => {
    setSearchValue(e.target.value);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (onSearch) {
      onSearch(searchValue);
    }
  };

  return (
    <nav className="navigation">
      <div className="nav-header">
        <h1>Memory Bank Viewer</h1>
        <form className="search-form" onSubmit={handleSearchSubmit}>
          <input
            type="search"
            placeholder="Search documents..."
            value={searchValue}
            onChange={handleSearchChange}
            className="search-input"
          />
          <button type="submit" className="search-button">Search</button>
        </form>
      </div>

      <div className="nav-tabs">
        <button
          className={`nav-tab ${currentView === 'chronological' ? 'active' : ''}`}
          onClick={() => onViewChange('chronological')}
        >
          📅 Chronological
        </button>
        <button
          className={`nav-tab ${currentView === 'tasks' ? 'active' : ''}`}
          onClick={() => onViewChange('tasks')}
        >
          ✓ Tasks
        </button>
        <button
          className={`nav-tab ${currentView === 'topics' ? 'active' : ''}`}
          onClick={() => onViewChange('topics')}
        >
          📚 Topics
        </button>
      </div>
    </nav>
  );
}
