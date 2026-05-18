---
kind: edit_chunk
id: 2026-05-18-2116-T25
created_at: 2026-05-18 21:16:33 IST
task_ids: [T25]
source_branch: main
source_commit: 3feab71
---

#### 21:16:33 IST - T25: Added DB-native workflow support to mb-cli
- Modified `mb-cli/src/commands/db.js` - Added resolveDbLibBase() with project-relative priority, exported workflowCommandStandalone
- Modified `mb-cli/src/commands/init.js` - Added WORKFLOW_LIB_FILES array, copy workflow lib files during --database init
- Modified `mb-cli/src/index.js` - Added top-level mb workflow command with full help text
- Created `mb-cli/templates/memory-bank/database/lib/inserts.js` - DB insert operations library
- Created `mb-cli/templates/memory-bank/database/lib/regenerate.js` - Markdown regeneration library
- Created `mb-cli/templates/memory-bank/database/lib/workflow.js` - High-level workflow API (recordSessionWork, completeSessionWork, quickLog)
