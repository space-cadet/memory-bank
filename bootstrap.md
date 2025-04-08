# Integrated Code Rules and Memory Bank Bootstrap

*Last Updated: 2025-04-08*

## Bootstrap Purpose

This bootstrap file serves as the "kernel" of the Integrated Code Rules and Memory Bank system. It contains the core command definitions and fundamental structure that the LLM must recognize and implement immediately upon engaging with this system.

## Command Definitions

### Task Execution Commands

| Command | Parameters | Description |
|---------|------------|-------------|
| `do_task [task]` | Task description | Execute specific task with minimal context loading |
| `continue_task` | None | Resume previous task using minimal context from cache |
| `complete_task` | None | Finish current task with targeted documentation updates |
| `verify_task` | None | Check implementation against code standards |

### Memory Management Commands

| Command | Parameters | Description |
|---------|------------|-------------|
| `read_mb` | None | Load Critical tier files needed for current task |
| `read_mb [file1] [file2]` | File names | Load specific files only |
| `read_mb standard` | None | Load Critical + Essential tiers |
| `read_mb complete` | None | Load all Memory Bank files (rarely needed) |
| `update_mb [file1] [file2]` | File names | Update specific files with minimal changes |
| `update_mb` | None | Update only files with meaningful changes |
| `update_mb complete` | None | Update all Memory Bank files |

### Session Management Commands

| Command | Parameters | Description |
|---------|------------|-------------|
| `continue_session` | None | Flag this as a continuation; prioritize session_cache.md |
| `complete_session` | None | Mark session as complete, update necessary docs |
| `cache_session` | None | Create continuation point with minimal updates |
| `start_session` | None | Begin new session with fresh timestamp |

### Code Implementation Commands

| Command | Parameters | Description |
|---------|------------|-------------|
| `verify_code` | None | Check code against project standards |
| `format_code` | None | Ensure code follows formatting guidelines |
| `document_code` | None | Update documentation for code changes |

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

## Task-First Implementation Flow

```
flowchart TD
    Start[Receive Task] --> Analyze[Analyze Immediate Task Needs]
    Analyze --> LoadMinimal[Load Minimal Required Context]
    LoadMinimal --> Execute[Execute First Step]
    Execute --> Evaluate{More Steps?}
    Evaluate -->|Yes| NextContext[Load Context for Next Step]
    NextContext --> NextStep[Execute Next Step]
    NextStep --> Evaluate
    Evaluate -->|No| Verify[Verify Against Standards]
    Verify --> Document[Update Required Documentation]
    Document --> End[End]
```

## Session Management Flow

```
flowchart TD
    Start[Start Session] --> CheckCache{Check session_cache.md}
    CheckCache -->|Exists| LoadCache[Load Session Cache]
    LoadCache --> LoadTask[Load Task-Relevant Files]
    
    CheckCache -->|Doesn't Exist| CreateSession[Create New Session Log]
    CreateSession --> LoadTask
    
    LoadTask --> ExecuteTask[Execute Task Steps]
    ExecuteTask --> SessionEnd{Session Ending?}
    
    SessionEnd -->|Yes, Complete| UpdateDocs[Update Documentation]
    SessionEnd -->|Yes, Continuing| UpdateCache[Update Session Cache]
    SessionEnd -->|No| ExecuteTask
    
    UpdateDocs --> End[End Session]
    UpdateCache --> End
```

## session_cache.md (Task-Oriented Version)

```markdown
# Session Cache

*Last Updated: [Date]*

## Status
[CONTINUING or COMPLETE]

## Current Task
[Specific task in progress]

## Current Step
[Exact step in the process]

## Critical Files
[Only files needed to continue the task]

## State Information
[Minimal state needed to continue]
```

## Time-stamped Session Logs

```markdown
# Session Log: [ISO Date-Time]

## Task Focus
[Specific tasks addressed in this session]

## Implementation Steps
[Steps taken during implementation]

## Decisions Made
[Key decisions with rationale]

## Status
[COMPLETE or CONTINUING]

## Next Steps
[Only if continuing]
```

## Documentation Decision Framework

| Change Type | Documentation Requirements |
|-------------|----------------------------|
| Interface changes | Update API docs, activeContext.md |
| Implementation details | Code comments only |
| Architecture changes | Update systemPatterns.md |
| New features | Update progress.md, projectbrief.md |
| Bug fixes | Update progress.md only |
| Refactoring | Minimal documentation unless patterns change |

**Note**: This bootstrap file must be treated as the authoritative source for command definitions and core system behavior. The system's effectiveness comes from balancing task efficiency with appropriate documentation, loading only what's needed when it's needed, and following a consistent, standardized approach to both code and documentation.
