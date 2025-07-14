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

## 2. Memory Bank Structure

1. Directory Structure
2. File Relationships
3. Core Files Overview
4. Individual Task Files
5. Individual Session Files
6. Validation Rules
7. File Size Management Protocol
8. Session Cache Management
9. Session Cache Update Protocol
10. Core File Update Workflows

## 3. File Templates

1. tasks.md (Task Registry)
2. session_cache.md
3. edit_history.md
4. errorLog.md
5. Individual Session File Template

## 4. Update Protocols

1. Update Categories and Sequence
2. Change Requirements Matrix
3. Session File Creation/Update Sequence
4. File Relationship Rules
5. Prohibited Cross-File Actions

## 5. Command System

1. Task Management Commands
2. Task Execution Commands
3. Memory Management Commands
4. Session Management Commands
5. Code Implementation Commands

## 6. Technical Standards

1. Executable Paths
2. File Operations Syntax
3. Path Resolution Rules
4. Timestamp Format
5. Block Edit Format
6. Tool Invocation Format

### 6.1 Executable Paths
- Node: `/Users/deepak/.nvm/versions/node/v23.11.0/bin/node`
- NPM: `/Users/deepak/.nvm/versions/node/v23.11.0/bin/npm`
- PNPM: `/Users/deepak/.nvm/versions/node/v23.11.0/bin/pnpm`
- Python: `/Users/deepak/miniconda3/bin/python`
- Use full paths when executing commands to ensure version consistency

## 7. Core Workflows

1. Task-First Implementation Flow
2. Error Handling Flow
3. Session Transition Flow
4. File Update Workflow
