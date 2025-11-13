# Database-Native Memory Bank Update Workflow

*Created: 2025-11-13 17:46:43 IST*
*Last Updated: 2025-11-13 22:50:00 IST*

## Executive Summary

This document defines a **database-first approach** to the Memory Bank update workflow (Section 6.5 of Integrated Rules v6.10). Instead of manually updating text files, users update the database directly, and text files are regenerated from the authoritative database state.

**Paradigm Shift**: Text files transition from authoritative source to generated output.

## Architecture Overview

### Current Approach (Text → Database)
```
User edits text files
  ↓
Parse text to database (for analysis)
  ↓
Text is authoritative, database is derived
```

### New Approach (Database → Text)
```
User updates database (CLI/API)
  ↓
Database transaction commits
  ↓
Regenerate text files from database
  ↓
Database is authoritative, text is generated
```

## Database-Native Section 6.5 Workflow

### Phase 0: Pre-Update Setup (Preparation)

**Step 1: Determine System Time and Timezone**
```javascript
const timestamp = new Date().toLocaleString('en-US', {
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit',
  timeZone: 'Asia/Kolkata'  // IST
});
// Output: 2025-11-13 17:46:43 IST

const isoTimestamp = new Date().toISOString();
// Output: 2025-11-13T17:46:43.000Z
```

**Step 2: Verify Database Connection**
- Ensure memory_bank.db exists and is accessible
- Validate schema (all required tables present)
- Check write permissions

**Step 3: Gather Update Information**
- Collect work completed from user (task progress, file changes, etc.)
- Parse into structured format for database insertion

### Phase 1: Database Update Operations

All operations within single database transaction for atomicity.

**Step 1: Create Edit History Entry**
```sql
INSERT INTO edit_entries (
  date,
  time,
  timezone,
  timestamp,
  task_id,
  task_description
) VALUES (
  '2025-11-13',           -- YYYY-MM-DD from system time
  '17:46:43',             -- HH:MM:SS from system time
  'IST',                  -- timezone from system
  '2025-11-13T17:46:43.000Z',  -- ISO 8601
  'T17, T20a',            -- Task IDs (comma-separated if multiple)
  'Rules documentation v6.8 → v6.10, Tiered Knowledge Structure'
)
```

**Step 2: Insert File Modifications**
```sql
INSERT INTO file_modifications (
  edit_entry_id,
  action,
  file_path,
  description
) VALUES (?, 'Updated', 'memory-bank/.cursorrules', 'Added tiered knowledge structure')
```

For each file changed during session.

**Step 3: Update Task Status (if changed)**
```sql
UPDATE task_items SET
  status = 'in_progress',
  last_updated = '2025-11-13T17:46:43.000Z'
WHERE task_id = 'T17'
```

**Step 4: Create Session Record (if new session)**
```sql
INSERT INTO sessions (
  session_date,
  session_period,
  focus_task,
  start_time,
  status
) VALUES (
  '2025-11-13',
  'evening',
  'T17',
  '2025-11-13T17:46:43.000Z',
  'in_progress'
)
```

**Step 5: Update Session Cache State (if completing session)**
```sql
UPDATE session_cache SET
  current_focus_task = 'T17',
  last_updated = '2025-11-13T17:46:43.000Z',
  active_count = (SELECT COUNT(*) FROM task_items WHERE status IN ('in_progress', 'paused'))
```

**Step 6: Insert Error Logs (if applicable)**
```sql
INSERT INTO error_logs (
  timestamp,
  task_id,
  file_path,
  error_message,
  cause,
  fix_applied
) VALUES (?, ?, ?, ?, ?, ?)
```

### Phase 2: Database Transaction Commit

**Step 1: Validate All Inserts**
- Count inserted rows for each table
- Verify foreign key relationships intact
- Check for constraint violations

**Step 2: Commit Transaction**
```sql
COMMIT;
```

**Step 3: Log Transaction Success**
- Record transaction ID
- Log timestamp and summary
- Store in transaction log

### Phase 3: Text File Regeneration

Once database is authoritative source, regenerate all text files.

**Step 1: Regenerate edit_history.md**
```javascript
// Query database
SELECT * FROM edit_entries 
  LEFT JOIN file_modifications ON edit_entries.id = file_modifications.edit_entry_id
  ORDER BY date DESC, time DESC

// Generate markdown structure
// ### YYYY-MM-DD
// #### HH:MM:SS TZ - TaskID: Description
// - Action `file_path` - description
```

**Step 2: Regenerate tasks.md**
```javascript
// Query database
SELECT * FROM task_items
  LEFT JOIN task_dependencies ON task_items.task_id = task_dependencies.task_id
  ORDER BY started DESC, priority DESC

// Generate table and details sections
// Update completed tasks section
```

