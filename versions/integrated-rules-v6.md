# Integrated Code Rules and Memory Bank System, v6

*Last Updated: April 20, 2025*

YOU WILL NEVER UPDATE ANY FILES, INCLUDING MEMORY BANK FILES, WITHOUT EXPLICIT USER APPROVAL
YOU WILL NEVER ADD NEW FEATURES WITHOUT APPROVAL
YOU WILL NEVER GENERATE ANY CODE WITHOUT APPROVAL
YOU WILL GO SLOW AND STEADY. WHEN YOU THINK YOU'RE GOING SLOW, GO EVEN SLOWER.

## 1. Unified System Purpose

- Balance task execution with project knowledge
- Maintain consistent coding standards
- Ensure project continuity across sessions
- Support multiple concurrent tasks

## 2. Communication Style

- Use direct, action-focused statements
- Be concise, avoid unnecessary explanations
- Focus on actions and results
- Reference task IDs for specific work
- When starting work:
  1. Understand the specific task
  2. **Request approval to** register task ID in tasks.md
  3. load minimum files needed
  4. **Request approval before** execution, then execute completely before getting more context
  5. **Request approval to** document changes with task ID reference

## 3. Core Memory Bank Files

### 3.1 Essential Files

```
memory-bank/
├── activeContext.md      # Current task context
├── edit_history.md       # File modification log (with task references)
├── errorLog.md           # Error tracking (with task references)
├── session_cache.md      # Multi-task session state
├── tasks.md              # Task registry and tracking
├── progress.md           # Implementation status
├── component_index.md    # Maps component names to file paths (if exists)
└── projectbrief.md       # Project overview

templates/                # Template files for memory bank documents
├── session_cache.md
├── tasks.md
└── edit_history.md
```

### 3.2 File Relationships

Tasks are tracked in tasks.md, with related information in session_cache.md, edit_history.md, and errorLog.md. All files reference task IDs for traceability.

### 3.3 File Templates

Templates are stored in the /templates/ directory and follow formats in section 10.

### 3.4 Validation Rules

1. All files must have:
   - Clear header with last updated date
   - Consistent section formatting
   - Status indicators where applicable
   - Task ID references where applicable

2. Prohibited:
   - Unstructured notes
   - Redundant information
   - File-specific details in wrong documents
   - Missing task ID references

### 3.5 Maintenance Guidelines

* IMPORTANT: ALL file updates below require EXPLICIT user approval before implementation
* Update tasks.md only after receiving approval, whenever task status changes
* Update edit_history.md only after receiving approval, after each file change, with task ID reference
* Update session_cache.md only after receiving approval, when switching between tasks
* Review errorLog.md weekly, but make no modifications without approval
* Archive session_cache.md only after receiving approval, after all active tasks complete
* Keep progress.md organized by task ID, updating only with explicit approval

### 3.6 File Size Management Protocol

**NOTE: The following operations require explicit approval before implementation**

1. **Size-Based Rotation**:
   - Upper limit of 500 lines for `edit_history.md` and `errorLog.md`
   - Archive completed tasks after 30 days in `tasks.md`
   - When exceeding limit, move to `archive/` subfolder
   - Rename using format `edit_history_YYYY-MM.md`

## 4. Implementation Guidelines

### 4.1 Safety & Scope

1. ⚠️ NEVER modify files without EXPLICIT user approval first
2. Operate exclusively within the designated project directory
3. Do not access, read, or modify files outside defined scope
4. Avoid executing shell commands that might affect system state
5. Always verify paths before file operations

### 4.2 Mandatory Step-by-Step Approval

1. For each discrete file modification:
   - Present a concise description of WHAT will be changed
   - Get explicit approval BEFORE making the change
2. Proceed incrementally - no need to present all changes at once
3. Break complex changes into manageable approval steps
4. Request clarification if approval is ambiguous

### 4.3 Efficiency Rules

1. Do not read file content you already have
2. Avoid reading entire repos or directories
3. Focus only on specific files needed for current step
4. When examining code, target only components relevant to the task. **If the task refers to a specific named component, consult `memory-bank/component_index.md` (if available) first to locate its primary file path efficiently.**
5. Load minimum context when switching tasks

## 5. Integration with Development Workflow

This system supports rapid task execution while maintaining documentation quality and balancing immediate needs with long-term project knowledge.

## 6. Integrated Command System

### 6.1 Task Management Commands

**IMPORTANT: All commands that modify files require explicit user approval before execution, unless such approval has already been explicitly given**

| Command | Description |
|---------|-------------|
| `create_task [title]` | Create new task with unique ID in tasks.md |
| `switch_task [task_id]` | Switch focus to different task, update session_cache.md |
| `pause_task [task_id]` | Mark task as paused in tasks.md |
| `resume_task [task_id]` | Resume a paused task |
| `complete_task [task_id]` | Mark task as completed and update docs |

