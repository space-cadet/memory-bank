---
name: mb-db-workflow
description: Memory Bank database-native update workflow using SQLite + markdown regeneration. Use when working with projects that have the DB-native workflow set up (memory-bank/database/). Replaces the 8-step manual workflow with atomic DB operations + file regeneration. NOT for text-only projects (use mb-text-workflow instead). Triggers on phrases like "db workflow", "database memory bank", "record session work", "regenerate memory bank", "memory bank database".
---

# Memory Bank Database-Native Workflow (v6.12)

## Overview

This skill implements the database-native memory bank update workflow. Instead of manually editing 5+ markdown files, you make atomic DB writes and regenerate all files in one call.

## Documentation Philosophy

The memory bank has two complementary documentation layers:

**Chronological Layer** (tells the story):
- Edit entries — precise record of every file change
- Task items — what was done, when, current status
- Sessions — work completed in each session
- These answer: "What happened? When? In what order?"

**Knowledge Layer** (stores the understanding):
- Implementation docs — architecture, design decisions, APIs, patterns
- Technical context — system architecture, dependencies, constraints
- Product context — goals, user stories, feature specifications
- These answer: "How does this work? Why was it built this way? How do I use it?"

Both layers are essential. The chronological layer without the knowledge layer becomes an unreadable pile of session logs. The knowledge layer without the chronological layer loses traceability and becomes stale. They must be maintained together.

**CRITICAL:** The DB workflow automates the chronological layer (edit_history, tasks, sessions, edit chunks). The knowledge layer (implementation docs, tech context, product context) must still be maintained manually. Never skip it.

## When to Use

- Project has `memory-bank/database/` with SQLite schema
- You want to replace manual 8-step workflow with atomic operations
- Working with the `recordSessionWork()` or `completeSessionWork()` functions
- Regenerating markdown files from database state

## Architecture

```
Agent Work → DB Writes → Regenerate → Markdown Files
     ↑            ↓           ↓
   edit entry  SQLite    regenerateAll()
   task status   .db     edit_history.md
   session       ↓       tasks.md
   cache                 session_cache.md
                         tasks/T*.md
                         sessions/*.md
                         edits/*/*.md
```

## Core Functions

### recordSessionWork()

Single function that replaces the entire 8-step manual workflow.

```javascript
import { recordSessionWork } from './lib/workflow.js';

const result = await recordSessionWork({
  task_id: 'T3',
  task_description: 'Implemented feature X',
  files_modified: [
    { action: 'Created', path: 'src/feature.js', description: 'Core feature logic' },
    { action: 'Modified', path: 'src/app.js', description: 'Integrated feature' }
  ],
  task_status: 'in_progress',      // optional: update task status
  session_period: 'afternoon',     // morning | afternoon | evening | night
  session_notes: 'Key decisions...', // optional
  output_dir: 'memory-bank',       // optional, default: memory-bank/
  tasks_dir: 'memory-bank/tasks',  // optional, for individual task files
  sessions_dir: 'memory-bank/sessions', // optional, for session files
  edits_dir: 'memory-bank/edits'   // optional, for edit chunks
});

// Returns:
// {
//   entry_id: 42,
//   session_id: 'sess-2026-05-18-afternoon-...',
//   files_regenerated: ['editHistory', 'tasks', 'sessionCache'],
//   duration_ms: 35,
//   transaction_id: 'tx-1234567890'
// }
```

**What it does atomically:**
1. Inserts edit entry + file modifications into DB
2. Updates task status if provided
3. Creates/updates session record
4. Updates session cache with current counts
5. Regenerates all markdown files (core + extended)
6. Logs transaction for audit

### completeSessionWork()

Call when finishing work on a task.

```javascript
import { completeSessionWork } from './lib/workflow.js';

const result = await completeSessionWork(
  sessionId,                    // from recordSessionWork result
  'Completed feature X with tests',
  {
    output_dir: 'memory-bank',
    tasks_dir: 'memory-bank/tasks',
    sessions_dir: 'memory-bank/sessions',
    edits_dir: 'memory-bank/edits'
  }
);
```

### quickLog()

For quick single-file changes without full workflow.

```javascript
import { quickLog } from './lib/workflow.js';

await quickLog({
  task_id: 'T3',
  description: 'Fixed typo in README',
  file_path: 'README.md',
  action: 'Modified'
});
```

## Database Schema (Key Tables)

### edit_entries
- `id`, `date`, `time`, `timezone`, `timestamp`, `task_id`, `task_description`

### file_modifications
- `id`, `edit_entry_id`, `action`, `file_path`, `description`

### task_items
- `id`, `title`, `status`, `priority`, `started`, `updated`, `details`

### task_dependencies
- `task_id`, `depends_on`

### task_subtasks
- `task_id`, `section`, `position`, `text`, `checked`

### sessions
- `id`, `date`, `period`, `focus`, `status`, `content`, `start_time`, `end_time`

### session_cache
- `session_id`, `status`, `focus_task`, `active_tasks_count`, `paused_tasks_count`, `completed_tasks_count`

