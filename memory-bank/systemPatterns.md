# System Patterns

## Modular Task Context Pattern

*Added: April 17, 2025*

### Description
The Modular Task Context pattern breaks down the monolithic session_cache.md into smaller, focused files. Each task and complex subtask gets a dedicated context file, while session_cache.md becomes a lightweight index.

### Structure
- `session_cache.md`: Lightweight index pointing to task context files
- `task_contexts/`: Directory for individual task context files
- `subtasks/`: Directory for detailed subtask context files

### Benefits
- Prevents any single file from growing too large
- Enables focused context loading for specific tasks
- Supports complex task hierarchies
- Improves navigation between related task contexts
- Facilitates better organization of work

### Implementation
Implemented in integrated-rules-v5.md with comprehensive guidelines for:
- Task decomposition
- Context file management
- Task hierarchy relationships
- Parent-child task structures: Memory Bank Architecture

## Overall Architecture
The Memory Bank uses a tiered documentation architecture with progressive loading capabilities and session continuity mechanisms. The system is designed around these key components:

```
flowchart TD
    User[User] <--> Commands[Command System]
    Commands --> Reader[Progressive Loader]
    Commands --> Writer[Differential Updater]
    Commands --> SessionMgr[Session Manager]
    
    Reader --> DocStore[Documentation Store]
    Writer --> DocStore
    SessionMgr --> Cache[Session Cache]
    Cache <--> DocStore
    
    subgraph DocStore[Documentation Store]
        CriticalTier[Critical Tier]
        EssentialTier[Essential Tier]
        ReferenceTier[Reference Tier]
    end
```

## Core Design Patterns

### 1. Tiered Documentation Pattern
The system organizes information in tiers based on access frequency and importance:

- **Critical Tier**: High-frequency access, current state information
- **Essential Tier**: Medium-frequency access, foundational information
- **Reference Tier**: Low-frequency access, detailed technical information

This pattern enables efficient progressive loading, ensuring only necessary information is loaded for each context.

### 2. Progressive Loading Pattern
The system minimizes token usage by loading documentation in stages:

```
flowchart LR
    Start[Session Start] --> LoadCritical[Load Critical Tier]
    LoadCritical --> Assess{Need More?}
    Assess -->|Yes| LoadEssential[Load Essential]
    Assess -->|No| Execute[Execute Task]
    LoadEssential --> Assess2{Need More?}
    Assess2 -->|Yes| LoadReference[Load Reference]
    Assess2 -->|No| Execute
    LoadReference --> Execute
```

This pattern ensures optimal token usage while maintaining sufficient context for each task.

### 3. Session Continuity Pattern
The system maintains context across sessions through a caching mechanism:

```
flowchart TD
    SessionEnd[Session End] --> IsComplete{Complete?}
    IsComplete -->|Yes| UpdateAll[Update All Docs]
    IsComplete -->|No| CreateCache[Create Session Cache]
    
    NextStart[Next Session Start] --> CheckCache{Cache Exists?}
    CheckCache -->|Yes| LoadCache[Load Cache Context]
    CheckCache -->|No| NormalStart[Normal Start]
```

This pattern enables multi-session tasks without losing context or requiring excessive documentation reloading.

### 4. Command-Driven Interface Pattern
The system uses explicit commands to control information flow:

- **Reading Commands**: Control what information is loaded
- **Update Commands**: Control what information is updated
- **Session Commands**: Control session continuity

This pattern gives users explicit control over the system's behavior while maintaining a simple interface.

### 5. Differential Update Pattern
The system minimizes token usage by updating only necessary information:

```
flowchart TD
    UpdateRequest[Update Request] --> FileChanged{File Changed?}
    FileChanged -->|Yes| MeaningfulChange{Meaningful?}
    FileChanged -->|No| Skip[Skip Update]
    MeaningfulChange -->|Yes| Update[Update File]
    MeaningfulChange -->|No| Skip
```

This pattern ensures efficient token usage during documentation updates.

## Component Relationships

### Documentation Hierarchy
Files build upon each other in a clear hierarchical relationship:

```
flowchart TD
    PB[projectbrief.md] --> PC[productContext.md]
    PB --> SP[systemPatterns.md]
    PB --> TC[techContext.md]
    
    PC --> AC[activeContext.md]
    SP --> AC
    TC --> AC
    
    AC --> P[progress.md]
    AC --> CL[changelog.md]
    AC --> SC[session_cache.md]
```

This hierarchy ensures information flows logically from foundational concepts to specific implementation details.

### Command System
The command system integrates with all other components:

```
flowchart TD
    ReadMB[read_mb] --> PL[Progressive Loader]
    UpdateMB[update_mb] --> DU[Differential Updater]
    SessionCMD[Session Commands] --> SM[Session Manager]
    
    PL --> DocStore[Documentation Store]
    DU --> DocStore
    SM --> Cache[Session Cache]
    SM --> DocStore
```

This integration ensures all system components work together coherently while maintaining separation of concerns.

## Data Flow Patterns

### Reading Flow
```
flowchart LR
    Command[read_mb Command] --> Parse[Parse Command]
    Parse --> Identify[Identify Files]
    Identify --> Load[Load Files]
    Load --> Integrate[Integrate Context]
```

### Writing Flow
```
flowchart LR
    Command[update_mb Command] --> Parse[Parse Command]
    Parse --> Identify[Identify Files]
    Identify --> Compare[Compare Changes]
    Compare --> Update[Update Files]
```

### Session Flow
```
flowchart LR
    Command[Session Command] --> Parse[Parse Command]
    Parse --> Action[Determine Action]
    Action -->|continue| LoadCache[Load Cache]
    Action -->|complete| UpdateAll[Update All]
    Action -->|cache| CreateCache[Create Cache]
```

Last Updated: April 8, 2025