# Memory Bank Database Schema & Protocol Reference

*Version: 1.1*  
*Created: 2026-06-25*  
*Status: RATIFIED — This is the single source of truth.*  
*Supersedes: All previous schema.sql copies, ad-hoc notes, and inline comments.*

> **Purpose:** Every agent, parser, CLI command, and regeneration script MUST conform to this document. If a file disagrees with this reference, the file is wrong — not this document.

---

## 1. Canonical Schema (SQLite)

### 1.1 Core Tables

```sql
-- Edit entries: High-level record of work sessions
CREATE TABLE edit_entries (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  date TEXT NOT NULL,                    -- YYYY-MM-DD
  time TEXT NOT NULL,                    -- HH:MM:SS
  timezone TEXT,                         -- IST, UTC, etc.
  timestamp TEXT NOT NULL,               -- ISO 8601 format
  task_id TEXT,                          -- T1, T2, etc. (comma-separated if multiple)
  task_description TEXT NOT NULL,        -- Brief description of work
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_edit_entries_date ON edit_entries(date);
CREATE INDEX idx_edit_entries_task ON edit_entries(task_id);
CREATE INDEX idx_edit_entries_timestamp ON edit_entries(timestamp);

-- File modifications: Track which files changed in each edit
CREATE TABLE file_modifications (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  edit_entry_id INTEGER NOT NULL,
  action TEXT NOT NULL,                  -- Created, Updated, Modified, Deleted
  file_path TEXT NOT NULL,
  description TEXT NOT NULL,             -- What changed and why
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (edit_entry_id) REFERENCES edit_entries(id) ON DELETE CASCADE
);

CREATE INDEX idx_file_modifications_entry ON file_modifications(edit_entry_id);
CREATE INDEX idx_file_modifications_path ON file_modifications(file_path);
CREATE INDEX idx_file_modifications_action ON file_modifications(action);

-- Task items: Individual task records
CREATE TABLE task_items (
  id TEXT PRIMARY KEY,                   -- T1, T2, T3, etc.
  title TEXT NOT NULL,
  status TEXT NOT NULL,                  -- in_progress, completed, paused, blocked
  priority TEXT NOT NULL,                -- HIGH, MEDIUM, LOW
  started TEXT NOT NULL,                 -- YYYY-MM-DD
  last_updated TIMESTAMP,                -- ← CANONICAL NAME: last_updated
  details TEXT,                          -- Description and context
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_task_items_status ON task_items(status);
CREATE INDEX idx_task_items_priority ON task_items(priority);

-- Task subtasks: Checklist items within a task
CREATE TABLE task_subtasks (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  task_id TEXT NOT NULL,
  section TEXT,                          -- Section name (e.g., "Completion Criteria")
  position INTEGER NOT NULL,             -- Order within task
  text TEXT NOT NULL,                    -- Subtask description
  checked INTEGER DEFAULT 0,             -- 0 = unchecked, 1 = checked
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (task_id) REFERENCES task_items(id) ON DELETE CASCADE
);

CREATE INDEX idx_task_subtasks_task ON task_subtasks(task_id);

-- Task dependencies: Track which tasks depend on others
-- Note: No foreign keys — dependencies may reference tasks outside this dataset
CREATE TABLE task_dependencies (
  task_id TEXT NOT NULL,
  depends_on TEXT NOT NULL,
  PRIMARY KEY (task_id, depends_on)
);

-- Sessions: Individual work sessions
CREATE TABLE sessions (
  id TEXT PRIMARY KEY,                   -- session identifier
  session_date TEXT NOT NULL,            -- ← CANONICAL NAME: session_date (YYYY-MM-DD)
  session_period TEXT,                   -- ← CANONICAL NAME: session_period (morning, afternoon, evening, night)
  status TEXT,                           -- active, completed
  focus_task TEXT,                       -- ← CANONICAL NAME: focus_task (Task ID being focused on)
  start_time TEXT,                       -- ISO timestamp when session started
  end_time TEXT,                         -- ISO timestamp when session ended
  active_count INTEGER,                  -- Active task count
  paused_count INTEGER,                  -- Paused task count
  completed_count INTEGER,               -- Completed task count
  cancelled_count INTEGER,               -- Cancelled task count
  content TEXT,                          -- ← CANONICAL NAME: content (Session notes/content)
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_sessions_date ON sessions(session_date);
CREATE INDEX idx_sessions_period ON sessions(session_period);
CREATE INDEX idx_sessions_focus ON sessions(focus_task);
CREATE INDEX idx_sessions_status ON sessions(status);

-- Session cache: Current session snapshot for quick lookup
CREATE TABLE session_cache (
  session_id TEXT PRIMARY KEY,
  status TEXT,
  focus_task TEXT,
  active_tasks_count INTEGER DEFAULT 0,
  paused_tasks_count INTEGER DEFAULT 0,
  completed_tasks_count INTEGER DEFAULT 0,
  cancelled_tasks_count INTEGER DEFAULT 0,
  raw_content TEXT
);

-- Error logs: Track errors encountered during work
CREATE TABLE error_logs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  timestamp TIMESTAMP NOT NULL,
  task_id TEXT,
  file_path TEXT,
  error_message TEXT NOT NULL,
  cause TEXT,
  fix_applied TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (task_id) REFERENCES task_items(id)
);

CREATE INDEX idx_error_logs_timestamp ON error_logs(timestamp);
CREATE INDEX idx_error_logs_task ON error_logs(task_id);

-- Transaction log: Audit trail of database operations
CREATE TABLE transaction_log (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  transaction_id TEXT UNIQUE NOT NULL,
  timestamp TIMESTAMP NOT NULL,
  operation_type TEXT NOT NULL,
  affected_tables TEXT,
  row_count INTEGER,
  status TEXT NOT NULL,                  -- success, failed, rolled_back
  error_message TEXT,
  duration_ms INTEGER,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_transaction_log_timestamp ON transaction_log(timestamp);
CREATE INDEX idx_transaction_log_type ON transaction_log(operation_type);
CREATE INDEX idx_transaction_log_status ON transaction_log(status);
```