### Step 6: Update Knowledge-Layer Documentation (CRITICAL)

**This step is not automated by the DB workflow.** You must manually update implementation docs.

The DB workflow handles the chronological layer (edit entries, tasks, sessions, edit chunks). The knowledge layer must be maintained separately:

**When to update:**
- New feature or capability added → document how it works in implementation-details/
- API changed → update usage examples and signatures in techContext.md
- Architecture decision made → document the rationale in systemPatterns.md or implementation-details/
- Bug fixed with non-obvious root cause → document for future reference
- Pattern or convention established → document as project standard

**Files to consider:**
- `implementation-details/` — technical deep-dives, architecture decisions
- `techContext.md` — system architecture, dependencies, constraints
- `productContext.md` — goals, user stories, feature specifications
- `systemPatterns.md` — established patterns and conventions
- `activeContext.md` — current focus and recent decisions

**Documentation quality check:**
- Would a new developer understand how to use this feature from the docs alone?
- Are the examples current and runnable?
- Is the rationale for design decisions captured?
- Are there links between related docs?

**Anti-pattern:** "The DB workflow handled the memory bank update, so I'm done." The DB workflow only handles the chronological layer. The knowledge layer is equally important and requires manual attention.

## Regeneration Functions

### regenerateAll(paths)

Regenerates all markdown files from database.

```javascript
import { regenerateAll } from './lib/regenerate.js';

await regenerateAll({
  // Core files (required)
  editHistory: 'memory-bank/edit_history.md',
  tasks: 'memory-bank/tasks.md',
  sessionCache: 'memory-bank/session_cache.md',
  
  // Extended files (optional)
  tasksDir: 'memory-bank/tasks',       // generates tasks/T*.md
  sessionsDir: 'memory-bank/sessions',  // generates sessions/*.md
  editsDir: 'memory-bank/edits'         // generates edits/*/*.md
});
```

### Individual Functions

- `regenerateEditHistory(outputPath)` — edit_history.md
- `regenerateTasks(outputPath)` — tasks.md
- `regenerateSessionCache(outputPath)` — session_cache.md
- `regenerateTaskFiles(tasksDir)` — individual task files
- `regenerateSessionFile(sessionsDir)` — session files
- `regenerateEditChunk(editsDir)` — latest edit chunk

## Direct DB Operations

### Insert Functions (inserts.js)

```javascript
import * as inserts from './lib/inserts.js';

// Edit entries
await inserts.insertEditEntry({ date, time, timezone, task_id, task_description, modifications });

// Tasks
await inserts.upsertTask({ id, title, status, priority, started, details });
await inserts.updateTaskStatus(taskId, newStatus, detailsUpdate);
await inserts.addTaskDependency(taskId, dependsOn);
await inserts.addTaskSubtasks(taskId, subtasks);

// Sessions
await inserts.createSession({ id, date, period, focus, status, content });
await inserts.completeSession(sessionId, notes);
await inserts.updateSessionCache({ current_focus_task, active_tasks_count, ... });

// Utilities
await inserts.getTaskCounts();
await inserts.getTasksWithSubtasks();
await inserts.getEditEntriesWithMods(dateFrom, dateTo);
```

## Workflow Comparison

| Aspect | Text-Based (mb-text-workflow) | DB-Native (mb-db-workflow) |
|--------|------------------------------|---------------------------|
| Files edited manually | 5-8 markdown files | SQLite DB only |
| Atomicity | Manual, error-prone | Transaction-wrapped |
| Speed | ~5 minutes | ~35ms |
| Consistency | Human-dependent | Deterministic |
| Audit trail | Manual | Automatic transaction_log |
| Setup | None | Requires DB schema |

## Setup Requirements

1. SQLite database initialized with schema.sql
2. `lib/sqlite.js` for DB operations
3. `lib/inserts.js` for write operations
4. `lib/regenerate.js` for file generation
5. `lib/workflow.js` for the high-level API

## Anti-Patterns

- NEVER edit generated markdown files directly — they will be overwritten on next regeneration
- NEVER modify JSONL session files (read-only)
- NEVER auto-write to MEMORY.md/SOUL.md/USER.md/TOOLS.md/AGENTS.md
- NEVER skip transaction logging — it's the audit trail
- NEVER use DB workflow in projects without the schema set up
- NEVER assume the DB workflow handles all documentation — it only automates the chronological layer. The knowledge layer (implementation docs, tech context, product context) must still be maintained manually
- NEVER say "I'll document it later" — later never comes. Document while the context is fresh

## Error Handling

The DB workflow handles these gracefully:
- Missing `task_subtasks` table → skips subtask generation
- Missing `start_time`/`end_time` columns → uses fallback query
- Missing task on status update → auto-creates the task
- Missing session ID → auto-generates one

## References

- [v6.12 Full Rules](references/integrated-rules-v6.12.md) — Complete integrated rules
- [DB Schema](references/schema.sql) — Full database schema
- [API Reference](references/api-reference.md) — All functions documented
