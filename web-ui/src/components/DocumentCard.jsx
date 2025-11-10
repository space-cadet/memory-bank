import './DocumentCard.css';

export default function DocumentCard({ document, onClick }) {
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getTypeIcon = (type) => {
    const icons = {
      task: '✓',
      session: '💬',
      implementation: '⚙️',
      database: '💾',
      context: '🎯',
      progress: '📊',
      cache: '⚡',
      history: '📝',
      errors: '⚠️',
      document: '📄'
    };
    return icons[type] || '📄';
  };

  return (
    <div className="document-card" onClick={onClick}>
      <div className="card-header">
        <span className="doc-type">{getTypeIcon(document.type)}</span>
        <h3 className="doc-title">{document.title}</h3>
      </div>

      <div className="card-meta">
        <span className="date">{formatDate(document.dateModified)}</span>
        <span className="word-count">{document.wordCount} words</span>
      </div>

      {document.relatedTasks && document.relatedTasks.length > 0 && (
        <div className="doc-tasks">
          {document.relatedTasks.slice(0, 3).map(task => (
            <span key={task} className="task-tag">{task}</span>
          ))}
          {document.relatedTasks.length > 3 && (
            <span className="task-tag">+{document.relatedTasks.length - 3}</span>
          )}
        </div>
      )}

      <p className="doc-path">{document.relativePath}</p>
    </div>
  );
}
