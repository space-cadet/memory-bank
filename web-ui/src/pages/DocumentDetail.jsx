import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import './DocumentDetail.css';

export default function DocumentDetail({ document, onClose }) {
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
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
    <div className="document-detail">
      <div className="detail-header">
        <button className="back-button" onClick={onClose}>
          ← Back
        </button>
        <div className="detail-title">
          <span className="doc-type">{getTypeIcon(document.type)}</span>
          <h1>{document.title}</h1>
        </div>
      </div>

      <div className="detail-meta">
        <div className="meta-item">
          <label>Path:</label>
          <span>{document.relativePath}</span>
        </div>
        <div className="meta-item">
          <label>Modified:</label>
          <span>{formatDate(document.dateModified)}</span>
        </div>
        <div className="meta-item">
          <label>Size:</label>
          <span>{(document.size / 1024).toFixed(1)} KB</span>
        </div>
        <div className="meta-item">
          <label>Words:</label>
          <span>{document.wordCount.toLocaleString()}</span>
        </div>
      </div>

      {document.relatedTasks && document.relatedTasks.length > 0 && (
        <div className="detail-tasks">
          <label>Related Tasks:</label>
          <div className="tasks-list">
            {document.relatedTasks.map(task => (
              <span key={task} className="task-tag">{task}</span>
            ))}
          </div>
        </div>
      )}

      {document.topics && document.topics.length > 0 && (
        <div className="detail-topics">
          <label>Topics:</label>
          <div className="topics-list">
            {document.topics.map(topic => (
              <span key={topic} className="topic-tag">{topic}</span>
            ))}
          </div>
        </div>
      )}

      <div className="detail-content">
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          components={{
            h1: ({ node, ...props }) => <h2 {...props} />,
            h2: ({ node, ...props }) => <h3 {...props} />,
            h3: ({ node, ...props }) => <h4 {...props} />,
            code: ({ node, inline, className, children, ...props }) => (
              inline ? (
                <code className="inline-code" {...props}>{children}</code>
              ) : (
                <pre className="code-block"><code className={className} {...props}>{children}</code></pre>
              )
            ),
            a: ({ node, href, ...props }) => (
              <a href={href} target="_blank" rel="noopener noreferrer" {...props} />
            ),
            table: ({ node, ...props }) => (
              <div className="table-wrapper"><table {...props} /></div>
            ),
          }}
        >
          {document.content}
        </ReactMarkdown>
      </div>
    </div>
  );
}
