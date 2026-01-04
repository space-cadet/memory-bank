# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a **Memory Bank Database** project - part of a personal knowledge management system. It contains:

- **SQLite Database**: Stores parsed edit history, task information, and session data
- **Web Server**: Express-based viewer/editor for browsing and managing database content
- **Parser Scripts**: Command-line tools that extract structured data from markdown files

The project manages three main datasets:
1. **Edit History**: Work sessions and file modifications
2. **Tasks**: Task items with status, priority, and dependencies
3. **Sessions**: Work session tracking and current focus information

## Database Architecture

The database uses sql.js (WebAssembly SQLite) via a wrapper in `lib/sqlite.js` that provides a better-sqlite3-compatible interface. Key characteristics:

- All database operations are async (WASM initialization requirement)
- Database lives in memory; explicit saves to disk are required
- Write operations use a queue to prevent concurrent save corruption
- Three main table groups: Edit Tracking, Task Management, and Session Management

Core tables (from `schema.sql`):
- `edit_entries`: High-level work session records
- `file_modifications`: Individual file changes within edits
- `task_items`: Task records with status, priority, and details
- `task_dependencies`: Task dependency relationships
- `sessions`: Individual work sessions with timestamps
- `session_cache`: Current session snapshot for quick lookup
- `error_logs`: Error tracking during work
- `transaction_log`: Audit trail of database operations

## Commands & Build

**Installation & Setup:**
```bash
pnpm install                    # Install dependencies
./run-all.sh                    # Full setup: install, approve builds, run all parsers
```

**Parser Scripts** (build the database from markdown sources):
```bash
pnpm parse:edits               # node parse-edits.js - Parse edit_history.md
pnpm parse:tasks               # node parse-tasks.js - Parse task information
pnpm parse:sessions            # node parse-sessions.js - Parse session data
pnpm parse:session-cache       # node parse-session-cache.js - Update session cache
```

**Server & Development:**
```bash
pnpm start                     # node server.js - Start on port 3000
pnpm dev                       # node server.js --port 3001 - Start on port 3001
node server.js --db <path>    # Use specific database file
node server.js --help         # Show help message
```

**Query Tools:**
```bash
pnpm query                     # node query.js - General database queries
pnpm query:tasks              # node query-tasks.js - Task-specific queries
```

## Code Structure

**Root-level files:**
- `server.js` - Main Express server with API endpoints and web viewer
- `parse-*.js` - Individual parser scripts for each data source
- `query*.js` - Interactive query tools
- `schema.sql` - Complete database schema definition
- `run-all.sh` - Automation script for full build pipeline

**Library:**
- `lib/sqlite.js` - sql.js adapter providing async SQLite interface

**Frontend:**
- `public/index.html` - Single HTML file
- `public/js/` - Client-side JavaScript (api, app, ui, router, setup)
- `public/css/style.css` - Styling

**Database:**
- `memory_bank.db` - SQLite database file (created by parsers)

## Key Implementation Details

**sql.js Integration** (`lib/sqlite.js`):
- Wraps sql.js to provide methods: `openDb()`, `getDb()`, `exec()`, `prepare()`, `run()`, `get()`, `all()`, `save()`
- Uses a write queue to serialize saves and prevent corruption
- Tracks "dirty" state to optimize save operations
- Creates directories as needed before saving

**Parser Pattern** (e.g., `parse-edits.js`):
1. Initialize database schema with `CREATE TABLE IF NOT EXISTS`
2. Read source markdown file
3. Parse structured content (dates, tasks, file paths, descriptions)
4. Insert parsed data using prepared statements
5. Save database to disk

**Server Pattern** (`server.js`):
- Command-line argument parsing for `--port` and `--db`
- Serves static files from `public/`
- Provides API endpoints for database queries
- Includes performance logging middleware
- Filesystem access restricted to memory-bank project directory

## Development Notes

- Parsers are idempotent - can be run multiple times safely (uses `CREATE TABLE IF NOT EXISTS`)
- Database state is maintained on disk; parsers rebuild tables on each run
- The viewer is fully client-side after initial page load
- Server port defaults to 3000, configurable via `--port` argument or `PORT` env var
- Task IDs follow pattern: T1, T2, T3, etc. (string format)
- Timestamps use ISO 8601 format for consistency
