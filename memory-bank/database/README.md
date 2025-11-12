# Edit History Parser

A fresh parser that reads the Memory Bank `edit_history.md` file and populates a SQLite database with interactive query capabilities.

## Features

- **Clean Implementation**: Fresh start, ignoring existing database scripts
- **Structured Parsing**: Parses the edit history format with dates, times, timezones, task IDs, and file modifications
- **SQLite Database**: Lightweight, portable database using better-sqlite3
- **Interactive Queries**: Built-in query tool for exploring the data
- **Universal Viewing**: Use any SQLite viewer (DB Browser, sqlite3, VS Code extensions)

## Database Schema

### EditEntry
- `id`: Auto-incrementing primary key
- `date`: Date string (YYYY-MM-DD)
- `time`: Time string (HH:MM:SS)
- `timezone`: Timezone abbreviation (IST, UTC, etc.)
- `timestamp`: Parsed DateTime object
- `taskId`: Task identifier (e.g., T3, T13) - optional
- `taskDescription`: Brief description of the task
- `modifications`: Related file modifications

### FileModification
- `id`: Auto-incrementing primary key
- `action`: Type of modification (Created, Modified, Updated)
- `filePath`: Path to the modified file
- `description`: Description of changes
- `editEntryId`: Foreign key to EditEntry

## Setup

1. **Install dependencies:**
   ```bash
   cd edit-history-parser
   npm install
   ```

That's it! No migrations or additional setup needed.

## Usage

### Parse the edit history file

```bash
node parse-sqlite.js
```

This will:
1. Read `../memory-bank/edit_history.md`
2. Parse all edit entries and file modifications
3. Clear existing database data
4. Populate the database with parsed data
5. Display statistics

### Query the database

The query tool provides several views:

```bash
# Show database statistics
node query.js stats

# Show all entries (default limit: 20)
node query.js all [limit]

# Show entries for a specific task
node query.js task T3

# Show file modifications (with optional search)
node query.js files [search_term] [limit]

# Show entries by date
node query.js date 2025-11-01
```

## Example Queries

```bash
# View statistics about the database
node query.js stats

# See all entries for task T3
node query.js task T3

# Find all modifications to init.js
node query.js files init.js

# View last 50 entries
node query.js all 50

# See entries since November 11
node query.js date 2025-11-11
```

## Alternative Viewers

You can also use any SQLite viewer:

- **DB Browser for SQLite**: https://sqlitebrowser.org/
- **sqlite3 CLI**: `sqlite3 edit_history.db`
- **VS Code Extensions**: SQLite Viewer, SQLite Explorer
- **Online**: https://sqliteviewer.app/

## Project Structure

```
edit-history-parser/
├── schema.prisma          # Prisma schema (reference only, not actively used)
├── package.json           # Node.js dependencies and scripts
├── parse-sqlite.js        # Main parser script
├── query.js               # Interactive query tool
├── README.md              # This file
├── edit_history.db        # SQLite database (created after parsing)
└── node_modules/          # Dependencies (after npm install)
```

## Implementation Details

### Parser Features
- Handles various time formats (with or without seconds)
- Supports multiple task IDs in a single entry (e.g., "T3, T13")
- Automatically normalizes timestamps for proper date handling
- Clears the database before each parse to ensure fresh data
- Transaction-based inserts for performance
- Comprehensive error handling

### Database Schema
The database uses two main tables:
- `edit_entries`: Stores the main edit events with metadata
- `file_modifications`: Stores individual file changes linked to entries

Indexes are created on commonly queried fields (date, task_id, file_path) for optimal query performance.

## Notes

- This is a **fresh implementation** that ignores existing scripts in `memory-bank/database`
- The parser creates a clean SQLite database from scratch
- All queries are read-only to prevent accidental data modification
- The database file (`edit_history.db`) is portable and can be shared or backed up
