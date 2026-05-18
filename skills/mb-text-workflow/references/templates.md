# Memory Bank File Templates (v6.12)

## Individual Task File (tasks/Txx.md)

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

## Task Registry (tasks.md)

```markdown
# Task Registry
*Created: YYYY-MM-DD HH:MM:SS TZ*
*Last Updated: YYYY-MM-DD HH:MM:SS TZ*

## Active Tasks
| ID | Title | Status | Priority | Started | Dependencies | Details |
|----|-------|--------|----------|---------|--------------|---------|
| T1 | [Title] | 🔄 | HIGH | 2025-04-10 | - | [Details](tasks/T1.md) |

**Allowed Status Values:**
- `🔄` (In Progress)
- `✅` (Completed)
- `⏸️` (Paused)
- `❌` (Cancelled)

## Completed Tasks
| ID | Title | Completed | Related Tasks | Archive |
|----|-------|-----------|---------------|---------|
| T0 | Setup | 2025-04-07 | - | [Details](archive/T0.md) |
```

## Session File (sessions/YYYY-MM-DD-PERIOD.md)

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

## Session Cache (session_cache.md)

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
- Current Period: [morning/afternoon/evening/night]

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

## Edit Chunk (edits/YYYY-MM-DD/HHMMSS-Txx.md)

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

## Edit History (edit_history.md)

```markdown
# Edit History
*Created: YYYY-MM-DD HH:MM:SS TZ*
*Last Updated: YYYY-MM-DD HH:MM:SS TZ*

### YYYY-MM-DD

#### HH:MM:SS TZ - Txx: Description
- Modified `file/path` - Description
```

## Error Log (errorLog.md)

```markdown
# Error Log
*Created: YYYY-MM-DD HH:MM:SS TZ*
*Last Updated: YYYY-MM-DD HH:MM:SS TZ*

## [Date Time]: [Task ID] - [Error Title]
**File:** `[file path]`
**Error:** `[Message]`
**Cause:** [Brief explanation]
**Fix:** [Steps taken]
**Changes:** [Key code changes]
**Task:** [Task ID]
```