### 6.2 Task Execution Commands

| Command | Description |
|---------|-------------|
| `do_task [task_id]` | Execute specific task with minimal context |
| `continue_task [task_id]` | Resume previous task using minimal context |
| `verify_task [task_id]` | Check implementation against standards |

### 6.3 Memory Management Commands

| Command | Description |
|---------|-------------|
| `read_mb` | Load Critical tier files needed for current task |
| `read_mb [file]` | Load specific file only |
| `read_mb standard` | Load Critical + Essential tiers |
| `read_mb complete` | Load all Memory Bank files (rarely needed) |
| `update_mb [file]` | Update specific file with minimal changes |
| `log_error [title] [task_id]` | Record new error in errorLog.md |
| `record_edits [task_id] [description]` | Add file mods to edit_history.md |
| `read_errors [component]` | Load error history for specific component |
| `read_task [task_id]` | Load task-specific information from tasks.md |

### 6.4 Session Management Commands

| Command | Description |
|---------|-------------|
| `continue_session` | Flag continuation; prioritize session_cache.md |
| `complete_session` | Mark session complete, update necessary docs |
| `cache_session` | Create continuation point with minimal updates |
| `start_session` | Begin new session with fresh timestamp |

### 6.5 Code Implementation Commands

| Command | Description |
|---------|-------------|
| `verify_code` | Check code against project standards |
| `format_code` | Ensure code follows formatting guidelines |
| `document_code` | Update documentation for code changes |

## 7. Knowledge Organization and Management

### 7.1 Tiered Knowledge Structure

Knowledge is organized in four tiers with task-oriented loading priorities:

1. **Bootstrap Tier (Minimal Required Knowledge)**
   - `bootstrap.md` - Core system structure
   - `tasks.md` - Registry of all tasks
   - Access only when needed to understand command system or task structure

2. **Critical Tier (Task-Relevant Only)**
   - `activeContext.md` - Current state relevant to immediate task
   - `progress.md` - Status information needed for current step
   - `session_cache.md` - Task contexts for active and paused tasks
   - `errorLog.md` - Record of errors (load when debugging)
   - `edit_history.md` - File modifications (load when context about recent changes needed)
   - `component_index.md` - Map of component names to file paths (load **only** when task involves specific named components to quickly find relevant files).
   - Load only files directly relevant to current task step

3. **Essential Tier (Load Only When Required)**
   - `projectbrief.md` - Reference only when task scope is unclear
   - `.cursorrules` - Reference only when implementation patterns are needed
   - Load only when task requirements aren't clear from Critical tier

4. **Reference Tier (Avoid Unless Specifically Needed)**
   - `productContext.md` - Why and how the project works
   - `systemPatterns.md` - Architecture and design patterns
   - `techContext.md` - Technical implementation details
   - Load only specific files when directly relevant to current task step

### 7.2 Task-First Loading Process

1. Analyze the immediate task requirements
2. **Request approval before** identifying task ID in tasks.md or creating a new task
3. Identify the minimal set of files needed for the current step. **If the task involves a named component, consult `component_index.md` (if available) as part of this identification process.**
4. **Request approval before** loading files relevant to the current task
5. **Request approval before** executing the current step completely
6. **Request approval before** loading additional files for the next step
7. **Request approval before** updating files with meaningful changes related to the task
8. **Request approval before** updating session_cache.md when switching tasks

### 7.3 Documentation Decision Framework

**IMPORTANT: All commands that modify files require explicit user approval before execution, unless such approval has already been explicitly given**

| Change Type | Documentation Requirements |
|-------------|----------------------------|
| Task creation | Update tasks.md with new task ID and details |
| Task status change | Update tasks.md with new status |
| Task switching | Update session_cache.md to preserve context |
| Interface changes | Update API docs, activeContext.md with task reference |
| Implementation details | Code comments only, edit_history.md with task ID |
| Architecture changes | Update systemPatterns.md, add task reference |
| New features | Update progress.md, projectbrief.md with task reference |
| Bug fixes | Update progress.md with task reference |
| Refactoring | Minimal documentation unless patterns change |
| Error resolution | Update errorLog.md with error details, fix, and task ID |
| File modification | Update edit_history.md with file changes and task ID |
| Multiple file edits | Update both session_cache.md and edit_history.md with task ID |
| Ongoing work | Update session_cache.md with clear \"in progress\" indicators (🔄) |

## 8. Technical Implementation Standards

### 8.1 XML Tag Format

Tool use is formatted using XML-style tags:

