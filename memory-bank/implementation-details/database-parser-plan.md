# Memory Bank Database Parser Implementation Plan
*Created: 2025-11-12 12:02:00 IST*
*Last Updated: 2025-11-12 17:25:21 IST*

## Overview

The Memory Bank Database Parser consists of two complementary systems:

1. **T20**: Direct format-specific parsers (current implementation) - Fast, deterministic parsing of memory bank markdown files
2. **T20a**: Adaptive LLM-based format parser (planned) - Intelligent format detection and normalization for multi-project compatibility

This document focuses on T20. See `adaptive-parser-plan.md` for T20a system design.

### T20 Status
The Memory Bank Database Parser is a fresh implementation that parses memory bank markdown files and populates a SQLite database for analysis and querying. Originally located in `edit-history-parser/` at project root, it has been moved to `memory-bank/database/` and integrated with the mb-cli init system (2025-11-12). The implementation focuses on `edit_history.md` and `tasks.md` parsing with flexible format support.

## Current Implementation Status

### Location (Updated 2025-11-12)
`memory-bank/database/` - Integrated with memory bank initialization system
- Previously: `edit-history-parser/` at project root
- Migration: Replaced T3 Prisma ORM system with T20 better-sqlite3 approach
- Backup: Old T3 database code at `database.old/` (root level)

### Components

1. **parse-edits.js** - Edit history parser script (renamed from parse-sqlite.js)
   - Reads `memory-bank/edit_history.md`
   - Parses date headers (### YYYY-MM-DD format)
   - Parses entry headers (#### HH:MM:SS TZ - TaskID: Description)
   - Extracts file modifications (- Action `path` - description)
   - Populates memory_bank.db with edit_entries and edit_modifications tables
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

**edit_modifications table:**
- `id` INTEGER PRIMARY KEY AUTOINCREMENT
- `edit_entry_id` INTEGER NOT NULL (foreign key)
- `action` TEXT NOT NULL (Created, Modified, Updated)
- `file_path` TEXT NOT NULL
- `description` TEXT NOT NULL

**task_items table:**
- `id` TEXT PRIMARY KEY
- `title` TEXT NOT NULL
- `status` TEXT NOT NULL (pending, in_progress, completed, paused)
- `priority` TEXT NOT NULL (low, medium, high)
- `started` TEXT NOT NULL (YYYY-MM-DD)
- `details` TEXT NOT NULL

**task_dependencies table:**
- `task_id` TEXT NOT NULL (foreign key)
- `depends_on` TEXT NOT NULL (foreign key)
- PRIMARY KEY (task_id, depends_on)

**Indexes:**
- `idx_edit_entries_date` ON edit_entries(date)
- `idx_edit_entries_task_id` ON edit_entries(task_id)
- `idx_file_modifications_file_path` ON file_modifications(file_path)
- `idx_file_modifications_edit_entry_id` ON file_modifications(edit_entry_id)

### Parser Logic

**parse-edits.js:**
1. **Date Extraction**: Scans for `### YYYY-MM-DD` headers
2. **Entry Parsing**: Within each date, finds `#### HH:MM:SS [TZ] - ...` headers
   - Timezone optional (defaults to UTC if not provided) - NEW 2025-11-12
   - Supports both `#### 19:43:25 IST - T3: Description` and `#### 03:37 - T13: Description`
3. **Task ID Extraction**: Regex match for `T\d+(?:,\s*T\d+)*` patterns
4. **File Modification Parsing**: Extracts lines starting with `-` containing backticked paths
5. **Timestamp Normalization**: Converts date/time/timezone to ISO 8601 format
6. **Batch Insert**: Uses SQLite transactions for performance

**parse-tasks.js:**
1. **Flexible Column Parsing**: Handles 6-8 column formats
2. **Status Extraction**: Handles both `🔄` and `🔄 (70%)` formats - NEW 2025-11-12
3. **Task ID Extraction**: From first pipe-delimited column
4. **Dependency Processing**: Parses comma-separated task IDs or single `-`
5. **Per-Task Feedback**: Console output for each inserted task - NEW 2025-11-12
6. **Transaction Insert**: Batch operations for performance

### Technical Features

- Handles time formats with or without seconds
- Supports multiple task IDs in single entry
- Strips timezone abbreviations from time strings before parsing
- Transaction-based database operations
- Clear database on each parse for idempotent behavior
- Comprehensive statistics display

## Current Implementation Status

### Phase 1: Edit History Parser
✅ Completed - Version 1.2
- Handles all timezones
- Processes 15+ entries with 70+ file modifications
- Renamed to parse-edits.js

### Phase 2: Tasks Parser
✅ Completed - Version 1.0
- Processes task table with dependencies
- Handles priority/status conversions
- Verified with 12 tasks and 9 dependencies

### Phase 3: Unified Database Integration
✅ Completed - Version 1.0
- Single memory_bank.db file for all data
- Table prefixes: edit_* and task_*
- Updated query.js for unified access
- Added edit_entry_modifications view

### Next Priority
1. Session Cache Parser
2. Error Log Parser
3. Progress Parser

## T20a Integration

T20a (Adaptive LLM-Based Format Parser) builds on T20's foundation to handle format variations across different projects. Rather than modifying T20 to handle all format variants, T20a implements:

1. **Format Detection**: LLM analyzes file structure and generates format profile
2. **Parser Selection**: Chooses appropriate parser based on detected format
3. **Normalization**: Maps extracted data to universal schema
4. **Multi-Project Support**: Handles different projects with different format conventions

See `adaptive-parser-plan.md` for complete T20a architecture.

## Future Expansion Plans

### Phase 2: Additional File Parsers (T20)

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

## LLM Integration (Phase 3)

### Strategic Approach
- Foundation First: Complete deterministic parser before LLM enhancements
- Optional Layer: Add-on capability, not core dependency
- Safety First: Read-only queries, sandboxed SQL generation

### Implementation Points
1. Natural Language to SQL conversion
2. Query explanation and optimization
3. Automated documentation generation
4. Semantic analysis of task relationships

### Architecture
```mermaid
graph LR
    Parser --> DB
    DB --> QueryTool
    QueryTool -->|Optional| LLM
```

### Safety Measures
- SQL injection protection
- Query validation layer
- Rate limiting
- Local LLM fallback

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
2. Parse edit history: `node parse-edits.js`
3. Parse tasks: `node parse-tasks.js`
4. Query unified database: `node query.js <command>`
5. Or use external SQLite tools: DB Browser, sqlite3, VS Code extensions

## File Locations (Updated 2025-11-12)

```
/memory-bank/database/
├── parse-edits.js           # Edit history parser (improved)
├── parse-tasks.js           # Tasks parser (improved)
├── query.js                 # Unified query tool
├── query-tasks.js           # Task query tool
├── schema.prisma            # Reference schema
├── package.json             # Dependencies (better-sqlite3)
├── pnpm-lock.yaml           # Dependency lock
├── DATABASE_README.md       # Database setup documentation
└── memory_bank.db           # Unified database
```

## Notes

- Parser successfully tested with 14 entries, 60 file modifications
- Handles all timezone abbreviations (IST, UTC, EST, PST, GMT)
- All queries are read-only for safety
- Database can be regenerated anytime from source markdown
