# Memory Bank Database API Reference

## workflow.js

### recordSessionWork(options)

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| task_id | string | Yes | - | Task ID (T1, T2, etc.) |
| task_description | string | Yes | - | Brief description of work |
| files_modified | Array | No | [] | Files changed with action/path/description |
| task_status | string | No | null | New status: in_progress, completed, paused |
| session_period | string | No | 'morning' | morning, afternoon, evening, night |
| session_notes | string | No | '' | Additional session notes |
| output_dir | string | No | 'memory-bank' | Base directory for output |
| tasks_dir | string | No | null | Directory for individual task files |
| sessions_dir | string | No | null | Directory for session files |
| edits_dir | string | No | null | Directory for edit chunks |

**Returns:** `{ entry_id, session_id, files_regenerated, duration_ms, transaction_id }`

### completeSessionWork(sessionId, notes, options)

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| sessionId | string | Yes | - | Session ID from recordSessionWork |
| notes | string | No | null | Completion notes |
| options.output_dir | string | No | 'memory-bank' | Base directory |
| options.tasks_dir | string | No | null | Task files directory |
| options.sessions_dir | string | No | null | Session files directory |
| options.edits_dir | string | No | null | Edit chunks directory |

### quickLog(options)

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| task_id | string | Yes | - | Task ID |
| description | string | Yes | - | Change description |
| file_path | string | Yes | - | File that changed |
| action | string | No | 'Modified' | Created, Modified, Updated, Deleted |

## inserts.js

### insertEditEntry(data)
Insert edit entry with file modifications (atomic transaction).

### upsertTask(data)
Create or replace a task item.

### updateTaskStatus(taskId, newStatus, detailsUpdate)
Update task status. Auto-creates task if it doesn't exist.

### addTaskDependency(taskId, dependsOn)
Add a task dependency.

### addTaskSubtasks(taskId, subtasks)
Add/replace task subtasks (checklist items).

### createSession(data)
Create a new session. Auto-generates ID if not provided.

### completeSession(sessionId, notes)
Mark a session as completed.

### updateSessionCache(data)
Update session cache singleton row.

### getTaskCounts()
Get current task counts by status.

### getTasksWithSubtasks()
Get all tasks with their subtasks.

### getEditEntriesWithMods(dateFrom, dateTo)
Get edit entries with modifications for a date range.

## regenerate.js

### regenerateAll(paths)
Regenerate all markdown files in one call.

### regenerateEditHistory(outputPath)
Regenerate edit_history.md from database.

### regenerateTasks(outputPath)
Regenerate tasks.md from database.

### regenerateSessionCache(outputPath)
Regenerate session_cache.md from database.

### regenerateTaskFiles(tasksDir)
Generate individual task files from database.

### regenerateSessionFile(sessionsDir)
Generate session file from database.

### regenerateEditChunk(editsDir)
Generate edit chunk from most recent edit entry.
