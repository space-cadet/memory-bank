# Memory Bank Server

A self-contained server for initializing and managing Memory Bank projects with an integrated setup wizard, database viewer, and editor.

## Features

- **Setup Wizard**: Interactive 4-step wizard for initial Memory Bank setup
- **Database Viewer**: SQLite browser with table exploration, search, and relationships
- **Database Editor**: Add and manage edit history entries
- **Edit History Import**: Import edit history markdown into the database
- **Embedded Templates**: All templates included, no external dependencies needed
- **Express 5 Server**: Modern, fast HTTP server
- **Auto-Detection**: Detects existing memory banks to skip setup when not needed

## Installation

```bash
npm install @memory-bank/server
```

## Quick Start

### Option 1: Run from your project root (Recommended)

```bash
# Navigate to your project
cd /path/to/your/project

# Start the server
npx memory-bank-server

# Open http://localhost:3000 in your browser
```

### Option 2: Global installation

```bash
npm install -g @memory-bank/server

# From any project directory
memory-bank-server

# Open http://localhost:3000 in your browser
```

## Usage

### Initial Setup

When you start the server for the first time:

1. **Setup Status**: Server checks for existing Memory Bank
2. **Folder Selection**: Choose where to initialize the memory bank
3. **Configuration**: Select setup options:
   - Include database for edit history tracking
   - Include templates for documentation
   - Import existing edit_history.md file
4. **Initialization**: Server creates all necessary directories, files, and database

### Web Interface

The server provides a modern web interface with three main components:

1. **Setup Wizard** - Guided initialization for new projects
2. **Database Viewer** - Browse and search database tables
3. **Database Editor** - Manage edit history and project data

### Command Line Options

```bash
# Specify database path
npx memory-bank-server --db /path/to/database.db

# Use custom port
npx memory-bank-server --port 8080

# Show help
npx memory-bank-server --help
```

## Package Contents

```
├── server.js                 # Main Express server
├── package.json             # npm package configuration
├── schema.sql               # SQLite database schema
├── public/                  # Web interface
│   ├── index.html
│   ├── js/
│   │   ├── app.js
│   │   ├── api.js
│   │   ├── setup.js
│   │   └── ui.js
│   └── css/style.css
└── templates/               # Memory bank templates
    ├── activeContext.md
    ├── changelog.md
    ├── edit_history.md
    ├── errorLog.md
    ├── progress.md
    ├── projectbrief.md
    ├── session_cache.md
    ├── tasks.md
    └── [other templates]
```

## Memory Bank Project Structure

After initialization, your project will have:

```
your-project/
├── memory-bank/
│   ├── tasks.md
│   ├── activeContext.md
│   ├── edit_history.md
│   ├── progress.md
│   ├── projectbrief.md
│   ├── database/
│   │   ├── schema.sql
│   │   ├── memory_bank.db
│   │   └── public/
│   ├── tasks/
│   ├── sessions/
│   ├── templates/
│   └── [other directories]
└── [your project files]
```

## Requirements

- Node.js 16.0.0 or higher
- npm or yarn

## Security

- All filesystem access restricted to project root
- Path validation prevents directory traversal
- Database queries use parameterized statements
- Suitable for local development environments

## API Endpoints

The server provides RESTful APIs for:
- Database management (`/api/db/*`)
- Table operations (`/api/table/*`)
- Setup operations (`/api/setup/*`)
- Edit history (`/api/edit-entries`, `/api/import/*`, `/api/export/*`)
- File browsing (`/api/memory-bank/*`)

## Troubleshooting

**Port already in use**: The server automatically uses a random available port if the default is busy

**Templates not found**: Verify installation with `npm list @memory-bank/server`

**Database locked**: Ensure only one server instance is running

## Support

For issues and documentation visit: https://github.com/your-org/memory-bank

## License

MIT
