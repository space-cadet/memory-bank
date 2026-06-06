# Memory Bank Update Workflow

*Created: 2026-01-04 11:41:24 IST*
*Last Updated: 2026-01-04 11:41:24 IST*

**Source**: integrated-rules-v6.11.md section 6.5

## Overview

This is the canonical workflow for updating Memory Bank files after completing work in a session. Follow these 9 steps sequentially to ensure all documentation is properly updated.

## The 9-Step Protocol

### Step 0: Identify Relevant Task and Implementation Documentation Files

Review the work completed in current session and identify which files need updating:

- Review the work completed in current session
- Identify which task(s) were actively worked on
- Check `tasks/` directory to see which task files exist for these tasks
- Identify which task files in `memory-bank/tasks/` need to be updated
- Review `implementation-details/` directory to identify relevant documentation files
- Check which implementation-details files align with the work completed

**If no relevant task file exists:**
- Request user approval before creating a new task file
- Document which new task file needs to be created and why

**If no relevant implementation-details file exists:**
- Request user approval before creating a new implementation documentation file
- Document which new file needs to be created and why

Once identified (or permissions obtained to create), proceed to Step 1.

### Step 1: Determine Current System Time and Timezone

Get the current system time before updating files:

- Check local system time
- Ensure all timestamps are in IST timezone
- Use format: `YYYY-MM-DD HH:MM:SS IST`

Example: `2026-01-04 11:41:24 IST`

### Step 2: Update Task Files

Update task documentation with progress and status:

- Update individual task file (if applicable) with progress, status, and last active timestamp
- If task file does not exist, request user approval to create it
- After task file update, update `tasks.md` master registry with status changes and timestamps

**CRITICAL**: `tasks.md` MUST use strict table schema:
```
| ID | Title | Status | Priority | Started | Dependencies | Details |
```

**Status MUST use standard emojis:**
- `🔄` (In Progress)
- `✅` (Completed)
- `⏸️` (Paused)
- `❌` (Cancelled)

**Details column MUST be a link:**
- `[Details](tasks/Txx.md)` for active tasks
- `[Details](archive/Txx.md)` for archived tasks

### Step 3: Update Implementation Documentation

Update technical documentation related to the work:

- Update any relevant implementation-details files identified in Step 0
- Update technical context if architectural changes occurred
- Include timestamps in all documentation

### Step 4: Handle Session File

Create or update the session file for this work session:

- Check if current session file exists (format: `sessions/YYYY-MM-DD-PERIOD.md`)
- If session file exists: Update it while preserving all existing context
- If session file does not exist: create it
- Update session file with work completed, status changes, and key decisions

### Step 5: Update Session Cache

Update the active session metadata:

- Update `session_cache.md` with current session metadata
- Update task status in session cache
- Update "Session History" section if session file was new or modified
- Preserve all existing session history

### Step 6: Update Other Relevant Memory Bank Files

Update additional files as needed:

- Update `activeContext.md` if focus task changed
- Update `errorLog.md` if errors were encountered and fixed
- Update `progress.md` if milestones were completed
- Update `changelog.md` if features or bugs were addressed

### Step 7: Update Edit History

Record all file modifications in the edit history:

- PREPEND new entry to top of `edit_history.md`
- **CRITICAL**: Use STRICT regex-compatible format required by database parser
- Header format: `#### HH:MM:SS TZ - TaskID: Description` (Timezone is MANDATORY)
- Bullet format: `- Action `filepath` - Description`

**Action MUST be one of:**
- `Created` (for new files)
- `Modified` (for file edits)
- `Updated` (for file content updates)
- `Deleted` (for removed files)

**Filepath MUST be:**
- Wrapped in backticks
- Relative to project root
- Example: `memory-bank/protocols/memory-bank-update-workflow.md`

**Example entry:**
```
#### 11:41:24 IST - SETUP: Create protocol files
- Created `memory-bank/protocols/task-implementation-workflow.md` - Extracted task workflow
- Created `memory-bank/protocols/memory-bank-update-workflow.md` - Extracted update workflow
```

**Important:**
- No summary statements or evaluative content
- Keep technical descriptions focused
- One file action per bullet point

### Step 8: Generate Brief Commit Message

Create a Git commit message for this work:

- Format: `(type)TID: Headline - Details (% complete)`
- Type: Use conventional commits (feat, fix, docs, refactor, test)
- Include task ID in format
- Provide concise headline of what was accomplished
- Example: `(feat)T3: Database Migration Verification Complete - Documentation & Memory Bank Updated (90% complete)`

**Optional:**
- Include percentage completion at end
- Proceed with next action or complete workflow

## Common Patterns

### Quick Session Update

If only updating a few Memory Bank files:
1. Get timestamp
2. Update relevant files (steps 2-6 as needed)
3. Update edit history (step 7)
4. Create commit message (step 8)

### Major Task Completion

If completing a significant task:
1. Follow all 9 steps in order
2. Update task status to ✅ (Completed) or ⏸️ (Paused)
3. Archive task file if completed
4. Document all changes in edit history
5. Create comprehensive commit message

### Error Recovery

If errors occurred and were fixed:
1. Log error in errorLog.md (Step 6)
2. Document fix in edit history (Step 7)
3. Update session file with resolution (Step 4)
4. Create commit message noting fix (Step 8)

## Critical Requirements

- **Always use IST timezone** for all timestamps
- **Never skip edit history** - it's the audit trail
- **Preserve session history** - never delete old sessions
- **Request approval** before creating new task or implementation files
- **Use exact filepaths** relative to project root
- **Maintain table format** in tasks.md strictly

## See Also

- `/memory-bank/protocols/task-implementation-workflow.md` - Task creation and implementation
- `/memory-bank/protocols/session-management-workflow.md` - Session file management
- `/memory-bank/protocols/error-handling-workflow.md` - Error documentation
- `/memory-bank/protocols/file-update-workflow.md` - Safe file modifications
- `/memory-bank/CLAUDE.md` - Overview and standards
- `/integrated-rules-v6.11.md` - Comprehensive system documentation
