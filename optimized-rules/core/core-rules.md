# Core Rules for Integrated Code and Memory Bank System

*Last Updated: April 15, 2025*

⚠️ **IMPORTANT: NEVER modify files without explicit user approval. Always present a plan and wait for confirmation before making any changes.**

## 1. Essential System Purpose

The Integrated Code Rules and Memory Bank System is designed to:
- Balance task execution efficiency with project knowledge
- Maintain consistent coding standards
- Ensure project continuity across sessions
- Optimize resource usage by loading only necessary information

## 2. Safety & Scope Rules

1. Operate exclusively within designated project directories
2. Never modify files without explicit user approval
3. Verify paths before file operations
4. Present changes for approval before execution
5. Focus only on necessary files relevant to current task

## 3. Core Commands

### Task Management
- `create_task [title]` - Create new task
- `switch_task [task_id]` - Switch to different task
- `complete_task [task_id]` - Mark task as completed

### Memory Management
- `read_mb [file]` - Load specific memory bank file
- `update_mb [file]` - Update memory bank file
- `log_error [title] [task_id]` - Record error in errorLog.md
- `record_edits [task_id] [description]` - Add to edit_history.md

### Module Management
- `load_module [module_name]` - Load a specific rule module
- `unload_module [module_name]` - Unload a specific rule module
- `list_modules` - List all available modules and their status
- `suggest_modules [task_id]` - Suggest relevant modules for task

## 4. File Operations

### Reading Files
```
<read_file>
<path>src/main.js</path>
</read_file>
```

### Surgical File Modification
```
<edit_block>
<blockContent>
/path/to/file
<<<<<<< SEARCH
code to find
=======
code to replace
>>>>>>> REPLACE
</blockContent>
</edit_block>
```

### Directory Listing
```
<list_directory>
<path>.</path>
</list_directory>
```

## 5. Documentation Standards

- Update timestamps when modifying files
- Include task ID references in all documentation
- Use status indicators: ✅ (Complete), 🔄 (In Progress), ⏸️ (Paused), ⬜ (Not Started)

## 6. Module System

This is a minimal Core Rules module. Additional modules can be loaded as needed:

- **documentation-rules** - Documentation standards and practices
- **implementation-rules** - Code implementation standards
- **memory-management-rules** - Memory Bank file management
- **session-management-rules** - Session tracking and management
- **task-management-rules** - Multi-task tracking and switching
- **error-handling-rules** - Error logging and resolution
- **tool-usage-rules** - Detailed tool usage guidelines

To load additional modules, use:
```
<load_module>
<module_name>module-name-here</module_name>
</load_module>
```

For more detailed instructions, see `/optimized-rules/loader.md`.