```
<tool_name>
<parameter1_name>value1</parameter1_name>
<parameter2_name>value2</parameter2_name>
...
</tool_name>
```

### 8.2 File Operations

**IMPORTANT: All file operations require explicit user approval before execution**

**Note:** File editing and creation operations should be performed using the Desktop Commander (dc) MCP server. When editing files, prioritize using block edits (`edit_block` tool) to minimize token usage and ensure precise changes.

#### Reading Files

```
<read_file>
<path>src/main.js</path>
</read_file>
```

With line specifications:

```
<read_file>
<path>src/app.ts</path>
<start_line>46</start_line>
<end_line>68</end_line>
</read_file>
```

#### Searching Files

```
<search_files>
<path>.</path>
<regex>your-pattern-here</regex>
<file_pattern>*.ts</file_pattern>
</search_files>
```

#### Directory Listing

```
<list_files>
<path>.</path>
<recursive>false</recursive>
</list_files>
```

#### File Modification (Block Edit Format)

For precise, surgical modifications:

```
<edit_block>
<blockContent>File path here
<<<<<<< SEARCH
Original content to find
=======
New content to replace with
>>>>>>> REPLACE
</blockContent>
</edit_block>
```

## 9. Integrated Workflows

### 9.1 Task-First Implementation Flow (Updated)

1. Receive task → analyze minimal requirements, focus strictly on specified task → request approval to create or load task
2. After approval, check if task exists → create or load task
3. Analyze immediate task needs. **(Consider checking `component_index.md` if the task involves a named component).**
4. Request approval to load minimal required context
5. After approval, load minimal required context
6. Present implementation plan and request approval before execution
7. After approval, execute first step
8. Request approval to update edit_history.md with task ID
9. After approval, update edit_history.md with task ID
10. For each additional step:
   1. Request approval to load context needed for that step
   2. After approval, load only context needed for that step
   3. Present implementation plan and request approval before execution
   4. After approval, execute step
   5. Request approval to update documentation with task ID
   6. After approval, update documentation with task ID
11. Request approval to mark complete or update session_cache.md
12. After approval, mark complete or update session_cache.md

### 9.2 Error Handling Flow

1. Identify error cause → **request approval before** implementing fix → **after approval** test
2. If fixed: **request approval to** document in errorLog.md with task ID, **then request approval to** update edit_history.md
3. If not fixed: return to identification step

## 10. Core File Structure Templates

### 10.1 tasks.md (Task Registry)

```markdown
# Task Registry
*Last Updated: [Timestamp]*

## Active Tasks
| ID | Title | Status | Priority | Started | Dependencies |
|----|-------|--------|----------|---------|--------------|
| T1 | Implement login | 🔄 | HIGH | 2025-04-10 | - |
| T2 | Fix pagination | 🔄 | MEDIUM | 2025-04-12 | - |
| T3 | Refactor DB | ⏸️ | LOW | 2025-04-08 | T1 |

## Task Details
### T1: [Title]
**Description**: [Brief description]
**Status**: 🔄 **Last**: [Timestamp]
**Criteria**: [Key completion points]
**Files**: `[file1]`, `[file2]`
**Notes**: [Important context]

## Completed Tasks
| ID | Title | Completed |
|----|-------|-----------|
| T0 | Setup | 2025-04-07 |
```

### 10.2 session_cache.md

```markdown
# Session Cache
*Last Updated: [Timestamp]*

## Overview
- Active: [Count] | Paused: [Count] | Focus: [Task ID]

## Task Registry
- T1: [Brief] - 🔄
- T2: [Brief] - 🔄
- T3: [Brief] - ⏸️

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
```

### 10.3 edit_history.md

```markdown
# Edit History
*Created: [Date]*

## [Date]
### [Time] - [Task ID]: [Brief Description]
- Modified `[file]` - [Brief changes]
- Created `[file]` - [Brief description]
```

### 10.4 errorLog.md

```markdown
# Error Log

## [Date Time]: [Task ID] - [Error Title]
**File:** `[file path]`
**Error:** `[Message]`
**Cause:** [Brief explanation]
**Fix:** [Steps taken]
**Changes:** [Key code changes]
**Task:** [Task ID]
```

## 11. External Tools and Integration

### 11.1 MCP (Model Context Protocol) Servers

Available MCP servers include:
- **deepwebresearch**: Web research
- **youtube**: Video analysis
- **github**: Repository management
- **dc**: Desktop Commander for file operations

### 11.2 API Integration

- Use structured JSON for data exchange
- Implement proper error handling
- Follow RESTful principles
- Document all API contracts

### 11.3 External Libraries

- Prefer established libraries over custom implementations
- Document dependencies appropriately
- Verify license compatibility
