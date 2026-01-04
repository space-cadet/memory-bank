# Session Management Workflow

*Created: 2026-01-04 11:41:24 IST*
*Last Updated: 2026-01-04 11:41:24 IST*

**Source**: integrated-rules-v6.11.md section 6.4

## Overview

This workflow defines how to create, manage, and maintain session files that track work across multiple AI assistant sessions.

## Steps

1. **Check if session file exists**
   - Look for session file in format: `sessions/YYYY-MM-DD-PERIOD.md`
   - Check what work has been done in previous sessions
   - Understand the current state of ongoing tasks

2. **If session file exists: Update it**
   - Preserve all existing context and content
   - Add new sections for current session work
   - Update timestamps to reflect current work
   - Never delete or remove existing information
   - Use append-only approach for modifications

3. **If session file doesn't exist: Create it**
   - Create new file in `/memory-bank/sessions/` directory
   - Use format: `YYYY-MM-DD-PERIOD.md` (e.g., `2026-01-04-morning.md`)
   - Use session template from `/memory-bank/templates/`
   - Include created and last updated timestamps

4. **Update `session_cache.md`**
   - Record current session metadata
   - Update active task list and status
   - Document key focus and work completed
   - Update "Session History" section with latest session
   - Maintain chronological order

5. **Maintain chronological order**
   - Sessions should be dated and timestamped
   - Keep sessions organized by date
   - Document progression of work over time

6. **Preserve all historical records**
   - Never delete past session files
   - Maintain complete history of all sessions
   - Use archive directory for old sessions if needed
   - Keep edit history and error logs intact

## Session File Format

```markdown
# Session [DATE] - [PERIOD]
*Created: YYYY-MM-DD HH:MM:SS IST*
*Last Updated: YYYY-MM-DD HH:MM:SS IST*

## Focus Task
[TASK ID]: [BRIEF DESCRIPTION]
**Status**: [STATUS EMOJI + STATE]

## Active Tasks
### [TASK ID]: [TASK TITLE]
**Status**: [STATUS EMOJI + STATE]
**Progress**:
1. ✅ [COMPLETED THIS SESSION]
2. 🔄 [IN PROGRESS]
3. ⬜ [PLANNED]

## Context and Working State
[ESSENTIAL CONTEXT FOR THIS SESSION]

## Critical Files
- `[FILE1]`: [RELEVANCE]
- `[FILE2]`: [RELEVANCE]

## Session Notes
[IMPORTANT DECISIONS OR OBSERVATIONS]
```

## Session Periods

Use these standard periods for session file naming:
- `morning` (6 AM - 12 PM)
- `afternoon` (12 PM - 6 PM)
- `evening` (6 PM - 12 AM)
- `night` (12 AM - 6 AM)

## See Also

- `/memory-bank/protocols/memory-bank-update-workflow.md` - Update protocol after session
- `/memory-bank/session_cache.md` - Current session metadata
- `/memory-bank/templates/` - Session file template
- `/memory-bank/CLAUDE.md` - Overview and standards
