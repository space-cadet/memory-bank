# Memory Bank File Rotation Protocol

*Version 1.0 - April 15, 2025*

## Overview

This protocol describes the standard operating procedure for rotating large memory bank files such as `errorLog.md`, `edit_history.md`, and `tasks.md` when they exceed the recommended file size threshold (500 lines). The rotation process preserves recent entries while archiving older content.

## Prerequisites

- Memory bank directory structure established with `/memory-bank/archive/` subdirectory
- File exceeding size threshold (typically 500 lines)
- Sufficient command-line access to perform file operations

## Rotation Process

### 1. Size Assessment

Before rotation, assess the current file size:

```bash
# Check file size and last modification time
get_file_info /path/to/memory-bank/fileToRotate.md

# Count total number of lines (optional)
execute_command "wc -l /path/to/memory-bank/fileToRotate.md"
```

Proceed with rotation if the file exceeds 500 lines or 50KB.

### 2. Archive Directory Verification

Verify the archive directory exists:

```bash
# Check if archive directory exists
get_file_info /path/to/memory-bank/archive

# Create it if it doesn't exist
create_directory /path/to/memory-bank/archive
```

### 3. Extract File Header

Extract the header from the original file (typically the first 3-5 lines):

```bash
# Extract file header (first few lines)
execute_command "head -n 3 /path/to/memory-bank/fileToRotate.md"
```

### 4. Identify Recent Entries

For structured files like `errorLog.md` that use heading patterns, identify the most recent entries:

```bash
# Find the last N entry headings (change number as needed)
execute_command "grep -n \"^## \" /path/to/memory-bank/fileToRotate.md | tail -n 6"
```

This command:
- Uses `grep` to find all level-2 headings with line numbers
- Uses `tail` to get only the last 6 matches (5 entries plus current position)

### 5. Extract Recent Content

Extract the header and recent entries to create the new file:

```bash
# Extract header and content from line X to end
execute_command "sed -n '1,3p;LINE_NUMBER,$p' /path/to/memory-bank/fileToRotate.md > /tmp/recent_entries.md"
```

Replace `LINE_NUMBER` with the line number of the oldest entry to preserve.

### 6. Create Archive File

Create the archive file with appropriate date-based naming:

```bash
# Copy original file to archive with date-stamped name
execute_command "cp /path/to/memory-bank/fileToRotate.md /path/to/memory-bank/archive/fileToRotate_YYYY-MM.md"
```

Use the current year and month for the filename to maintain chronological organization.

### 7. Replace Original File

Replace the original file with the version containing only recent entries:

```bash
# Move the recent entries file to the original location
execute_command "mv /tmp/recent_entries.md /path/to/memory-bank/fileToRotate.md"
```

### 8. Verify File Sizes

After rotation, verify both files exist with appropriate content:

```bash
# Verify new file size
get_file_info /path/to/memory-bank/fileToRotate.md

# Verify archive file size
get_file_info /path/to/memory-bank/archive/fileToRotate_YYYY-MM.md
```

## File Type-Specific Considerations

### Error Log Rotation

For `errorLog.md`:
- Preserve the last 5 error entries
- Match the pattern `^## ` to identify error entries
- Extract the first 3 lines (header) plus recent entries

### Edit History Rotation

For `edit_history.md`:
- Preserve the last 10-20 edit entries (typically 1-2 weeks of changes)
- Match the pattern `^### ` to identify date headers
- Extract the first 3 lines (header) plus recent entries

### Tasks Rotation

For `tasks.md`:
- Archive completed tasks older than 30 days
- Keep all active and paused tasks in the main file
- Requires more complex pattern matching to identify completed task sections

## Documentation Updates

After rotation, update the following files:

1. **Edit History**
   ```bash
   edit_block "path/to/memory-bank/edit_history.md"
   ```
   Add entry describing the rotation operation including:
   - Source file rotated
   - Archive filename created
   - Number of entries preserved vs. archived

2. **Tasks**
   ```bash
   edit_block "path/to/memory-bank/tasks.md"
   ```
   If this was a targeted task, update its status to complete

3. **Session Cache**
   ```bash
   edit_block "path/to/memory-bank/session_cache.md"
   ```
   Update with rotation details and context

## Example Task Creation and Execution

### Create Rotation Task

```markdown
### T99: Implement Memory Bank File Rotation
**Description**: Implement the file rotation system for Memory Bank files that have grown too large, starting with [filename]. This follows the size-based rotation protocol.
**Status**: 🔄 IN PROGRESS
**Last Active**: [Current Date]
**Completion Criteria**:
- Verify archive directory exists
- Implement rotation with preservation of recent entries
- Establish naming convention for archived files
- Minimize token usage by using efficient commands
- Document rotation process
- Update edit_history.md to reflect the changes

**Related Files**:
- `/memory-bank/[filename]`
- `/memory-bank/archive/[filename]_YYYY-MM.md`
- `/memory-bank/edit_history.md`
- `/memory-bank/tasks.md`
```

## Optimization Notes

- Use command-line tools for efficiency rather than reading entire files into memory
- Process only the necessary parts of files to reduce token usage
- Batch operations where possible to minimize commands
- For very large files, consider using more selective extraction patterns

## Troubleshooting

### Common Issues

1. **Missing Archive Directory**
   - Error: "No such file or directory" when archiving
   - Solution: Create archive directory before rotation

2. **Pattern Matching Failure**
   - Error: Incorrect entry extraction
   - Solution: Verify file structure and adjust grep patterns

3. **Permission Issues**
   - Error: "Permission denied" during file operations
   - Solution: Check file permissions and ownership

4. **Temporary File Errors**
   - Error: Cannot create temporary file
   - Solution: Use a different temporary location or direct file redirection

## Automation Considerations

For regular rotations, consider:
- Scheduled rotation based on file size checks
- Automatic detection of files exceeding threshold
- Creation of rotation summary reports

---

*This protocol follows the Memory Bank Size Management Protocol from Section 3.6 of the Integrated Code Rules and Memory Bank System.*
