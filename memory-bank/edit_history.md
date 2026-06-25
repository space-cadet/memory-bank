# Edit History

*Last Updated: 2026-06-25 06:17:48 IST*

---

## 2026-06-25

#### 06:11:50 IST - T21: Fixed three template-level issues in DB-native workflow: (1) added missing task_subtasks table to schema.sql, (2) changed all parsers from DROP TABLE to DELETE FROM to preserve schema columns, (3) switched init-schema.js from better-sqlite3 to sql.js for VPS compatibility. All verified with full parse→regenerate cycle.
- Modified `database/schema.sql` - Added CREATE TABLE task_subtasks + index (lines 45-55)
- Modified `database/parse-tasks.js` - DROP TABLE → DELETE FROM for task tables
- Modified `database/parse-edits.js` - DROP TABLE → DELETE FROM for edit tables
- Modified `database/parse-sessions.js` - DROP TABLE → DELETE FROM for sessions table
- Modified `database/parse-session-cache.js` - DROP TABLE → DELETE FROM for session_cache table
- Modified `database/init-schema.js` - Switched from better-sqlite3 to sql.js via lib/sqlite.js

#### 18:32:00 IST - T21: Discovered critical column name mismatch between schema.sql and inserts.js/workflow.js templates. Schema defines `last_updated`, `session_date`, `session_period`, `focus_task` but inserts.js still references `updated`, `date`, `period`, `focus`. This affects ALL DB-native projects initialized from these templates. The `mb-cli init` command uses project-local lib files, not templates, so stale copies persist even after template fixes. Additionally, `regenerate.js` has ~10 references to old column names. Timesarrow repo also has `sessions.id INTEGER` vs template `sessions.id TEXT`, and `sessions.notes` vs template `sessions.content`.
- Identified `mb-cli/templates/memory-bank/database/lib/inserts.js` - uses `updated` instead of `last_updated` (lines 89, 97, 123, 133, 141); `createSession` uses `date`, `period`, `focus` instead of `session_date`, `session_period`, `focus_task` (line 212); `completeSession` uses `content` instead of `notes` (line 234)
- Identified `mb-cli/templates/memory-bank/database/lib/workflow.js` - queries use `date`, `period`, `focus` (lines 110-130); `completeSessionWork` uses `focus` (lines 272, 279, 286-294)
- Identified `mb-cli/templates/memory-bank/database/lib/regenerate.js` - uses `updated` (lines 79, 121, 267, 426, 434), `date`/`period` (lines 223, 238, 239, 506, 509), `focus` (lines 411, 511)
- Identified `mb-core/memory-bank/database/lib/inserts.js` - stale copy with same issues as template
- Identified `mb-core/memory-bank/database/schema.sql` - stale copy with `updated`, `date`, `period`, `focus`
- Identified `mb-cli/src/server-package/schema.sql` - stale copy with same issues
- Identified `skills/mb-db-workflow/references/schema.sql` - stale copy with same issues
- Fixed `mb-cli/templates/memory-bank/database/schema.sql` - changed `updated` → `last_updated`, `date` → `session_date`, `period` → `session_period`, `focus` → `focus_task` (commit `a961805`)
- Fixed `mb-cli/templates/memory-bank/database/lib/inserts.js` - all SQL references updated to new column names
- Fixed `mb-cli/templates/memory-bank/database/lib/workflow.js` - all queries and function calls updated
- **Unresolved**: `regenerate.js` still has old column names; `mb-core/memory-bank/database/lib/` still stale; 4 schema.sql copies still need sync; `test-workflow.js` not checked; downstream repos (timesarrow, etc.) have broken lib files
- **Root cause**: No single source of truth. Four copies of schema in mb-core, plus each repo has its own lib/ copy. Fix was applied to template only, not propagated to other locations.
- **Proposed resolution**: (1) Fix regenerate.js column names, (2) Sync all 4 schema.sql copies in mb-core, (3) Sync mb-core/memory-bank/database/lib/ files, (4) Delete/replace stale lib files in all downstream repos, (5) Add CI test to verify schema + lib consistency on commit