**Step 3: Regenerate session_cache.md**
```javascript
// Query database
SELECT * FROM sessions
  LEFT JOIN task_items ON sessions.focus_task = task_items.task_id
  ORDER BY session_date DESC, session_start DESC

// Generate session metadata
// Update task registry snapshot
// Update session history (last 10)
```

**Step 4: Regenerate activeContext.md**
```javascript
// Query database current state
// Extract focus task and active tasks
// Generate context summary from recent sessions and tasks
```

**Step 5: Regenerate errorLog.md**
```javascript
// Query database
SELECT * FROM error_logs
  ORDER BY timestamp DESC

// Generate error entries with task references
```

**Step 6: Regenerate changelog.md**
```javascript
// Query database chronologically
// Generate feature/fix entries from all transactions
```

**Step 7: Write All Files to Disk**
- Use atomic write operations (write to temp, then rename)
- Preserve file structure and formatting
- Verify file sizes reasonable (no truncation)

### Phase 4: Validation and Logging

**Step 1: Verify Text Files Generated Correctly**
- Check all required sections present
- Validate markdown syntax
- Ensure data consistency between database and text

**Step 2: Update Edit History (Special Case)**
The edit_history.md now contains record of its own generation:
```
#### HH:MM:SS IST - T17: Database workflow applied
- Updated `memory-bank/database/` - Schema and regeneration complete
- Generated `memory-bank/edit_history.md` - Regenerated from database
- Generated `memory-bank/tasks.md` - Regenerated from database
- Generated `memory-bank/session_cache.md` - Regenerated from database
```

**Step 3: Log Workflow Execution**
- File modification counts
- Row counts inserted per table
- Regeneration times
- Validation results

**Step 4: Generate Commit Message**
Format: `(type)TID: Headline - Details (% complete)`
```
(feat)T20a: Database Update Workflow Applied - Session state synchronized, 7 files regenerated (95% complete)
```

## Database Schema Requirements

### Expanded Schema for Full Workflow

