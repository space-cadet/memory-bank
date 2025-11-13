# Integrated Code Rules and Memory Bank System, v6.10 (Essential Instructions Priority)

*Last Updated: 2025-11-13 00:15:30 IST*

YOU WILL KEEP IT REALLY SIMPLE, STUPID (KIRSS). IF YOU THINK A SOLUTION IS SIMPLE ENOUGH, MAKE IT EVEN SIMPLER.
YOU WILL NEVER UPDATE ANY FILES, INCLUDING MEMORY BANK FILES, WITHOUT EXPLICIT USER APPROVAL
YOU WILL NEVER ADD NEW FEATURES WITHOUT APPROVAL
YOU WILL NEVER GENERATE ANY CODE WITHOUT APPROVAL
YOU WILL GO SLOW AND STEADY. WHEN YOU THINK YOU'RE GOING SLOW, GO EVEN SLOWER.

## Table of Contents
### 1. Critical Compliance Requirements
- [1.1 Timestamp Standards](#11-timestamp-standards)
- [1.2 Chat Response Standards](#12-chat-response-standards)
- [1.3 Implementation Scope Control](#13-implementation-scope-control)
- [1.4 File Operations](#14-file-operations)
- [1.5 Session Cache Update Protocol](#15-session-cache-update-protocol)
- [1.6 Approval Protocol](#16-approval-protocol)
- [1.7 Maintenance Guidelines](#17-maintenance-guidelines)

### 2. Core Operational Principles
- [2.1 KIRSS Principle](#21-kirss-principle)
- [2.2 Tiered Knowledge Structure](#22-tiered-knowledge-structure)
- [2.3 Execution Cadence](#23-execution-cadence)

### 3. Memory Bank Structure
- [3.1 Directory Hierarchy](#31-directory-hierarchy)
- [3.2 File Relationships](#32-file-relationships)
- [3.3 Validation Rules](#33-validation-rules)

### 4. File Templates
- [4.1 Core File Templates](#41-core-file-templates)
- [4.2 Template Requirements](#42-template-requirements)
- [4.3 Template Storage](#43-template-storage)
- [4.4 Individual Task File Template](#44-individual-task-file-template)
- [4.5 Individual Session File Template](#45-individual-session-file-template)
- [4.6 Task Registry Template (tasks.md)](#46-task-registry-template-tasksmd)
- [4.7 Session Cache Template (session_cache.md)](#47-session-cache-template-session_cachemd)
- [4.8 Edit History Template (edit_history.md)](#48-edit-history-template-edit_historymd)
- [4.9 Error Log Template (errorLog.md)](#49-error-log-template-errorlogmd)
- [4.10 Task Detail Guidelines](#410-task-detail-guidelines)

### 5. Technical Standards
- [5.1 Executable Paths](#51-executable-paths)
- [5.2 XML Tool Format Standards](#52-xml-tool-format-standards)
- [5.3 File Operation Standards](#53-file-operation-standards)
- [5.4 Command Syntax](#54-command-syntax)
- [5.5 Path Resolution](#55-path-resolution)

### 6. Core Workflows
- [6.1 Task Implementation](#61-task-implementation)
- [6.2 Error Handling](#62-error-handling)
- [6.3 File Updates](#63-file-updates)
- [6.4 Session Management](#64-session-management)
- [6.5 Memory Bank Update Workflow](#65-memory-bank-update-workflow)

## 1. Critical Compliance Requirements

### 1.1 Timestamp Standards
- Use format: `YYYY-MM-DD HH:MM:SS TZ`
- Example: `2025-07-15 13:23:37 IST`
- Include timezone in all timestamps
- Determine current system time first when updating

### 1.2 Chat Response Standards
- NO text formatting (bold, italics, emojis)
- Maximum conciseness while maintaining clarity
- NO unnecessary summaries or accomplishment lists
- Directly address the task without digressions
- Use second person for user, first person for assistant

### 1.3 Implementation Scope Control
- Implement ONLY what is explicitly outlined
- Before coding: declare exact implementation scope
- If scope exceeds outline by >20%: STOP and request approval
- Violation requires acknowledgement and restart

### 1.4 File Operations
1. Always use absolute paths
2. Verify file existence before operations
3. No relative paths or tildes (~)
4. Chunk large edits (25-30 lines max)

### 1.5 Session Cache Update Protocol
1. **Pre-Update Check**: Verify individual session file exists
2. **Creation Flow**: If missing, request approval to create first
3. **Update Flow**: If exists, append-only modifications
4. **Preservation Rule**: Never delete session files

### 1.6 Approval Protocol
- No file modifications without explicit approval
- No feature additions without approval
- No code generation without approval
- Document all approvals in edit history

### 1.7 Maintenance Guidelines
- Regularly review and update documentation
- Ensure consistency across all files
- Document changes in edit history
- Verify template compliance monthly

## 2. Core Operational Principles

1. **KIRSS Principle**
   - Keep It Really Simple, Stupid
   - Simplify beyond initial apparent simplicity

### 2.2 Tiered Knowledge Structure

The memory bank uses four tiers of documentation, organized by relevance and frequency of use. Load only what you need for the current task to optimize token usage.

#### Tier 1: Bootstrap (Minimal Startup)
Load when: Starting a new session or understanding system structure
- `tasks.md` - Registry of all active and completed tasks
- `activeContext.md` - Current focus and immediate task state
- This tier alone is sufficient to understand what's happening

#### Tier 2: Critical (Task-Focused)
Load when: Working on a specific task
- `session_cache.md` - Current session state and active task contexts
- `edit_history.md` - Recent file modifications (load if needing context about what changed)
- `errorLog.md` - Error history (load only if debugging issues)
- Load only the files directly relevant to your current task step

#### Tier 3: Essential (Context Clarification)
Load when: Task requirements unclear or implementation approach uncertain
- `projectbrief.md` - Project overview and scope
- `.cursorrules` - Implementation patterns and code standards
- Load only when Critical tier doesn't provide enough context

#### Tier 4: Reference (Deep Dives)
Load when: Specific architectural questions or long-term understanding needed
- `productContext.md` - Why the project exists and how it works
- `systemPatterns.md` - Architecture and design patterns
- `techContext.md` - Technical implementation details
- Rarely needed; load specific sections only when directly relevant

#### File Loading Priority Matrix

| Scenario | Load First | Then Load | Reference Only |
|----------|-----------|-----------|-----------------|
| New session | activeContext.md, tasks.md | session_cache.md | - |
| Continue task | session_cache.md | edit_history.md (if needed) | - |
| Debug error | errorLog.md | Related session file | systemPatterns.md |
| Unclear scope | projectbrief.md | .cursorrules | - |
| Architecture question | systemPatterns.md | techContext.md | - |
| Code implementation | .cursorrules | activeContext.md | - |

#### Progressive Loading Examples

**Example 1: Starting work on T5**
1. Load: `tasks.md` (see T5 status)
2. Load: `activeContext.md` (confirm T5 is current focus)
3. Load: Task file `tasks/T5.md` (get detailed context)
4. Only if needed: Load `session_cache.md` (see what happened previously)
5. Stop here for 80% of tasks

**Example 2: Debugging a failure**
1. Load: `errorLog.md` (see recent errors)
2. Load: Related session file from history
3. Load: `systemPatterns.md` (understand architecture if needed)
4. Load: Specific `techContext.md` section only if required

**Example 3: Reviewing implementation approach**
1. Load: `.cursorrules` (coding standards)
2. Load: `systemPatterns.md` (design patterns)
3. Load: `techContext.md` (specific implementation details)
4. Revisit if approach conflicts with existing patterns

2. **Execution Cadence**
   - Slow and steady pace
   - When you think you're going slow, go slower
   - Single-threaded focus on current task

## 3. Memory Bank Structure

### 3.1 Directory Hierarchy
```
${PROJECT_ROOT}/                 # Project root directory
└── memory-bank/                # Memory bank root
    ├── activeContext.md        # Current task context
    ├── changelog.md            # Log of changes across sessions
    ├── edit_history.md        # File modification log (with task references)
    ├── errorLog.md            # Error tracking (with task references)
    ├── progress.md            # Implementation status
    ├── projectbrief.md        # Project overview
    ├── session_cache.md       # Multi-task session state
    ├── systemPatterns.md      # Architecture and design patterns
    ├── tasks.md              # Task registry and tracking
    ├── techContext.md        # Technical implementation details
    ├── archive/              # Archived files
    ├── implementation-details/ # Detailed implementation notes
    ├── templates/            # Template files for memory bank documents
    └── database/             # Hierarchical database for memory bank
```

### 3.2 File Relationships
- Tasks: Central registry ↔ Individual task files
- Sessions: Cache ↔ Individual session files
- History/Errors: Reference related tasks

### 3.3 Validation Rules
- All files must adhere to templates
- All changes must be documented in edit history
- All errors must be logged in error log

## 4. File Templates

### 4.1 Core File Templates
1. `tasks.md` (Task Registry)
2. `session_cache.md`
3. `edit_history.md`
4. `errorLog.md`
5. `systemPatterns.md`
6. `techContext.md`

### 4.2 Template Requirements
- All templates must include:
  - Standard headers with timestamps
  - Task references where applicable
  - Consistent section organization
- Must be stored in `/templates/` directory

### 4.3 Template Storage
- All templates must be stored in `/templates/` directory
- Templates must be easily accessible

### 4.4 Individual Task File Template
```markdown
# [TASK ID]: [TASK TITLE]
*Created: YYYY-MM-DD HH:MM:SS TZ*
*Last Updated: YYYY-MM-DD HH:MM:SS TZ*

**Description**: [DETAILED DESCRIPTION]
**Status**: [STATUS EMOJI + STATE]
**Priority**: [PRIORITY]
**Started**: [DATE]
**Last Active**: [TIMESTAMP]
**Dependencies**: [TASK IDS]

## Completion Criteria
- [CRITERION 1]
- [CRITERION 2]
- [CRITERION 3]

## Related Files
- `[FILE1]`
- `[FILE2]`
- `[FILE3]`

## Progress
1. ✅ [COMPLETED STEP]
2. 🔄 [CURRENT STEP]
3. ⬜ [NEXT STEP]

## Context
[IMPORTANT DECISIONS OR CONTEXT]
```

### 4.5 Individual Session File Template
```markdown
# Session [DATE] - [PERIOD]
*Created: YYYY-MM-DD HH:MM:SS TZ*
*Last Updated: YYYY-MM-DD HH:MM:SS TZ*

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

### 4.6 Task Registry Template (tasks.md)
```markdown
# Task Registry
*Created: YYYY-MM-DD HH:MM:SS TZ*
*Last Updated: YYYY-MM-DD HH:MM:SS TZ*

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

### 4.7 Session Cache Template (session_cache.md)
```markdown
# Session Cache
*Created: YYYY-MM-DD HH:MM:SS TZ*
*Last Updated: YYYY-MM-DD HH:MM:SS TZ*

## Current Session
**Started**: [Timestamp]
**Focus Task**: [Task ID]
**Session File**: `sessions/[DATE]-[PERIOD].md`

## Overview
- Active: [Count] | Paused: [Count]
- Last Session: [Previous Session File]
- Current Period: [morning/afternoon/evening/night]

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

## Session History (Last 5)
1. `sessions/YYYY-MM-DD-PERIOD.md` - [BRIEF FOCUS DESCRIPTION]
2. `sessions/YYYY-MM-DD-PERIOD.md` - [BRIEF FOCUS DESCRIPTION]  
3. `sessions/YYYY-MM-DD-PERIOD.md` - [BRIEF FOCUS DESCRIPTION]
4. `sessions/YYYY-MM-DD-PERIOD.md` - [BRIEF FOCUS DESCRIPTION]
5. `sessions/YYYY-MM-DD-PERIOD.md` - [BRIEF FOCUS DESCRIPTION]
```

### 4.8 Edit History Template (edit_history.md)
```markdown
# Edit History
*Created: YYYY-MM-DD HH:MM:SS TZ*
*Last Updated: YYYY-MM-DD HH:MM:SS TZ*

### YYYY-MM-DD

#### HH:MM - TaskID: Description
- Fixed `file/path` - Specific technical change description
- Created `file/path` - What was created and why  
- Updated `file/path` - What was updated and the change made

#### HH:MM - TaskID: COMPLETED - Task Name
- Fixed `file/path` - Technical change
- Updated `file/path` - Specific update made
```

**Format Requirements:**
- Date stamp: `### YYYY-MM-DD` with blank line after
- Time entries: `#### HH:MM - TaskID: Description`
- Use brief one line summaries for each change
- No summary statements, meta-commentary, or impact assessments
- Focus on technical file changes only

**Detailed Requirements:**
- PREPEND entries to top of file using block edits
- Include task ID reference and precise timestamp
- Reference specific files with technical changes only
- Use file paths in backticks with precise change descriptions

**Prohibited:**
- Summary statements, meta-commentary, impact assessments
- Evaluative or summary content

### 4.9 Error Log Template (errorLog.md)
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

### 4.10 Task Detail Guidelines
**INCLUDE in Task Details section:**
- Brief description (1 sentence)
- Current status and last update
- 2-3 key files
- One line of essential context

**DO NOT INCLUDE:**
- Detailed criteria lists
- Implementation phases
- Progress tracking with multiple bullets
- Technical specifications
- Session notes

**Template:**
```markdown
### TXX: Task Title
**Description**: What the task does in one sentence
**Status**: Current status **Last**: Date
**Files**: `key/file1`, `key/file2`
**Notes**: Essential context in one line
```

## 5. Technical Standards

### 5.1 Executable Paths
- Node: `/Users/deepak/.nvm/versions/node/v23.11.0/bin/node`
- NPM: `/Users/deepak/.nvm/versions/node/v23.11.0/bin/npm`
- PNPM: `/Users/deepak/.nvm/versions/node/v23.11.0/bin/pnpm`
- Python: `/Users/deepak/miniconda3/bin/python`

### 5.2 XML Tool Format Standards
1. **Structure**:
   ```xml
   <tool_name>
     <parameter1>value1</parameter1>
     <parameter2>value2</parameter2>
   </tool_name>
   ```
2. **Requirements**:
   - Case-sensitive exact tool names
   - Ordered parameters (required first)
   - 2-space indentation for parameters

### 5.3 File Operation Standards
1. **Block Edits**:
   ```xml
   <edit_block>
     <file_path>/path/to/file</file_path>
     <old_string>content to replace</old_string>
     <new_string>replacement content</new_string>
   </edit_block>
   ```
2. **Requirements**:
   - Verify file existence first
   - Use absolute paths only
   - Limit edits to 25-30 line chunks

### 5.4 Command Syntax
- Explicit command declarations
- No assumptions about environment
- Full paths for all executables

### 5.5 Path Resolution
- Project root: `${PROJECT_ROOT}`
- Memory bank: `${PROJECT_ROOT}/memory-bank`
- All paths resolved from these roots

## 6. Core Workflows

### 6.1 Task Implementation
1. Define task in `tasks.md`
2. Create individual task file
3. Implement ONLY outlined items
4. Validate against completion criteria
5. Update session cache
6. Document in edit history

### 6.2 Error Handling
1. Log error in `errorLog.md`
2. Check related session files
3. Verify operation prerequisites
4. Request approval for corrections
5. Document resolution

### 6.3 File Updates
1. Check file existence
2. Request modification approval
3. Make minimal changes
4. Verify against validation rules
5. Update session cache if needed

### 6.4 Session Management
1. Check if session file exists
2. If it exists, then update it, preserving existing context
3. If it doesn't exist, then create it
4. Update `session_cache.md`
5. Maintain chronological order
6. Preserve all historical records

### 6.5 Memory Bank Update Workflow

Follow this workflow to update memory bank files:

1. **Determine Current System Time and Timezone**
   - Check local system time
   - Ensure all timestamps are in IST timezone
   - Format: `YYYY-MM-DD HH:MM:SS IST`

2. **Update Task Files**
   - Update individual task file (if applicable) with progress, status, and last active timestamp
   - If task file does not exist, request user approval to create it
   - After task file update, update `tasks.md` master registry with status changes and timestamps. Task entries in master task file should be brief summaries of the task, not detailed descriptions.

3. **Update Implementation Documentation**
   - Update any relevant implementation-details files
   - Update technical context if architectural changes occurred
   - Include timestamps in all documentation

4. **Handle Session File**
   - Check if current session file exists (format: `sessions/YYYY-MM-DD-PERIOD.md`)
   - If session file exists: Update it while preserving all existing context
   - If session file does not exist: create it
   - Update session file with work completed, status changes, and key decisions

5. **Update Session Cache**
   - Update `session_cache.md` with current session metadata
   - Update task status in session cache
   - Update "Session History" section if session file was new or modified
   - Preserve all existing session history

6. **Update Other Relevant Memory Bank Files**
   - Update `activeContext.md` if focus task changed
   - Update `errorLog.md` if errors were encountered and fixed
   - Update `progress.md` if milestones were completed
   - Update `changelog.md` if features or bugs were addressed

7. **Update Edit History**
   - PREPEND new entry to top of `edit_history.md`
   - Format: `#### HH:MM - TaskID: Description` followed by bullet points with file changes
   - Include timestamp, task ID, and brief one or two lines summary for each file change
   - No summary statements or evaluative content

8. **Generate Brief Commit Message**
   - Format: `(type)TID: Headline - Details (% complete)`
   - Type: feat, fix, docs, refactor, test (use conventional commits)
   - Example: `(feat)T3: Database Migration Verification Complete - Documentation & Memory Bank Updated (90% complete)`
   - Include task ID, concise headline, and main accomplishments as dashed bullet points
   - Add percentage completion (optional)
   - Proceed with next action or complete workflow