# File Update Workflow

*Created: 2026-01-04 11:41:24 IST*
*Last Updated: 2026-01-04 11:41:24 IST*

**Source**: integrated-rules-v6.11.md section 6.3

## Overview

This workflow defines how to safely update files in the Memory Bank system while maintaining integrity and requiring appropriate approvals.

## Steps

1. **Check file existence**
   - Verify the file exists before attempting modifications
   - Use absolute paths (no relative paths or tildes)
   - Confirm you have proper access to the file

2. **Request modification approval**
   - Present the proposed changes to the user
   - Include what will be modified and why
   - Explain the impact of the changes
   - Wait for explicit approval before proceeding

3. **Make minimal changes**
   - Only modify what is explicitly outlined
   - Use Edit tool with exact old_string and new_string
   - Limit edits to 25-30 line chunks for clarity
   - Preserve existing formatting and structure

4. **Verify against validation rules**
   - Ensure changes comply with Memory Bank standards
   - Check that format requirements are met
   - Validate timestamps are in IST format: `YYYY-MM-DD HH:MM:SS IST`
   - Confirm no violations of system requirements

5. **Update session cache if needed**
   - If file modification is significant, update `session_cache.md`
   - Record what was changed and when
   - Update task status if applicable
   - Document in edit history

## Critical Requirements

- **Always use absolute paths**: `/Users/deepak/code/memory-bank/path/to/file`
- **No relative paths or tildes**: Don't use `~/` or `./` syntax
- **Timestamps mandatory**: Include `YYYY-MM-DD HH:MM:SS IST` format
- **Approval required**: Never modify files without explicit user approval
- **Minimal edits**: Keep changes focused and surgical

## See Also

- `/memory-bank/protocols/memory-bank-update-workflow.md` - Complete update workflow
- `/memory-bank/CLAUDE.md` - File operation standards and requirements
- `/integrated-rules-v6.11.md` - Section 5.3 for technical standards
