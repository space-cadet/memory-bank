# Memory Bank Web Interface

A modern web application for viewing, browsing, and searching the contents of a Memory Bank project. Provides three distinct viewing modes for exploring your documentation: chronological, task-wise, and topic-wise.

## Features

✨ **Three Browsing Modes:**
- **Chronological View**: Browse documents sorted by modification date (newest first)
- **Task-wise View**: Organize documents by related tasks (T1-T18, etc.)
- **Topic-wise View**: Navigate documents by topic/category extracted from document headings

🔍 **Search & Filtering:**
- Full-text search across all documents
- Real-time search results across any view mode
- Search highlights document matches by title, content, and task references

📖 **Document Viewer:**
- Rendered markdown with syntax highlighting for code blocks
- GitHub-flavored markdown support (tables, strikethrough, etc.)
- Document metadata (creation date, word count, file size, related tasks)
- Responsive design for desktop and tablet viewing

🎨 **Modern UI:**
- Clean, intuitive interface
- Responsive design
- Fast page navigation
- Sticky navigation header

## Architecture

```
Memory Bank Web Interface
├── Backend (Node.js + Express)
│   ├── File Reading & Indexing
│   ├── REST API Endpoints
│   └── Full-Text Search
└── Frontend (React + Vite)
    ├── Three View Components
    ├── Document Viewer
    └── Search Integration
```

### Backend (`web-server/`)

**Technologies:**
- Node.js with ES modules
- Express.js for REST API
- File system operations for reading markdown files
- In-memory indexing for fast searching

**Key Components:**
- `FileService`: Reads markdown files and extracts metadata
- `IndexService`: Builds chronological, task-wise, and topic-wise indexes
- API Routes: `/api/documents`, `/api/tasks`, `/api/topics`, `/api/search`

**API Endpoints:**
```
GET  /api/documents                    - All documents
GET  /api/documents/chronological      - Chronological order
GET  /api/documents/chronological-grouped - Grouped by date ranges
GET  /api/documents/:id                - Full document content
GET  /api/tasks                        - All tasks with counts
GET  /api/tasks/:taskId/documents      - Documents for task
GET  /api/topics                       - All topics with counts
GET  /api/topics/:name/documents       - Documents for topic
GET  /api/search?q=query               - Search results
GET  /api/health                       - Health check
```

### Frontend (`web-ui/`)

**Technologies:**
- React 18.2.0
- Vite for development and building
- React Markdown for rendering markdown
- Axios for API communication
- CSS3 with responsive design

**Key Components:**
- `App.jsx`: Main application router and state management
- `Navigation.jsx`: Tab navigation and search bar
- `ChronologicalView.jsx`: Timeline view of documents
- `TaskWiseView.jsx`: Task-filtered document view
- `TopicWiseView.jsx`: Topic/category view
- `DocumentDetail.jsx`: Full document viewer with markdown rendering
- `DocumentCard.jsx`: Reusable document list item component

## Setup & Installation

### Prerequisites
- Node.js 16+ and npm

### Backend Setup

```bash
cd web-server
npm install
```

**Configuration:**
Create or edit `.env`:
```
PORT=3001
MEMORY_BANK_PATH=../memory-bank
NODE_ENV=development
```

**Start Development Server:**
```bash
npm run dev
```

Or with standard Node:
```bash
npm start
```

Server will run at: `http://localhost:3001`

### Frontend Setup

```bash
cd web-ui
npm install
```

**Start Development Server:**
```bash
npm run dev
```

Frontend will run at: `http://localhost:3000`

The frontend is configured to proxy `/api` requests to the backend on `localhost:3001`.

### Production Build

**Frontend:**
```bash
cd web-ui
npm run build
```

This creates an optimized build in the `dist/` directory.

**Combined Deployment:**
To serve the frontend from the same Express server, you would configure Express to serve static files from `web-ui/dist/`. This is not configured by default in the current setup.

## Usage Guide

### Chronological View
- View all documents sorted by most recently modified first
- See documents grouped by date ranges (Today, This Week, etc.)
- Perfect for seeing what's been updated recently

### Task-wise View
- Select a task from the left sidebar
- View all documents related to that task
- Task counts show how many documents reference each task
- Quickly access documentation for specific project tasks

### Topic-wise View
- Browse documents by topics/categories
- Topics are extracted from document headings
- Organize information by subject area
- Topic counts help identify documentation density

### Searching
1. Enter search query in the search bar at the top
2. Press Enter or click Search button
3. Results appear in the current view mode
4. Search works across document titles, content, and task references
5. Click on any document to view its full content

### Viewing Documents
- Click any document card to view its full content
- Markdown is rendered with syntax highlighting
- Document metadata shown at the top (dates, word count, size)
- Related tasks and topics displayed as tags
- Click "Back" button to return to the list view

