# Error Handling Workflow

*Created: 2026-01-04 11:41:24 IST*
*Last Updated: 2026-01-04 11:41:24 IST*

**Source**: integrated-rules-v6.11.md section 6.2

## Overview

This workflow defines how to handle, document, and resolve errors encountered during task implementation.

## Steps

1. **Log error in `errorLog.md`**
   - Record the error with timestamp and task ID
   - Include file path where error occurred
   - Document the error message and cause
   - Use error log template format

2. **Check related session files**
   - Review relevant session file for context
   - Check what was happening when error occurred
   - Identify any patterns or related errors

3. **Verify operation prerequisites**
   - Confirm all required files exist
   - Check that dependencies are in place
   - Verify permissions and access

4. **Request approval for corrections**
   - Do not modify files without explicit user approval
   - Document what needs to be fixed and why
   - Present the proposed solution
   - Wait for user confirmation before proceeding

5. **Document resolution**
   - Update `/memory-bank/errorLog.md` with fix applied
   - Record the changes made to resolve the issue
   - Update session file with resolution details
   - Update edit history with error fix entry

## Error Log Entry Format

```
## [Date Time]: [Task ID] - [Error Title]
**File:** `[file path]`
**Error:** `[Message]`
**Cause:** [Brief explanation]
**Fix:** [Steps taken]
**Changes:** [Key code changes]
**Task:** [Task ID]
```

## See Also

- `/memory-bank/protocols/memory-bank-update-workflow.md` - File update process
- `/memory-bank/errorLog.md` - Central error log
- `/memory-bank/CLAUDE.md` - Overview and standards