#### edit_entries table
```sql
CREATE TABLE edit_entries (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  date TEXT NOT NULL,
  time TEXT NOT NULL,
  timezone TEXT NOT NULL,
  timestamp TEXT NOT NULL,
  task_id TEXT,
  task_description TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### file_modifications table
```sql
CREATE TABLE file_modifications (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  edit_entry_id INTEGER NOT NULL,
  action TEXT NOT NULL,
  file_path TEXT NOT NULL,
  description TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (edit_entry_id) REFERENCES edit_entries(id)
);
```

#### task_items table
```sql
CREATE TABLE task_items (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  status TEXT NOT NULL,
  priority TEXT NOT NULL,
  started TEXT NOT NULL,
  last_updated TIMESTAMP,
  details TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### task_dependencies table
```sql
CREATE TABLE task_dependencies (
  task_id TEXT NOT NULL,
  depends_on TEXT NOT NULL,
  PRIMARY KEY (task_id, depends_on),
  FOREIGN KEY (task_id) REFERENCES task_items(id),
  FOREIGN KEY (depends_on) REFERENCES task_items(id)
);
```

#### sessions table
```sql
CREATE TABLE sessions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  session_date TEXT NOT NULL,
  session_period TEXT NOT NULL,
  focus_task TEXT,
  start_time TIMESTAMP NOT NULL,
  end_time TIMESTAMP,
  status TEXT NOT NULL,
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (focus_task) REFERENCES task_items(id)
);
```

#### session_cache table
```sql
CREATE TABLE session_cache (
  id INTEGER PRIMARY KEY,
  current_session_id INTEGER,
  current_focus_task TEXT,
  active_count INTEGER,
  paused_count INTEGER,
  completed_count INTEGER,
  last_updated TIMESTAMP,
  FOREIGN KEY (current_session_id) REFERENCES sessions(id),
  FOREIGN KEY (current_focus_task) REFERENCES task_items(id)
);
```

#### error_logs table
```sql
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
```

## Implementation Phases

### Phase A: Schema Expansion & Testing (Completed 2025-11-13 22:50:00 IST)
- [x] Created isolated workspace at `t21-workflow-testing/` for clean schema development
- [x] Designed and implemented 8-table schema: edit_entries, file_modifications, task_items, task_dependencies, sessions, session_cache, error_logs, transaction_log
- [x] Added 21 indexes for query performance
- [x] Created schema.sql with complete table definitions and foreign key constraints
- [x] Implemented dual initialization scripts: init-schema.js (better-sqlite3) and init-schema-sqljs.js (sql.js)
- [x] Added Node v20 specification and workspace configuration
- [x] Created SETUP.md documentation with quick start guide
- [x] Created comprehensive Phase A test suite (test-schema.js, 540 lines) with 4 validation suites
- [x] Implemented synthetic test data generator (generate-test-data.js, 380 lines)
- [x] Built Express.js API server (server.js, 270 lines) with 6 endpoints for database exploration
- [x] Created interactive HTML explorer (explorer.html, 480 lines + 450 lines enhancements)
- [x] Enhanced explorer with dark/light mode theming, dual view modes (Cards/Tables), filtering, sorting, state persistence
- [x] Fixed schema: removed FK constraints on task_dependencies for cross-dataset task references
- [x] All tests passing (100% validation), queries all sub-100ms, schema proven sound

### Phase B: Database Insert Functions (Planned - Next)
- [ ] `insertEditEntry(date, time, timezone, taskIds, description)`
- [ ] `insertFileModification(entryId, action, filePath, description)`
- [ ] `updateTaskStatus(taskId, newStatus, timestamp)`
- [ ] `createSession(sessionDate, period, focusTask)`
- [ ] `updateSessionCache(focusTask, timestamp)`
- [ ] `insertErrorLog(taskId, filePath, errorMsg, cause, fix)`
- [ ] Implementation location: `t21-workflow-testing/database/insert-functions.js`

### Phase C: Text Regeneration Functions (New - Part of T20)
- [ ] `regenerateEditHistory()`
- [ ] `regenerateTasks()`
- [ ] `regenerateSessionCache()`
- [ ] `regenerateActiveContext()`
- [ ] `regenerateErrorLog()`
- [ ] `regenerateChangelog()`

### Phase D: Workflow CLI Command (Part of T13)
- [ ] `mb workflow update-session` - Interactive prompt for session completion
- [ ] `mb workflow log-work` - Log specific file changes
- [ ] `mb workflow complete-task` - Mark task as complete
- [ ] `mb workflow sync` - Force database → text regeneration

### Phase E: Integration and Testing (Part of T20)
- [ ] End-to-end workflow testing
- [ ] Data integrity verification
- [ ] Text file validation
- [ ] Performance testing with large datasets

## Comparison: Text vs Database Workflow

### Text-Based (Current Section 6.5)
```
Workflow Steps: 8
Manual Files: 6
Error Risk: High (each file independent)
Update Time: ~5 minutes
Consistency: Manual (easy to miss updates)
```

### Database-Based (Proposed)
```
Workflow Steps: 4 (DB ops + regenerate + validate + commit)
Manual Files: 0 (auto-generated)
Error Risk: Low (atomic transaction)
Update Time: ~30 seconds
Consistency: Automatic (database enforces)
```

## Migration Strategy

### Step 1: Coexistence (Current State)
- Database exists alongside text files
- Text is authoritative
- Database generated from text

### Step 2: Parallel Operation (Phase B-C)
- Database schema expanded
- Both workflows supported
- Users can choose which to use

### Step 3: Transition (Phase D-E)
- Database workflow preferred
- Text files optional
- Can regenerate anytime

### Step 4: Database-First (Future)
- Database is authoritative
- Text files generated only for export/reading
- Database API is primary interface

## Benefits

1. **Atomicity**: Single transaction, all-or-nothing
2. **Consistency**: Database enforces constraints
3. **Simplicity**: Fewer manual steps
4. **Auditability**: Full transaction history
5. **Automation**: Regeneration is deterministic
6. **Flexibility**: Multiple CLI/API interfaces
7. **Scalability**: Database handles large datasets better

## Risks and Mitigations

| Risk | Mitigation |
|------|-----------|
| Data loss if database corrupted | Regular backups, schema validation |
| Text files out of sync with DB | Regenerate on every commit |
| Migration complexity | Phased approach, coexistence period |
| User confusion | Clear CLI help, workflow documentation |
| Performance if queries slow | Optimize indexes, cache common queries |

## Success Criteria

- [ ] Database schema supports all Section 6.5 operations
- [ ] Insert functions handle all data types correctly
- [ ] Regeneration produces valid markdown
- [ ] Text output matches original formatting
- [ ] Workflow completes in < 1 second
- [ ] No data loss during migration
- [ ] CLI integration seamless
- [ ] End-to-end testing passes

## Related Tasks

- **T20**: Database parser implementation (Phase 3)
- **T20a**: Adaptive LLM format parser (Design phase)
- **T13**: CLI integration (Phase 4)
- **T17**: Rules maintenance (incorporate new workflow)

## Next Steps

1. Review and approve this workflow plan
2. Expand database schema (Phase A)
3. Implement database insert functions (Phase B)
4. Implement text regeneration functions (Phase C)
5. Build CLI commands (Phase D)
6. End-to-end testing (Phase E)
