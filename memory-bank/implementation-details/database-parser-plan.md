# Memory Bank Database Parser Implementation Plan
*Created: 2025-11-12 12:02:00 IST*

## Overview

The Memory Bank Database Parser is a fresh implementation that parses memory bank markdown files and populates a SQLite database for analysis and querying. The current implementation focuses on `edit_history.md` parsing, with a design that supports future expansion to other memory bank files.

## Current Implementation: Edit History Parser

### Location
`edit-history-parser/` directory at project root

### Components

1. **parse-sqlite.js** - Main parser script
   - Reads `memory-bank/edit_history.md`
   - Parses date headers (### YYYY-MM-DD format)
   - Parses entry headers (#### HH:MM:SS TZ - TaskID: Description)
   - Extracts file modifications (- Action `path` - description)
   - Populates SQLite database with structured data
   - Uses transactions for performance
   - Comprehensive error handling

2. **query.js** - Interactive query tool
   - `stats` - Database statistics
   - `all [limit]` - Show all entries
   - `task <task_id>` - Entries by task
   - `files [search] [limit]` - File modifications with optional search
   - `date <YYYY-MM-DD>` - Entries by date range
   - Read-only queries to prevent accidental modifications

3. **schema.prisma** - Reference schema (not actively used)
   - Documents the intended data model
   - Preserved for potential future Prisma migration

### Database Schema

**edit_entries table:**
- `id` INTEGER PRIMARY KEY AUTOINCREMENT
- `date` TEXT NOT NULL (YYYY-MM-DD)
- `time` TEXT NOT NULL (HH:MM:SS)
- `timezone` TEXT NOT NULL (IST, UTC, etc.)
- `timestamp` TEXT NOT NULL (ISO 8601)
- `task_id` TEXT (e.g., "T3", "T13", "T3, T13")
- `task_description` TEXT NOT NULL

**file_modifications table:**
- `id` INTEGER PRIMARY KEY AUTOINCREMENT
- `edit_entry_id` INTEGER NOT NULL (foreign key)
- `action` TEXT NOT NULL (Created, Modified, Updated)
- `file_path` TEXT NOT NULL
- `description` TEXT NOT NULL

**Indexes:**
- `idx_edit_entries_date` ON edit_entries(date)
- `idx_edit_entries_task_id` ON edit_entries(task_id)
- `idx_file_modifications_file_path` ON file_modifications(file_path)
- `idx_file_modifications_edit_entry_id` ON file_modifications(edit_entry_id)

### Parser Logic

1. **Date Extraction**: Scans for `### YYYY-MM-DD` headers
2. **Entry Parsing**: Within each date, finds `#### HH:MM:SS TZ - ...` headers
3. **Task ID Extraction**: Regex match for `T\d+(?:,\s*T\d+)*` patterns
4. **File Modification Parsing**: Extracts lines starting with `-` containing backticked paths
5. **Timestamp Normalization**: Converts date/time/timezone to ISO 8601 format
6. **Batch Insert**: Uses SQLite transactions for performance

### Technical Features

- Handles time formats with or without seconds
- Supports multiple task IDs in single entry
- Strips timezone abbreviations from time strings before parsing
- Transaction-based database operations
- Clear database on each parse for idempotent behavior
- Comprehensive statistics display

## Future Expansion Plans

### Phase 2: Additional File Parsers

The system is designed to be extended with additional parsers:

1. **Task Registry Parser** (`tasks.md`)
   - Parse task table entries
   - Extract task details sections
   - Track task status changes over time
   - Link to edit history entries

2. **Session Cache Parser** (`session_cache.md`)
   - Parse current session state
   - Extract task registry snapshots
   - Track active/paused task transitions
   - Session history references

3. **Error Log Parser** (`errorLog.md`)
   - Parse error entries
   - Link errors to tasks
   - Track error resolutions
   - Pattern analysis for common issues

4. **Progress Parser** (`progress.md`)
   - Track milestone completions
   - Link progress to tasks
   - Timeline visualization data

### Unified Database Schema (Future)

When expanding to multiple parsers, consider:
- Shared `tasks` table for task metadata
- Shared `sessions` table for session records
- File-specific detail tables linked to core tables
- Cross-reference capabilities between different data sources

### Query Enhancements (Future)

- Cross-file queries (e.g., "show all edit history entries related to errors in task T3")
- Timeline visualization queries
- Task completion analysis
- File modification frequency analysis
- Session productivity metrics

## Design Principles

1. **Fresh Start**: Intentionally ignores existing `memory-bank/database` scripts
2. **Simplicity**: Direct SQLite usage with better-sqlite3
3. **Portability**: Single database file, easy to share/backup
4. **Read-Only Queries**: Prevents accidental data modification
5. **Idempotent Parsing**: Clear and rebuild on each run
6. **Universal Viewing**: Compatible with standard SQLite tools

## Dependencies

- `better-sqlite3` ^12.4.1 - Native SQLite bindings
- Node.js with ES modules support

## Usage Workflow

1. Install dependencies: `npm install`
2. Parse edit history: `node parse-sqlite.js`
3. Query database: `node query.js <command>`
4. Or use external SQLite tools: DB Browser, sqlite3, VS Code extensions

## File Locations

```
/edit-history-parser/
├── parse-sqlite.js     # Main parser
├── query.js            # Query tool
├── schema.prisma       # Reference schema
├── package.json        # Dependencies
├── README.md           # Documentation
└── edit_history.db     # Generated database
```

## Notes

- Parser successfully tested with 14 entries, 60 file modifications
- Handles all timezone abbreviations (IST, UTC, EST, PST, GMT)
- All queries are read-only for safety
- Database can be regenerated anytime from source markdown