### 1.2 Naming Rules (Non-Negotiable)

| Concept | Canonical Column Name | Forbidden Old Name | Why |
|---------|----------------------|-------------------|-----|
| Task last update | `last_updated` | `updated` | Ambiguous with other tables |
| Session date | `session_date` | `date` | Conflicts with `edit_entries.date` |
| Session period | `session_period` | `period` | Too generic |
| Session focus | `focus_task` | `focus` | Ambiguous |
| Session notes | `content` | `notes` | Consistent with `raw_content` |

**Rule:** Any `SELECT`, `INSERT`, `UPDATE`, or `CREATE TABLE` statement that uses a "Forbidden Old Name" is a bug.

---

## 2. Lib API Contract (`database/lib/`)

### 2.1 `inserts.js`

**Function signatures MUST match the canonical column names:**

```js
// Task management
upsertTask({ id, title, status, priority, started, details })
  // → INSERT/UPDATE task_items(..., last_updated, ...)

updateTaskStatus(taskId, newStatus, detailsUpdate)
  // → UPDATE task_items SET status = ?, last_updated = ? ...

addTaskSubtasks(taskId, subtasks)
  // → DELETE FROM task_subtasks WHERE task_id = ?; then INSERT

// Session management
createSession({ id, session_date, session_period, focus_task, status, content, start_time, end_time })
  // → INSERT INTO sessions(id, session_date, session_period, focus_task, status, content, start_time, end_time)

completeSession(sessionId, notes)
  // → UPDATE sessions SET status = 'completed', content = COALESCE(content, '') || '\n\n' || ?

updateSessionCache({ current_session_id, current_focus_task, active_tasks_count, paused_tasks_count, completed_tasks_count })
  // → UPSERT INTO session_cache(..., focus_task, ...)
```

### 2.2 `workflow.js`

```js
recordSessionWork({ task_id, task_description, files_modified, task_status, session_notes, session_period, regenerate_markdown })
  // Internally calls inserts.createSession with { session_date, session_period, focus_task, content }
  // Queries existing sessions with: session_date = ? AND session_period = ?

completeSessionWork(sessionId, notes, { output_dir, task_status })
  // Reads session with: SELECT focus_task FROM sessions WHERE id = ?
  // Updates next active session with: SELECT focus_task FROM sessions WHERE status = 'active'
```

### 2.3 `regenerate.js`

```js
regenerateTasks(outputPath)
  // → SELECT id, title, status, priority, started, last_updated, details FROM task_items

regenerateSessionCache(outputPath)
  // → SELECT * FROM session_cache WHERE session_id = 'current'
  // → SELECT * FROM sessions WHERE id = ?
  // → SELECT * FROM sessions WHERE status = 'active' AND focus_task = ?
  // Accesses: session.session_date, session.session_period, session.focus_task
  // Accesses: task.last_updated for completed date

regenerateSessionFile(sessionsDir)
  // → SELECT id, session_date, session_period, focus_task, status, content, start_time, end_time, created_at FROM sessions
  // Accesses: session.session_date, session.session_period, session.focus_task, session.content, session.start_time
```

### 2.4 `sqlite.js`

No schema-specific code. Pure adapter. Must remain portable.

---

## 3. Parser Contract (`database/parse-*.js`)

