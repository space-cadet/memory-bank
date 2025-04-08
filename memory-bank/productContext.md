# Product Context: Memory Bank System

## Purpose and Problem Statement
The Memory Bank system addresses the fundamental challenge of context loss between chat sessions. When working with AI assistants, each new session typically starts with limited or no knowledge of previous work, causing:

1. Knowledge fragmentation across sessions
2. Repetitive explanations of project context
3. Inefficient use of tokens for re-establishing context
4. Inconsistent implementation approaches
5. Loss of important design decisions and rationales

The Memory Bank provides a structured solution to these problems by maintaining comprehensive, accessible documentation that can be efficiently loaded at the start of each session.

## Core User Experience Goals

### For Implementers (AI Assistants)
- Quick access to critical context at session start
- Clear understanding of project state and progress
- Efficient retrieval of specific technical details
- Ability to maintain consistency across sessions
- Structured mechanism for updating project knowledge

### For End Users
- Continuity of experience across multiple sessions
- Reduced need to re-explain project context
- Confidence that design decisions will be preserved
- Ability to effectively manage complex, long-running projects
- Transparent insight into project status and progress

## Key System Capabilities

### Progressive Loading
The system optimizes token usage by loading only the necessary documentation based on the current task context:

```
flowchart TD
    Start[Session Start] --> LoadCritical[Load Critical Tier]
    LoadCritical --> TaskAssessment{Assess Task Needs}
    TaskAssessment -->|Basic Context| UseCurrentInfo[Use Current Info]
    TaskAssessment -->|More Detail Needed| LoadEssential[Load Essential Tier]
    TaskAssessment -->|Technical Details Needed| LoadReference[Load Reference Tier]
    UseCurrentInfo --> TaskExecution[Execute Task]
    LoadEssential --> TaskExecution
    LoadReference --> TaskExecution
```

### Session Continuity
The system maintains context across sessions through a specialized caching mechanism:

1. When a session is incomplete, create a session_cache.md file
2. Record current task state, files consulted, and continuity context
3. Set status flag to CONTINUING
4. At start of next session, check for session_cache.md
5. If found with CONTINUING status, load the cache to restore context

### Knowledge Management
The tiered documentation approach ensures information is organized based on relevance and frequency of access:

- **Critical Tier**: Current state and focus (accessed every session)
- **Essential Tier**: Core requirements and guidelines (accessed regularly)
- **Reference Tier**: Detailed technical information (accessed as needed)

## Interaction Model
The Memory Bank uses a command-based interaction model to control information access and updates:

1. Reading commands (`read_mb`) to control what information is loaded
2. Update commands (`update_mb`) to control what information is updated
3. Session commands (`continue_session`, `complete_session`, `cache_session`) to manage continuity

This approach gives end users explicit control over information flow while optimizing token usage.

## User Benefits

1. **Efficiency**: Minimize token usage through progressive loading
2. **Continuity**: Maintain perfect context across multiple sessions
3. **Consistency**: Ensure implementation approaches remain consistent
4. **Transparency**: Provide clear visibility into project status
5. **Control**: Enable explicit management of information flow

Last Updated: April 8, 2025