# Command Reference

*Last Updated: April 15, 2025*

## Core Commands for the Optimized Rules System

This document provides concise syntax and usage for all system commands, organized by category.

## Task Management Commands

| Command | Syntax | Description |
|---------|--------|-------------|
| `create_task` | `<create_task><title>Task title</title></create_task>` | Creates new task with unique ID in tasks.md |
| `switch_task` | `<switch_task><task_id>T#</task_id></switch_task>` | Switches focus to different task, updates session_cache.md |
| `pause_task` | `<pause_task><task_id>T#</task_id></pause_task>` | Marks task as paused in tasks.md |
| `resume_task` | `<resume_task><task_id>T#</task_id></resume_task>` | Resumes a paused task |
| `complete_task` | `<complete_task><task_id>T#</task_id></complete_task>` | Marks task as completed and updates documentation |

## Memory Management Commands

| Command | Syntax | Description |
|---------|--------|-------------|
| `read_mb` | `<read_mb><file>file_name.md</file></read_mb>` | Loads specific memory bank file |
| `read_mb_standard` | `<read_mb_standard></read_mb_standard>` | Loads Critical + Essential tier files |
| `update_mb` | `<update_mb><file>file_name.md</file><content>New content</content></update_mb>` | Updates specific memory bank file |
| `log_error` | `<log_error><title>Error title</title><task_id>T#</task_id><details>Error details</details></log_error>` | Records error in errorLog.md |
| `record_edits` | `<record_edits><task_id>T#</task_id><description>Edit description</description></record_edits>` | Adds modifications to edit_history.md |

## Module Management Commands

| Command | Syntax | Description |
|---------|--------|-------------|
| `load_module` | `<load_module><module_name>module-name</module_name></load_module>` | Loads specific rule module |
| `unload_module` | `<unload_module><module_name>module-name</module_name></unload_module>` | Unloads specific rule module |
| `list_modules` | `<list_modules></list_modules>` | Lists all available modules and load status |
| `suggest_modules` | `<suggest_modules><task_id>T#</task_id></suggest_modules>` | Suggests modules for current task |

## File Operation Commands

| Command | Syntax | Description |
|---------|--------|-------------|
| `read_file` | `<read_file><path>file_path</path></read_file>` | Reads file content |
| `read_file_lines` | `<read_file><path>file_path</path><start_line>#</start_line><end_line>#</end_line></read_file>` | Reads specific line range |
| `list_directory` | `<list_directory><path>dir_path</path></list_directory>` | Lists directory contents |
| `search_files` | `<search_files><path>dir_path</path><pattern>search_pattern</pattern></search_files>` | Searches for files matching pattern |
| `edit_block` | `<edit_block><blockContent>file_path\n<<<<<<< SEARCH\nold_content\n=======\nnew_content\n>>>>>>> REPLACE</blockContent></edit_block>` | Performs surgical edit |
| `write_file` | `<write_file><path>file_path</path><content>file_content</content></write_file>` | Creates or overwrites file |
| `create_directory` | `<create_directory><path>dir_path</path></create_directory>` | Creates directory |

## Session Management Commands

| Command | Syntax | Description |
|---------|--------|-------------|
| `continue_session` | `<continue_session></continue_session>` | Flags continuation, prioritizes session_cache.md |
| `complete_session` | `<complete_session></complete_session>` | Marks session complete, updates docs |
| `cache_session` | `<cache_session></cache_session>` | Creates continuation point |
| `start_session` | `<start_session></start_session>` | Begins new session with fresh timestamp |

## Code Implementation Commands

| Command | Syntax | Description |
|---------|--------|-------------|
| `verify_code` | `<verify_code><path>file_path</path></verify_code>` | Checks code against standards |
| `format_code` | `<format_code><path>file_path</path></format_code>` | Ensures code follows guidelines |
| `document_code` | `<document_code><path>file_path</path></document_code>` | Updates code documentation |

## Extended Documentation

For more detailed documentation, load specific modules using the `load_module` command or refer to the documentation in the `/optimized-rules/docs/` directory.
