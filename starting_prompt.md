# Memory Bank System - Starting Prompt

This prompt establishes the Memory Bank system, which maintains perfect project knowledge across AI assistant chat sessions. It's designed for efficient context management with progressive loading and session continuity.

## 1. Core Principles & Memory Organization

### 1.1 Memory Bank Purpose

The Memory Bank is a structured documentation system that:
- Maintains complete project knowledge across multiple chat sessions
- Uses progressive loading to optimize token usage
- Provides explicit commands for memory management
- Creates time-stamped session logs for project history
- Implements session caching for continuity

### 1.2 Knowledge Management Tiers

Memory is organized in four tiers with different loading priorities:

1. **Bootstrap Tier (Always Load First)**
   - `bootstrap.md` - Core command definitions and system structure
   - Must be processed before any other operations

2. **Critical Tier (Default Load)**
   - `activeContext.md` - Current state, focus, and cross-references
   - `progress.md` - Status tracking and next priorities
   - `session_cache.md` - Continuity information (if exists)

3. **Essential Tier (Load on Demand)**
   - `projectbrief.md` - Core requirements and project scope
   - `.cursorrules` - Project patterns and implementation guidelines

4. **Reference Tier (Consult as Required)**
   - `productContext.md` - Why and how the project works
   - `systemPatterns.md` - Architecture and design patterns
   - `techContext.md` - Technical implementation details
   - Additional specialized documentation

## 2. Memory Bank Command System

### 2.1 Reading Commands

| Command | Description |
|---------|-------------|
| `read_mb` | Load Critical tier files only |
| `read_mb standard` | Load Critical + Essential tiers |
| `read_mb complete` | Load all Memory Bank files |
| `read_mb [file1] [file2]` | Load specific files only |

### 2.2 Update Commands

| Command | Description |
|---------|-------------|
| `update_mb` | Update only files with meaningful changes |
| `update_mb complete` | Update all Memory Bank files |
| `update_mb [file1] [file2]` | Update specific files only |

### 2.3 Session Commands

| Command | Description |
|---------|-------------|
| `continue_session` | Flag this as a continuation; prioritize session_cache.md |
| `complete_session` | Mark session as complete, update Memory Bank |
| `cache_session` | Create continuation point with minimal updates |
| `start_session` | Begin a new session with fresh time-stamp |

## 3. Session Management System

### 3.1 Time-stamped Session Logs

For each chat session:
- Create a new time-stamped file in the `/sessions/` directory
- Use ISO format: `YYYY-MM-DDTHHMMSS.md`
- Record all significant progress during the session
- Document decisions made with rationale
- Update at conclusion with accomplishments and pending tasks

### 3.2 Session Cache Mechanism

The `session_cache.md` file:
- Maintains state between sessions
- Contains pointer to most recent session log
- Includes status flag (COMPLETE or CONTINUING)
- Lists files consulted in current session
- Summarizes in-progress work
- Provides context needed for continuation

### 3.3 Default Session Workflow

1. Start by checking for `session_cache.md`
2. If continuing, load the most recent session log
3. Create new time-stamped session log
4. Update session log throughout conversation
5. Before ending, update session log with status
6. If continuing, update session_cache.md
7. If complete, update all relevant Memory Bank files

## 4. Progressive Loading System

### 4.1 Default Loading Process

1. Always load `bootstrap.md` first
2. Check for `session_cache.md` to determine continuity
3. Load Critical tier files by default
4. Assess knowledge needs for current task
5. Load additional files only when necessary
6. Use explicit commands for deeper context

### 4.2 Implementation Flow

```
flowchart TD
    Start[Start Session] --> ReadBootstrap[Read Bootstrap File]
    ReadBootstrap --> CheckCache{Check session_cache.md}
    
    CheckCache -->|Exists| LoadCache[Load Session Cache]
    LoadCache --> LoadRecentSession[Load Most Recent Session Log]
    LoadRecentSession --> LoadCritical[Load Critical Tier]
    
    CheckCache -->|Doesn't Exist| CreateSession[Create New Session Log]
    CreateSession --> LoadCritical
    
    LoadCritical --> AssessNeeds{Need More Context?}
    AssessNeeds -->|Yes| LoadRequest[Load Requested Files]
    AssessNeeds -->|No| BeginWork[Begin Work]
    
    LoadRequest --> BeginWork
    
    BeginWork --> UpdateProgress[Update Progress Regularly]
    UpdateProgress --> SessionEnd{Session Ending?}
    
    SessionEnd -->|Yes, Complete| UpdateFull[Update Full Memory Bank]
    SessionEnd -->|Yes, Continuing| UpdateCache[Update Session Cache]
    SessionEnd -->|No| UpdateProgress
    
    UpdateFull --> End[End Session]
    UpdateCache --> End
```

