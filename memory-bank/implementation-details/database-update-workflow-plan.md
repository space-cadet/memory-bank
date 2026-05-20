# Database-Native Memory Bank Update Workflow

*Created: 2025-11-13 17:46:43 IST*
*Last Updated: 2026-05-21 02:51:53 IST*

## Executive Summary

This document defines a **database-first approach** to the Memory Bank update workflow (Section 6.5 of Integrated Rules v6.10). Instead of manually updating text files, users update the database directly, and text files are regenerated from the authoritative database state.

## Current Design Position (2026-05-21)

The main goal of the DB workflow is rapid recording of changes.

Current design split:
- `mb workflow` / `recordSessionWork()` is the fast path
  - minimal required input
  - append-style logging
  - auto-create missing task rows when needed
  - reuse same-period sessions cleanly
  - keep DB state and regenerated markdown in sync
- `completeSessionWork()` is the explicit closeout path
  - complete the session
  - update the focused task status by default
  - regenerate summaries after closeout

Phase E hardening completed the core behavior needed for this design:
- fixed generated-project bootstrap gaps
- fixed sql.js `:memory:` persistence
- fixed read-only overwrite risk via dirty-write gating
- fixed same-period session focus synchronization
- fixed direct `completeSessionWork()` DB discovery
- verified repeat `mb db test` passes in the real sibling fixture

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
  'IST',                  -- timezone from user/settings (nullable)
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

Supported action values: Created, Modified, Updated, Deleted

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

#### Phase E Testing Strategy

Use a dedicated isolated test project outside the canonical `mb-core` memory bank. The preferred fixture location is a sibling directory such as:

```text
/Users/deepak/code/memory-bank-test
```

This keeps DB-native verification separate from the canonical text-first memory bank while still exercising the real project-relative CLI/template path.

#### Phase E Setup Flow

```bash
# Create isolated test project
mkdir -p /Users/deepak/code/memory-bank-test
cd /Users/deepak/code/memory-bank-test

# Initialize memory bank with DB workflow support
node /Users/deepak/code/mb-core/mb-cli/src/index.js init --database
node /Users/deepak/code/mb-core/mb-cli/src/index.js db init
```

#### Phase E Core End-to-End Checks

1. Fresh project bootstrap
   - `mb init --database` creates `memory-bank/database/lib/` with the copied workflow library
   - `mb db init` creates a usable `memory_bank.db`

2. First workflow execution
   - `mb workflow --task ... --description ...` inserts DB records
   - regenerates `edit_history.md`, `tasks.md`, `session_cache.md`
   - preserves canonical session markdown naming: `sessions/YYYY-MM-DD-period.md`

3. Repeat workflow execution in same project
   - second and third `mb workflow` runs append/edit state correctly
   - transaction log accumulates entries
   - task state transitions remain consistent

4. Session handling
   - multiple sessions in the same period generate unique internal session IDs
   - session IDs follow `YYYY-MM-DD-period-HHMMSS-shorthash`
   - canonical text workflow remains stable even as DB session IDs become more specific

5. Extended regeneration coverage
   - individual task files under `memory-bank/tasks/`
   - session file under `memory-bank/sessions/`
   - edit chunk under `memory-bank/edits/YYYY-MM-DD/`

6. Data integrity verification
   - database rows match regenerated markdown state
   - no duplicate or orphaned file modifications
   - session cache reflects current focus and task counts

7. Performance sanity check
   - normal workflow execution should stay comfortably sub-second on a small/medium fixture project
   - record representative timings for bootstrap and repeat workflow runs

#### Phase E Scenario Matrix

| Scenario | What to verify |
|----------|----------------|
| Fresh project | Init, schema creation, first workflow run succeeds |
| Existing project rerun | Workflow is repeatable without manual cleanup |
| Same-period repeat sessions | Unique DB session IDs, stable text session filename |
| Task lifecycle | `in_progress` -> `completed` and regeneration stay aligned |
| File modification logging | Actions + paths + descriptions round-trip correctly |
| Extended outputs | Task/session/edit-chunk files regenerate correctly |
| CLI template path | Generated project uses copied libs, not canonical repo fallback |

#### Phase E Pass Criteria

