# Memory Bank Bootstrap System

*Last Updated: 2025-04-08*

## Bootstrap Purpose

This bootstrap file serves as the "kernel" of the Memory Bank system. It contains the core command definitions and fundamental structure that the LLM must recognize and implement immediately upon engaging with any Memory Bank.

## Command Definitions

### Reading Commands

| Command | Parameters | Description |
|---------|------------|-------------|
| `read_mb` | None | Load Critical tier files only (activeContext.md, progress.md, session_cache.md if exists) |
| `read_mb standard` | None | Load Critical + Essential tiers (adds projectbrief.md, .cursorrules) |
| `read_mb complete` | None | Load all Memory Bank files |
| `read_mb [file1] [file2]` | File names | Load only specified files |

### Update Commands

| Command | Parameters | Description |
|---------|------------|-------------|
| `update_mb` | None | Update only files with meaningful changes |
| `update_mb complete` | None | Update all Memory Bank files |
| `update_mb [file1] [file2]` | File names | Update only specified files |

### Session Commands

| Command | Parameters | Description |
|---------|------------|-------------|
| `continue_session` | None | Flag this as a continuation session; prioritize loading session_cache.md |
| `complete_session` | None | Mark session as complete, update Memory Bank accordingly |
| `cache_session` | None | Create continuation point with minimal updates |
| `start_session` | None | Begin a new session with fresh time-stamp |

## Knowledge Management Tiers

1. **Bootstrap Tier (Always Read First)**
   - `bootstrap.md` - Core command definitions and system structure

2. **Critical Tier (Default Read)**
   - `activeContext.md` - Current state, focus, and cross-references
   - `progress.md` - Status tracking and next priorities
   - `session_cache.md` - Continuity information for multi-session tasks (if exists)

3. **Essential Tier (Read on Demand)**
   - `projectbrief.md` - Core requirements and project scope
   - `.cursorrules` - Project patterns and implementation guidelines

4. **Reference Tier (Consult as Required)**
   - `productContext.md` - Why and how the project works
   - `systemPatterns.md` - Architecture and design patterns
   - `techContext.md` - Technical implementation details
   - Additional specialized documentation

## Session System

The Memory Bank system maintains continuity through:

1. **Time-stamped Session Logs**
   - Created at the start of each new chat
   - Stored in `/sessions/` directory with ISO date-time format
   - Records all significant progress during the session
   - Updated at session conclusion with accomplishments and pending tasks

2. **Session Cache**
   - Stores state between sessions
   - Contains pointers to most recent session log
   - Maintains active task list
   - Flags continuation status

## Core Implementation Behavior

When a Memory Bank system is loaded:

1. Bootstrap file (this document) is processed first
2. System checks for session_cache.md to determine continuity status
3. If continuing, the most recent session log is loaded
4. Critical tier files are loaded by default
5. Progressive loading applies for additional context as needed

## Progressive Loading Process

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

## Session Cache Format

```markdown
# Session Cache

## Status
[CONTINUING|COMPLETE]

## Current Task
[Brief description of in-progress work]

## Most Recent Session
[Filename of most recent session log]

## Files Consulted
- [List of files used in current session]

## Work Summary
- [Key accomplishments]
- [Current progress]
- [TODO items]

## Continuity Context
[Any specific context needed for continuation]
```

## Time-stamped Session Log Format

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

**Note**: This bootstrap file must be treated as the authoritative source for command definitions and core system behavior.