Parsers read markdown files and write to the database. They MUST use canonical column names.

| Parser | Input File | Target Table | Key INSERT Columns |
|--------|-----------|-------------|-------------------|
| `parse-edits.js` | `edit_history.md` | `edit_entries`, `file_modifications` | `date`, `time`, `timezone`, `task_id`, `task_description` |
| `parse-tasks.js` | `tasks.md` | `task_items`, `task_dependencies` | `id`, `title`, `status`, `priority`, `started`, **`last_updated`**, `details` |
| `parse-sessions.js` | `sessions/*.md` | `sessions` | `id`, **`session_date`**, **`session_period`**, **`focus_task`**, `status`, `content`, `start_time`, `end_time` |
| `parse-session-cache.js` | `session_cache.md` | `session_cache` | `session_id`, `status`, `focus_task`, `active_tasks_count`, `raw_content` |

**Important:** Parsers MUST use `DELETE FROM <table>` (not `DROP TABLE`) to preserve schema columns like `created_at`.

---

## 4. CLI Command Contract (`mb-cli/src/commands/`)

| Command | SQL Table | Required Columns |
|---------|----------|-----------------|
| `mb task list` | `task_items` | `id, title, status, priority, started, last_updated` |
| `mb task update` | `task_items` | `SET last_updated = ?` (never `updated`) |
| `mb session start` | `sessions` | `session_date, session_period, focus_task, status, content` |
| `mb session list` | `sessions` | `id, session_date, session_period, status, focus_task` |
| `mb session complete` | `sessions` | `content = COALESCE(content, '') || '\n\n' || ?` |
| `mb db query` | any | User-provided; must use canonical names |

---

## 5. Markdown Format Contract (Text ↔ Database Roundtrip)

The database is the source of truth. Text files are generated views. The roundtrip must be lossless.

### 5.1 `session_cache.md` (Generated)

```markdown
# Session Cache

*Created: YYYY-MM-DD HH:MM:SS IST*  
*Last Updated: YYYY-MM-DD HH:MM:SS IST*

**Started**: <timestamp> IST
**Focus Task**: <task_id>: <title>
**Session File**: `sessions/<date>-<period>.md`
**Status**: 🔄 Active: N, Paused: N, Completed: N

## Overview

- Active: N | Paused: N | Completed: N
- Last Session: <date>
- Current Period: <period>
```

**Parser extracts:**
- `focus_task` from `**Focus Task**:` line (extracts `T\d+` if present)
- `active_tasks_count`, `paused_tasks_count`, `completed_tasks_count` from `Active: N | Paused: N | Completed: N`
- `session_id` = `'current'` (singleton)

### 5.2 `tasks.md` (Generated)

```markdown
| ID | Title | Status | Priority | Started | Dependencies | Details |
|----|-------|--------|----------|---------|--------------|---------|
```

**Parser extracts:**
- `id`, `title`, `status`, `priority`, `started` from table rows
- `last_updated` from `*Last Updated:*` in individual task files (preferred) or `tasks.md` metadata
- `details` from task file body

### 5.3 `sessions/*.md` (Generated)

```markdown
# Session: <date> <Period>

**Started**: <timestamp>
**Focus Task**: <task_id>: <title> or None
**Status**: 🔄/✅ ACTIVE/COMPLETED
```

**Parser extracts:**
- `session_date` from filename or heading
- `session_period` from filename or heading
- `focus_task` from `**Focus Task**:` line
- `content` from `## Work Done` section
- `status` from `**Status**:` line
- `start_time` from `**Started**:` line

---

## 6. Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | 2025-11-13 | Initial schema (Phase A) — used `updated`, `date`, `period`, `focus` |
| 1.1 | 2026-06-25 | **BREAKING:** Renamed columns to `last_updated`, `session_date`, `session_period`, `focus_task`, `content`. Added `task_subtasks` table. Added `start_time`, `end_time` to `sessions`. |

---

## 7. Checklist for Agents

When writing or reviewing DB-related code, verify:

- [ ] Schema uses `last_updated`, not `updated`
- [ ] Schema uses `session_date`, not `date`
- [ ] Schema uses `session_period`, not `period`
- [ ] Schema uses `focus_task`, not `focus`
- [ ] Schema uses `content`, not `notes`
- [ ] `task_subtasks` table exists
- [ ] `sessions` has `start_time` and `end_time`
- [ ] Parsers use `DELETE FROM`, not `DROP TABLE`
- [ ] Regeneration scripts SELECT canonical column names
- [ ] Test data matches canonical schema
- [ ] `mb-cli init --database` copies the correct schema.sql

---

*End of Reference. If you find a file that contradicts this document, open a bug against it.*
