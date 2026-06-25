---
kind: edit_chunk
id: 2026-06-25-013300-T21
created_at: 2026-06-26 01:33:00 IST
task_ids: [T21]
source_branch: main
source_commit: pending
---

#### 01:33:00 IST - T21: Full schema consistency fix across mb-core
- Modified `memory-bank/database/schema.sql` - Updated to v1.1 canonical naming (last_updated, session_date, session_period, focus_task, content)
- Modified `memory-bank/database/lib/inserts.js` - All SQL and function params updated to canonical names
- Modified `memory-bank/database/lib/workflow.js` - All session queries and object references updated
- Modified `memory-bank/database/lib/regenerate.js` - All task/session queries and markdown generation updated
- Modified `memory-bank/database/parse-tasks.js` - last_updated in schema and INSERT
- Modified `memory-bank/database/parse-sessions.js` - session_date, session_period, focus_task throughout
- Modified `memory-bank/database/test-schema.js` - Fixed session_cache INSERT to match actual schema columns
- Modified `memory-bank/database/generate-test-data.js` - Updated sessionCache object to canonical keys
- Modified `mb-cli/src/commands/task.js` - updated -> last_updated in SELECT, UPDATE, and object creation
- Modified `mb-cli/src/commands/session.js` - date/period/focus -> session_date/session_period/focus_task throughout
- Modified `mb-cli/templates/memory-bank/database/schema.sql` - Added missing task_subtasks table
- Modified `mb-cli/templates/memory-bank/database/lib/regenerate.js` - Copied fixed canonical version
- Modified `mb-cli/templates/memory-bank/database/parse-tasks.js` - Copied fixed canonical version
- Modified `mb-cli/templates/memory-bank/database/parse-sessions.js` - Copied fixed canonical version
- Modified `skills/mb-db-workflow/references/schema.sql` - Updated to v1.1 canonical naming
- Created `memory-bank/implementation-details/schema-protocol-reference.md` - Single source of truth for v1.1 naming
- Created `memory-bank/implementation-details/schema-audit-2026-06-25.md` - Full file-by-file audit report
- Created `memory-bank/sessions/2026-06-25-night.md` - Session log for night work
- Deleted `mb-cli/src/server-package/` - Stale pre-sql.js snapshot with old column names
- Deleted `mb-cli/src/sync-database-template.js` - Would overwrite fixes on sync
- Modified `mb-cli/package.json` - Removed sync:database-template script