- `mb db test` passes in canonical `mb-core`
- isolated sibling test project passes the full bootstrap + workflow sequence
- DB state and regenerated markdown agree after repeated runs
- repeated same-period workflow runs keep `sessions`, `session_cache`, and regenerated session files synchronized
- direct `completeSessionWork()` works without a manual `openDb()` call
- canonical text workflow structure remains unchanged
- no schema-alignment errors appear in session/session_cache regeneration

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

- [x] Database schema supports all Section 6.5 operations
- [x] Insert functions handle all data types correctly
- [x] Regeneration produces valid markdown
- [x] Text output matches original formatting
- [x] Workflow completes in < 1 second (actual: ~38ms)
- [x] No data loss during migration
- [x] CLI integration seamless
- [x] End-to-end testing passes in isolated sibling test project

## CLI Integration (Completed 2026-05-18)

The DB-native workflow is now fully integrated into the mb-cli:

### Setup Flow
```bash
# 1. Initialize memory bank with database support
mb init --database

# 2. Initialize the database schema
mb db init

# 3. Record work using DB-native workflow
mb workflow --task T1 --description "What I did" \
  --files "Modified:src/index.js,Created:lib/util.js"
```

### What Gets Copied
`mb init --database` now copies the workflow library to the project:
- `memory-bank/database/lib/sqlite.js` — DB operations
- `memory-bank/database/lib/inserts.js` — Write operations
- `memory-bank/database/lib/regenerate.js` — Markdown generation
- `memory-bank/database/lib/workflow.js` — High-level API

### DB Library Resolution
The CLI resolves DB libraries in this priority:
1. **Project's `memory-bank/database/lib/`** — for per-project customization
2. **CLI's bundled templates** — for development/testing
3. **Legacy mb-core repo structure** — backward compatibility

### Commands Available
- `mb db query <sql>` — Execute SQL queries
- `mb db test` — Run integration tests
- `mb db init` — Initialize database schema
- `mb db workflow` — Record work (with all options)
- `mb workflow` — Top-level alias for `mb db workflow`

### Test Results (mac-process-monitor project)
- Full workflow execution: **38ms**
- Files regenerated: `edit_history.md`, `tasks.md`, `session_cache.md`
- DB entry created with 6 file modifications
- Transaction logged: `tx-1779119193774`

## Related Tasks

- **T20**: Database parser implementation (Phase 3) ✅
- **T20a**: Adaptive LLM format parser (Design phase) ✅
- **T13**: CLI integration (Phase 4) ✅
- **T17**: Rules maintenance (incorporate new workflow) 🔄
- **T25**: Standalone Node Package (Browser-First) ✅ COMPLETED

## Next Steps

1. Keep the DB workflow optimized for fast work logging through `mb workflow`
2. Treat `completeSessionWork()` as the explicit closeout step that finalizes session state and summaries
3. Keep canonical text docs and generated template copies aligned whenever workflow logic changes
4. Fold any future DB workflow cleanup or UX refinements into separate follow-up tasks instead of reopening the Phase E acceptance gate

## Phase E Result (2026-05-21)

Phase E is now functionally complete for the DB-native workflow path.

The main design position is simple: the DB workflow exists to support rapid recording of changes. The fast path is `mb workflow` / `recordSessionWork()`, which now auto-creates missing task rows, keeps same-period session reuse synchronized, and regenerates the text artifacts after each write. The explicit closeout path is `completeSessionWork()`, which now discovers the DB path for itself, updates the focused task status by default, and regenerates the final session/task/cache views.

The hardening pass completed on 2026-05-21 closed the main reliability gaps exposed by the sibling-fixture test project:

- fixed sql.js `:memory:` handling so test runs stay isolated instead of persisting to a literal `:memory:` file
- added dirty-write persistence gating so read-only opens do not overwrite newer DB state on close
- fixed repeated same-period workflow updates so `sessions.focus`, `session_cache`, and regenerated session files stay aligned
- fixed direct `completeSessionWork()` usage so callers do not need to manually open the DB first
- verified the generated-project path in the real sibling fixture at `/Users/deepak/code/memory-bank-test`, including running `mb db test` twice in a row successfully

The canonical text workflow remains in place, but the DB-native workflow is now reliable enough for rapid-recording use without the earlier bootstrap and repeat-run failures.
