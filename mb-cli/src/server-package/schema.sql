-- Phase A: Database-Native Memory Bank Update Workflow Schema
-- Created: 2025-11-13 18:00:00 IST
-- Updated: 2025-12-17 09:54:00 IST
-- Version: 1.0
-- Purpose: Clean schema for T21 workflow implementation

-- ============================================================================
-- CORE EDIT TRACKING TABLES
-- ============================================================================

-- Edit entries: High-level record of work sessions
CREATE TABLE IF NOT EXISTS edit_entries (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  date TEXT NOT NULL,                    -- YYYY-MM-DD
  time TEXT NOT NULL,                    -- HH:MM:SS
  timezone TEXT,                         -- IST, UTC, etc.
  timestamp TEXT NOT NULL,               -- ISO 8601 format
  task_id TEXT,                          -- T1, T2, T3, etc. (comma-separated if multiple)
  task_description TEXT NOT NULL,        -- Brief description of work
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_edit_entries_date ON edit_entries(date);
CREATE INDEX IF NOT EXISTS idx_edit_entries_task ON edit_entries(task_id);
CREATE INDEX IF NOT EXISTS idx_edit_entries_timestamp ON edit_entries(timestamp);

-- File modifications: Track which files changed in each edit
CREATE TABLE IF NOT EXISTS file_modifications (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  edit_entry_id INTEGER NOT NULL,
  action TEXT NOT NULL,                  -- Created, Updated, Modified, Deleted
  file_path TEXT NOT NULL,
  description TEXT NOT NULL,             -- What changed and why
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (edit_entry_id) REFERENCES edit_entries(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_file_modifications_entry ON file_modifications(edit_entry_id);
CREATE INDEX IF NOT EXISTS idx_file_modifications_path ON file_modifications(file_path);
CREATE INDEX IF NOT EXISTS idx_file_modifications_action ON file_modifications(action);

-- ============================================================================
-- TASK MANAGEMENT TABLES
-- ============================================================================

-- Task items: Individual task records
CREATE TABLE IF NOT EXISTS task_items (
  id TEXT PRIMARY KEY,                   -- T1, T2, T3, etc.
  title TEXT NOT NULL,
  status TEXT NOT NULL,                  -- in_progress, completed, paused, blocked
  priority TEXT NOT NULL,                -- HIGH, MEDIUM, LOW
  started TEXT NOT NULL,                 -- YYYY-MM-DD
  details TEXT,                          -- Description and context
  last_updated TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_task_items_status ON task_items(status);
CREATE INDEX IF NOT EXISTS idx_task_items_priority ON task_items(priority);

-- Task dependencies: Track which tasks depend on others
-- Note: No foreign keys - dependencies may reference tasks outside this dataset
CREATE TABLE IF NOT EXISTS task_dependencies (
  task_id TEXT NOT NULL,
  depends_on TEXT NOT NULL,
  PRIMARY KEY (task_id, depends_on)
);

-- Task subtasks: Extracted checklists from individual task files (memory-bank/tasks/*.md)
CREATE TABLE IF NOT EXISTS task_subtasks (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  task_id TEXT NOT NULL,
  section TEXT,
  position INTEGER NOT NULL,
  text TEXT NOT NULL,
  checked INTEGER NOT NULL CHECK(checked IN (0, 1)),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (task_id) REFERENCES task_items(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_task_subtasks_task_id ON task_subtasks(task_id);

-- ============================================================================
-- SESSION MANAGEMENT TABLES
-- ============================================================================

-- Sessions: Individual work sessions
CREATE TABLE IF NOT EXISTS sessions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  session_date TEXT NOT NULL,            -- YYYY-MM-DD
  session_period TEXT NOT NULL,          -- morning, afternoon, evening, night
  focus_task TEXT,                       -- Task ID being focused on
  start_time TIMESTAMP NOT NULL,
  end_time TIMESTAMP,
  status TEXT NOT NULL,                  -- in_progress, completed
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (focus_task) REFERENCES task_items(id)
);

CREATE INDEX IF NOT EXISTS idx_sessions_date ON sessions(session_date);
CREATE INDEX IF NOT EXISTS idx_sessions_period ON sessions(session_period);
CREATE INDEX IF NOT EXISTS idx_sessions_focus_task ON sessions(focus_task);
CREATE INDEX IF NOT EXISTS idx_sessions_status ON sessions(status);

-- Session cache: Current session snapshot for quick lookup
CREATE TABLE IF NOT EXISTS session_cache (
  id INTEGER PRIMARY KEY,
  current_session_id INTEGER,
  current_focus_task TEXT,
  active_count INTEGER DEFAULT 0,        -- Number of in_progress tasks
  paused_count INTEGER DEFAULT 0,        -- Number of paused tasks
  completed_count INTEGER DEFAULT 0,     -- Number of completed tasks
  last_updated TIMESTAMP,
  FOREIGN KEY (current_session_id) REFERENCES sessions(id),
  FOREIGN KEY (current_focus_task) REFERENCES task_items(id)
);

-- ============================================================================
-- ERROR TRACKING TABLE
-- ============================================================================

-- Error logs: Track errors encountered during work
CREATE TABLE IF NOT EXISTS error_logs (
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

CREATE INDEX IF NOT EXISTS idx_error_logs_timestamp ON error_logs(timestamp);
CREATE INDEX IF NOT EXISTS idx_error_logs_task ON error_logs(task_id);

-- ============================================================================
-- TRANSACTION AUDIT LOG (Optional but recommended)
-- ============================================================================

-- Transaction log: Audit trail of database operations
CREATE TABLE IF NOT EXISTS transaction_log (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  transaction_id TEXT UNIQUE NOT NULL,
  timestamp TIMESTAMP NOT NULL,
  operation_type TEXT NOT NULL,         -- schema_expansion, insert_entries, regenerate_text, etc.
  affected_tables TEXT,                  -- Comma-separated list of tables affected
  row_count INTEGER,                     -- Rows inserted/updated/deleted
  status TEXT NOT NULL,                  -- success, failed, rolled_back
  error_message TEXT,
  duration_ms INTEGER,                   -- How long operation took
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_transaction_log_timestamp ON transaction_log(timestamp);
CREATE INDEX IF NOT EXISTS idx_transaction_log_type ON transaction_log(operation_type);
CREATE INDEX IF NOT EXISTS idx_transaction_log_status ON transaction_log(status);