## 5. Core File Structure & Format

### 5.1 bootstrap.md

Core command definitions and structure that the LLM must recognize immediately.

```markdown
# Memory Bank Bootstrap System

*Last Updated: [Date]*

## Bootstrap Purpose
[Purpose statement]

## Command Definitions
[Command tables]

## Knowledge Management Tiers
[Tier definitions]

## Session System
[Session system description]

## Core Implementation Behavior
[Implementation details]
```

### 5.2 activeContext.md

Current state, focus, and cross-references.

```markdown
# Active Context

*Last Updated: [Date]*

## Current Focus
[Current focus description]

## System State
[Current system state]

## Active Decisions
[List of active decisions]

## Cross-References
[Related file references]

## Current Considerations
[Current considerations]

## Next Actions
[List of next actions]
```

### 5.3 progress.md

Status tracking and next priorities.

```markdown
# Project Progress

*Last Updated: [Date]*

## What Works
[List of completed items with ✅]

## In Progress
[List of in-progress items with 🔄]

## To Do
[List of pending items with ⬜]

## Known Issues
[List of known issues]

## Next Priorities
[List of next priorities]

## Project Status
[Current project status]
```

### 5.4 session_cache.md

Continuity information for multi-session tasks.

```markdown
# Session Cache

*Created: [Date]*

## Status
[CONTINUING or COMPLETE]

## Current Task
[Brief description of in-progress work]

## Most Recent Session
[Filename of most recent session log]

## Files Consulted
[List of files used in current session]

## Work Summary
[Key accomplishments and current progress]

## Continuity Context
[Any specific context needed for continuation]
```

### 5.5 Time-stamped Session Logs

History of all chat sessions.

```markdown
# Session Log: [ISO Date-Time]

## Session Goals
[What this session aims to accomplish]

## Progress Log
[Chronological record of significant progress]

## Decisions Made
[Key decisions and their rationale]

## End of Session Status
[Complete or continuing]

## Accomplishments
[What was completed in this session]

## Pending Tasks
[What remains to be done]
```

## 6. Implementation Guidelines

### 6.1 Safety & Scope

1. Operate exclusively within the designated project directory and subdirectories
2. Do not access, read, or modify files outside defined scope
3. Avoid executing shell commands that might affect system state
4. Always verify paths before file operations

### 6.2 Step-by-Step Approval

1. Propose clear, step-by-step plans for any task involving file modifications
2. Wait for explicit user approval before implementing plans
3. Focus on necessary files/components related to the task
4. Avoid unnecessary project-wide scans

### 6.3 Update Process

1. Only update files with meaningful changes
2. Always update timestamps when modifying files
3. Ensure cross-references remain valid after updates
4. Use session_cache.md for continuity rather than full updates
5. Prioritize updating activeContext.md and progress.md for general status

### 6.4 Style Conventions

1. Use consistent formatting across all Memory Bank files
2. Include creation and last updated timestamps
3. Use clear section headings with ## heading level
4. Use status indicators: ✅ (Complete), 🔄 (In Progress), ⬜ (Not Started)
5. Include cross-references where appropriate

## 7. Core Implementation Behavior

When starting a session with a Memory Bank:

1. Always read `bootstrap.md` first to understand command system
2. Check for `session_cache.md` to determine if continuing a session
3. If continuing, load the most recent session log
4. Create a new time-stamped session log in the `/sessions/` directory
5. Load critical tier files by default
6. Process any explicit memory bank commands
7. Update session log throughout the conversation
8. Before ending, either update session_cache.md (if continuing) or update all Memory Bank files (if complete)

Remember: The Memory Bank's effectiveness comes from:
- Loading only what's needed (minimize token usage)
- Using session_cache.md for continuity across sessions
- Updating differentially based on actual changes
- Following explicit memory bank commands when provided

The goal is efficient resource use while maintaining complete project knowledge across multiple chat sessions.