## File Structure

### Backend
```
web-server/
├── src/
│   ├── server.js              - Express application setup
│   ├── middleware/
│   │   ├── errorHandler.js    - Error handling middleware
│   │   └── requestLogger.js   - Request logging
│   ├── services/
│   │   ├── fileService.js     - File reading & metadata extraction
│   │   ├── indexService.js    - Indexing & search logic
│   │   └── serviceManager.js  - Service singleton management
│   └── routes/
│       ├── documents.js       - Document API endpoints
│       ├── tasks.js           - Task API endpoints
│       ├── topics.js          - Topic API endpoints
│       └── search.js          - Search API endpoints
├── .env                       - Environment variables
└── package.json
```

### Frontend
```
web-ui/
├── src/
│   ├── main.jsx               - React entry point
│   ├── App.jsx                - Main app component
│   ├── App.css                - App styles
│   ├── components/
│   │   ├── Navigation.jsx     - Navigation tabs & search
│   │   ├── Navigation.css
│   │   ├── DocumentCard.jsx   - Document list item
│   │   └── DocumentCard.css
│   ├── pages/
│   │   ├── ChronologicalView.jsx
│   │   ├── ChronologicalView.css
│   │   ├── TaskWiseView.jsx
│   │   ├── TaskWiseView.css
│   │   ├── TopicWiseView.jsx
│   │   ├── TopicWiseView.css
│   │   ├── DocumentDetail.jsx
│   │   └── DocumentDetail.css
│   ├── services/
│   │   └── api.js             - API client with axios
│   ├── hooks/
│   │   └── useAsync.js        - Async state management hook
│   └── styles/
│       └── index.css          - Global styles
├── index.html                 - HTML entry point
├── vite.config.js            - Vite configuration
└── package.json
```

## Data Model

### Document Structure
```javascript
{
  id: string,                  // Unique identifier (path-based)
  filename: string,            // File name
  relativePath: string,        // Path relative to memory bank
  title: string,               // Extracted from first H1 or filename
  type: string,                // document, task, session, implementation, etc.
  dateCreated: Date,           // File creation date
  dateModified: Date,          // File modification date
  size: number,                // File size in bytes
  wordCount: number,           // Word count in document
  headings: Array,             // Extracted headings with levels
  relatedTasks: Array,         // Task references [T1, T3, etc.]
  topics: Array,               // Topic/category names
  content: string              // Full markdown content
}
```

## Performance

- **Backend Indexing**: Indexes are built once on server startup (~1-2 seconds for typical memory banks)
- **API Response Times**: < 100ms for most queries (in-memory indexes)
- **Frontend**: Uses React lazy loading and efficient rendering
- **Search**: Full-text search with result ranking

## Customization

### Modify Document Types
Edit the `determineDocumentType()` method in `fileService.js` to recognize custom document types.

### Adjust Styling
All CSS files use standard CSS with clear class names. Global styles in `styles/index.css`, component-specific styles in component directories.

### Extend API
Add new routes in `src/routes/` and implement corresponding service methods in `indexService.js`.

### Change Memory Bank Path
Set `MEMORY_BANK_PATH` environment variable or modify `.env` file.

## Troubleshooting

### Backend won't start
- Check Node.js version (16+ required)
- Ensure `MEMORY_BANK_PATH` points to valid memory bank directory
- Check file permissions on memory bank folder
- Review error messages in console

### Frontend shows "Failed to load documents"
- Verify backend is running on port 3001
- Check browser console for CORS errors
- Ensure API endpoint is correct in `vite.config.js`

### Search not working
- Ensure documents were indexed correctly
- Check for JavaScript errors in browser console
- Verify markdown files are readable by Node.js process

### Slow performance
- Check memory bank size (number of documents)
- Monitor backend CPU/memory usage
- Consider filtering less-used documents from the memory bank path

## Future Enhancements

- [ ] Document versioning and history tracking
- [ ] Collaborative editing and annotations
- [ ] Export functionality (PDF, HTML)
- [ ] Advanced filtering (by date range, doc type, etc.)
- [ ] Task dependency visualization
- [ ] Dark mode theme
- [ ] Mobile app
- [ ] Real-time document sync

## Development

### Running Both Servers Simultaneously

**Terminal 1 - Backend:**
```bash
cd web-server
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd web-ui
npm run dev
```

Then open `http://localhost:3000` in your browser.

### Code Style
- JavaScript: Modern ES6+ with modules
- React: Functional components with hooks
- CSS: BEM naming convention for classes

### Testing
Currently no automated tests. Manual testing of all three view modes and search functionality recommended before deployment.

## License

Same as Memory Bank project

## Support

For issues specific to the web interface, please refer to the Memory Bank project repository.
