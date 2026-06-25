# Edit Chunk: 2026-06-25 06:11:50 IST

## Task: T21

### Work Done

Fixed three template-level issues in DB-native workflow: (1) added missing task_subtasks table to schema.sql, (2) changed all parsers from DROP TABLE to DELETE FROM to preserve schema columns, (3) switched init-schema.js from better-sqlite3 to sql.js for VPS compatibility. All verified with full parse→regenerate cycle.

### Files Modified

- Modified `database/schema.sql` — Added CREATE TABLE task_subtasks + index (lines 45-55)
- Modified `database/parse-tasks.js` — DROP TABLE → DELETE FROM for task tables
- Modified `database/parse-edits.js` — DROP TABLE → DELETE FROM for edit tables
- Modified `database/parse-sessions.js` — DROP TABLE → DELETE FROM for sessions table
- Modified `database/parse-session-cache.js` — DROP TABLE → DELETE FROM for session_cache table
- Modified `database/init-schema.js` — Switched from better-sqlite3 to sql.js via lib/sqlite.js

