---
tags:
  - memory-bank
  - reference
  - quick-guide
  - commands
  - usage
---

# Memory Bank Quick Reference

## Core Principles

The Memory Bank system has been optimized for:
- **Efficiency**: Minimal token usage through progressive loading
- **Continuity**: Seamless work across multiple chat sessions
- **Flexibility**: Commands to control memory bank behavior
- **Practicality**: Only load what you need, when you need it

## Memory Bank Commands

### Reading Commands

| Command | Description |
|---------|-------------|
| `read_mb` | Read default Critical tier files (activeContext.md, progress.md) |
| `read_mb standard` | Load Critical + Essential tiers (adds projectbrief.md, .cursorrules) |
| `read_mb complete` | Load all Memory Bank files |
| `read_mb [file1] [file2]` | Load specific files only |

### Update Commands

| Command | Description |
|---------|-------------|
| `update_mb` | Update only files with meaningful changes |
| `update_mb complete` | Update all Memory Bank files |
| `update_mb [file1] [file2]` | Update specific files only |

### Session Commands

| Command | Description |
|---------|-------------|
| `continue_session` | Flag that this is a continuation, prioritize session_cache.md |
| `complete_session` | Mark session as complete, update Memory Bank |
| `cache_session` | Create continuation point with minimal updates |

## Usage Patterns

### Starting a New Project

1. Issue `read_mb` command to check for existing Memory Bank
2. If no Memory Bank exists, create one with `create_mb`
3. Setup basic project structure with essential files
4. Issue `update_mb complete` to initialize all files

### Typical Work Session

1. Issue `read_mb` to load minimal context
2. Work on specific task
3. Issue `update_mb` to update relevant files
4. Or use `cache_session` if work will continue in next session

### Continuing Previous Work

1. Issue `continue_session` to load from session cache
2. Complete the task
3. Issue `complete_session` when finished

### Working on Complex Features

1. Issue `read_mb standard` to get essential context
2. Load specific additional files as needed with `read_mb [file]`
3. Work on feature
4. Use `cache_session` between multi-session tasks
5. Use `complete_session` when feature is complete

## File Structure

### Critical Tier Files
- `activeContext.md` - Current state and focus
- `progress.md` - Status tracking and priorities
- `session_cache.md` - Continuity information (if continuing)

### Essential Tier Files
- `projectbrief.md` - Core requirements and scope
- `.cursorrules` - Project patterns and guidelines

### Reference Tier Files
- `productContext.md` - Why this project exists
- `systemPatterns.md` - Architecture and design patterns
- `techContext.md` - Technical implementation details
- Additional specialized documentation

## Session Cache Format

The session_cache.md file contains:
- **Status**: COMPLETE or CONTINUING
- **Current Task**: What's being worked on
- **Files Consulted**: Memory bank and project files used
- **Work Summary**: What's done and what remains
- **Continuity Context**: Important details for next session

## Best Practices

1. **Minimize Loading**: Only load what you need for current task
2. **Use Session Cache**: For multi-session tasks
3. **Update Selectively**: Only update what has changed
4. **Be Explicit**: Use commands to control behavior
5. **Maintain Critical Files**: Keep activeContext.md and progress.md up to date

## Example Workflow

```
User: Start work on the authentication system
AI: *Issues read_mb*
AI: I see we need to implement authentication. Let me check relevant files...
AI: *Issues read_mb auth-layer-design.md*
--- Work occurs ---
User: Let's continue this in another session
AI: *Issues cache_session*
AI: I've cached our progress. We can continue seamlessly next time.

--- Later, in a new session ---
User: Let's continue our authentication work
AI: *Issues continue_session*
AI: I see we were implementing JWT authentication. Let's continue...
--- Work continues and completes ---
AI: *Issues complete_session*
AI: I've updated all memory bank files with our completed work.
```
