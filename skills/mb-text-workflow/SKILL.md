---
name: mb-text-workflow
description: Memory Bank text-based update workflow following integrated-rules v6.12. Use when updating memory bank files manually via markdown editing — creating edit chunks, updating tasks.md, session_cache.md, session files, and task files. NOT for database-native workflows (use mb-db-workflow instead). Triggers on phrases like "update memory bank", "create edit chunk", "update tasks.md", "update session cache", "memory bank update workflow".
---

# Memory Bank Text-Based Update Workflow (v6.12)

## Overview

This skill implements the 8-step manual memory bank update workflow from integrated-rules v6.12. All updates are done by directly editing markdown files — no database involved.

## When to Use

- Working in projects without the DB-native workflow set up
- Quick edits where DB overhead is unnecessary
- Debugging or fixing DB-generated files
- Projects using the classic text-based memory bank system

## Prerequisites

Before starting, determine:
1. Current system time and timezone (format: `YYYY-MM-DD HH:MM:SS TZ`)
2. Active task ID being worked on
3. Files modified and their change descriptions

## The 8-Step Workflow

### Step 1: Update Individual Task File

File: `memory-bank/tasks/Txx.md`

If the task file exists, append progress updates. If not, request user approval to create it.

Template:
```markdown
# Txx: [Title]

*Created: YYYY-MM-DD HH:MM:SS TZ*
*Last Updated: YYYY-MM-DD HH:MM:SS TZ*

**Status**: 🔄 **IN PROGRESS**
**Priority**: HIGH

## Details
[Brief description and context]

## Progress
1. ✅ [Completed item]
2. 🔄 [Current item]
3. ⬜ [Next item]

## Files
- `[file1]` - Description
- `[file2]` - Description
```

**Status emojis (STRICT):**
- 🔄 = In Progress
- ✅ = Completed
- ⏸️ = Paused
- ❌ = Cancelled

### Step 2: Update tasks.md Registry

File: `memory-bank/tasks.md`

Update the master task registry table. MUST use exact schema:

```markdown
| ID | Title | Status | Priority | Started | Dependencies | Details |
|----|-------|--------|----------|---------|--------------|---------|
| T1 | [Title] | 🔄 | HIGH | 2025-04-10 | - | [Details](tasks/T1.md) |
```

**Rules:**
- Details column MUST be a link: `[Details](tasks/Txx.md)` or `[Details](archive/Txx.md)`
- Status MUST use standard emojis only
- Keep active tasks at top, completed below

### Step 3: Update Implementation Documentation

Update any relevant files in `memory-bank/implementation-details/` if architectural changes occurred.

### Step 4: Handle Session File

File: `memory-bank/sessions/YYYY-MM-DD-PERIOD.md`

Check if current session file exists. If yes, append to it. If no, create it.

Template:
```markdown
# Session: YYYY-MM-DD [Period]

**Started**: YYYY-MM-DD HH:MM:SS TZ
**Focus Task**: Txx: [Title]
**Status**: 🔄 ACTIVE

## Work Done
- [Description of work completed]

## Decisions
- [Key decisions made]

## Next Steps
- [What to do next]
```

Periods: morning, afternoon, evening, night

### Step 5: Update Session Cache

File: `memory-bank/session_cache.md`

Template:
```markdown
# Session Cache
*Created: YYYY-MM-DD HH:MM:SS TZ*
*Last Updated: YYYY-MM-DD HH:MM:SS TZ*

## Current Session
**Started**: [Timestamp]
**Focus Task**: [Task ID]
**Session File**: `sessions/YYYY-MM-DD-PERIOD.md`

## Overview
- Active: [Count] | Paused: [Count]
- Last Session: [Previous Session File]
- Current Period: [period]

## Task Registry
- T1: [Brief] - 🔄

## Active Tasks
### [Task ID]: [Title]
**Status:** 🔄 **Priority:** [H/M/L]
**Started:** [Date] **Last**: [Date]
**Context**: [Key context]
**Files**: `[file1]`, `[file2]`
**Progress**:
1. ✅ [Done]
2. 🔄 [Current]
3. ⬜ [Next]

## Session History (Last 5)
1. `sessions/YYYY-MM-DD-PERIOD.md` - [BRIEF FOCUS]
```

### Step 6: Update Other Memory Bank Files

- `activeContext.md` — if focus task changed
- `errorLog.md` — if errors encountered
- `progress.md` — if milestones completed
- `changelog.md` — if features/bugs addressed

### Step 7: Create Edit Chunk

File: `memory-bank/edits/YYYY-MM-DD/HHMMSS-Txx-edit-chunk.md`

This is the canonical record. `edit_history.md` is a GENERATED VIEW — never edit it directly.

Template:
```markdown
---
kind: edit_chunk
id: [unique-id]
created_at: YYYY-MM-DD HH:MM:SS TZ
task_ids: [Txx]
source_branch: [branch-name]
source_commit: [40-char-sha]
---

#### HH:MM:SS TZ - Txx: Description
- Modified `file/path` - Specific technical change description
- Created `file/path` - What was created and why
```

**STRICT Format Requirements:**
- Header: `#### HH:MM:SS TZ - TaskID: Description` (timezone MANDATORY)
- Bullets: `- Action \`filepath\` - Description`
- Action MUST be one of: `Created`, `Modified`, `Updated`, `Deleted`
- Filepath MUST be in backticks AND relative to project root
- No summary statements or evaluative content

### Step 8: Regenerate edit_history.md

File: `memory-bank/edit_history.md`

This is a GENERATED VIEW from chunk files. Newest entries on top.

```markdown
# Edit History
*Created: YYYY-MM-DD HH:MM:SS TZ*
*Last Updated: YYYY-MM-DD HH:MM:SS TZ*

### YYYY-MM-DD

#### HH:MM:SS TZ - Txx: Description
- Modified `file/path` - Description
```

## Commit Message Format

```
(type)TID: Headline - Details (% complete)
```

Types: feat, fix, docs, refactor, test
Example: `(feat)T3: Database Migration Complete - Added user table, seed data (90%)`

## Anti-Patterns

- NEVER edit `edit_history.md` directly — always create chunk files
- NEVER use relative paths or tildes (~) — absolute paths only
- NEVER add features without user approval
- NEVER skip the edit chunk step — it's the canonical record
- NEVER delete session files — append-only

## References

- [v6.12 Full Rules](references/integrated-rules-v6.12.md) — Complete integrated rules
- [Templates](references/templates.md) — All file templates in one place
