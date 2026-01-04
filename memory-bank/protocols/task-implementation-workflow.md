# Task Implementation Workflow

*Created: 2026-01-04 11:41:24 IST*
*Last Updated: 2026-01-04 11:41:24 IST*

**Source**: integrated-rules-v6.11.md section 6.1

## Overview

This workflow defines the process for implementing tasks within the Memory Bank system. Follow these steps when working on a defined task.

## Steps

1. **Define task in `tasks.md`**
   - Add task to the appropriate task registry
   - Include description, status, priority, and dependencies
   - Use standard emoji status indicators

2. **Create individual task file**
   - Create `/memory-bank/tasks/T[ID].md` with task details
   - Include completion criteria, related files, and progress tracking
   - Use the task template from `/memory-bank/templates/task-template.md`

3. **Implement ONLY outlined items**
   - Strictly follow the task scope and completion criteria
   - Do not extend scope without explicit approval
   - Document what was implemented

4. **Validate against completion criteria**
   - Verify all completion criteria have been met
   - Check that implementation matches task requirements
   - Mark progress in individual task file

5. **Update session cache**
   - Update `/memory-bank/session_cache.md` with task progress
   - Update task status and timestamp
   - Record key accomplishments for this session

6. **Document in edit history**
   - Update `/memory-bank/edit_history.md` with changes made
   - Include task ID, timestamp, and file modifications
   - Use prepend-only format (add new entries at top)

## See Also

- `/memory-bank/protocols/memory-bank-update-workflow.md` - Complete update workflow after task completion
- `/memory-bank/templates/task-template.md` - Task file template
- `/memory-bank/CLAUDE.md` - Overview and key files reference
