# Integrated Rules Redesign - Essential Sections

*Created: 2025-07-14 21:35:00 IST*

## 1. Critical Compliance Requirements

### 1.1 Timestamp Standards
- Use format: `YYYY-MM-DD HH:MM:SS TZ`
- Example: `2025-06-04 06:50:08 IST`
- Include timezone in all timestamps
- Determine current system time first when updating

### 1.2 Chat Response Standards
- NO text formatting (bold, italics, emojis, bullet points) in responses
- Keep responses concise and direct
- NO unnecessary step summaries or accomplishment lists
- Maintain balanced communication

### 1.3 Implementation Scope Control
- Implement exactly what you outline - NO MORE, NO LESS
- Before coding: state "I will implement exactly: [list items]"
- If adding anything not listed: STOP and ask for approval
- If implementation exceeds outlined scope by >20%: STOP and ask approval
- Violation consequence: acknowledge overengineering and ask to redo

### 1.4 File Operation Prerequisites
- REQUIRED: Check file existence before ANY file operation
- If file doesn't exist: request explicit user approval to create
- If file exists: request explicit user approval to modify
- PROHIBITED: Creating/modifying files without explicit approval

### 1.5 Session Cache Update Requirements
- Before ANY session cache update: CHECK if individual session file exists
- If the individual session file doesn't exist: request approval to create individual session file first
- If the individual session file exists: update it; DO NOT overwrite

### 1.6 Approval Requirements
- EVERY file modification requires EXPLICIT user approval before execution
- Includes: creating files, modifying files, updating memory bank files, implementing code, recording errors/edits, archiving files
- NO EXCEPTIONS: Always request approval before ANY file modification

### 1.7 Maintenance Guidelines
- Update files only after receiving approval
- File-specific formatting requirements in templates section
- Review errorLog.md weekly but no modifications without approval

## 2. Core Operational Principles (Non-Negotiable)

1. **KIRSS Principle**  
   - Keep It Really Simple, Stupid  
   - If solution seems simple, simplify further  

2. **Approval Requirements**  
   - NEVER update files without explicit user approval  
   - NEVER add features without approval  
   - NEVER generate code without approval  

3. **Execution Protocol**  
   - Go slow and steady  
   - When you think you're going slow, go slower  

## 3. Memory Bank Structure

### 3.1 Directory Structure (Essential)
```
memory-bank/
├── tasks.md                  # Task registry
├── session_cache.md          # Active session tracking
├── edit_history.md           # Change history
├── errorLog.md               # Error records
├── tasks/                    # Individual task files
├── templates/                # File templates
├── implementation-details/   # Detailed design docs
└── integrated-rules-v*.md    # Versioned rules
```

This structure must be maintained as it forms the foundation for all operations.

2. File Relationships
3. Core Files Overview
4. Individual Task Files
5. Individual Session Files
6. Validation Rules
7. File Size Management Protocol
8. Session Cache Management
9. Session Cache Update Protocol
10. Core File Update Workflows

## 4. File Templates (Essential)

### 4.1 Core Templates
1. `tasks.md` - Task registry and tracking
   - Must include: Task ID, Title, Status, Priority, Start Date, Dependencies
2. `session_cache.md` - Active session tracking
   - Must include: Current tasks, Last activity timestamp, Open files
3. `edit_history.md` - Change history
   - Must include: Timestamp, File modified, Change description, Task reference
4. `errorLog.md` - Error records
   - Must include: Timestamp, Error description, File/line number, Task reference

#### tasks.md Template
```markdown
# Task Registry
*Last Updated: YYYY-MM-DD HH:MM:SS TZ*

| ID | Title | Status | Priority | Started | Dependencies | Details |
|----|-------|--------|----------|---------|--------------|---------|
| T1 | Example | 🔄 | HIGH | 2025-07-15 | - | [Details](tasks/T1.md) |
```

#### session_cache.md Template
```markdown
# Active Session State
*Last Updated: YYYY-MM-DD HH:MM:SS TZ*

## Current Tasks
- T1: Example Task (Active since 2025-07-15 10:00:00 IST)

## Recent Activity
- 2025-07-15 13:20:00 IST: Viewed integrated-rule-redesign.md

## Open Files
1. /path/to/file1.md
2. /path/to/file2.md
```

#### edit_history.md Template
```markdown
# Edit History
*Last Updated: YYYY-MM-DD HH:MM:SS TZ*

| Timestamp | File | Change | Task Reference |
|-----------|------|--------|----------------|
| 2025-07-15 13:15:00 IST | /path/to/file.md | Added core workflows section | T18 |
```

#### errorLog.md Template
```markdown
# Error Log
*Last Updated: YYYY-MM-DD HH:MM:SS TZ*

| Timestamp | Error Description | Location | Task Reference | Resolution |
|-----------|-------------------|----------|----------------|------------|
| 2025-07-15 13:10:00 IST | File not found | /path/to/file.md:45 | T18 | Approved recreation |
```

### 4.2 Template Requirements
- All templates must include timestamp in `YYYY-MM-DD HH:MM:SS TZ` format
- Must reference related task IDs when applicable
- Must maintain consistent header structure
- Must be stored in `/templates/` directory

### 4.3 Individual Session File Template
```markdown
# Session: <Session ID>
*Created: <Timestamp>*
*Last Updated: <Timestamp>*

## Active Tasks
- <Task ID>: <Task Title>

## Current State
<Brief description of current progress>

## Next Steps
<Planned actions>

## Open Files
<List of currently open files with paths>
```

## 5. Update Protocols

1. Update Categories and Sequence
2. Change Requirements Matrix
3. Session File Creation/Update Sequence
4. File Relationship Rules
5. Prohibited Cross-File Actions

## 6. Command System

1. Task Management Commands
2. Task Execution Commands
3. Memory Management Commands
4. Session Management Commands
5. Code Implementation Commands

## 7. Technical Standards

1. Executable Paths
2. File Operations Syntax
3. Path Resolution Rules
4. Timestamp Format
5. Block Edit Format
6. Tool Invocation Format

### 7.1 Executable Paths
- Node: `/Users/deepak/.nvm/versions/node/v23.11.0/bin/node`
- NPM: `/Users/deepak/.nvm/versions/node/v23.11.0/bin/npm`
- PNPM: `/Users/deepak/.nvm/versions/node/v23.11.0/bin/pnpm`
- Python: `/Users/deepak/miniconda3/bin/python`
- Use full paths when executing commands to ensure version consistency

## 8. Core Workflows (Essential)

### 8.1 Task Implementation
1. Start with task definition in tasks.md
2. Create individual task file
3. Implement ONLY outlined items
4. Validate against completion criteria
5. Update session_cache.md
6. Document in edit_history.md

### 8.2 Error Handling
1. Log error in errorLog.md
2. Check related session files
3. Verify operation prerequisites
4. Request approval for corrections
5. Document resolution in edit_history.md

### 8.3 File Updates
1. Check file existence
2. Request approval
3. Make minimal changes
4. Verify against validation rules
5. Update session cache if needed

### 8.4 Session Management
1. Create/update individual session file
2. Update session_cache.md
3. Maintain chronological order
4. Preserve all historical records
5. Never delete session files
