# Integrated Code Rules and Memory Bank System

*Last Updated: April 8, 2025*

## Overview

The Integrated Code Rules and Memory Bank System provides a comprehensive framework for maintaining consistent coding standards and preserving project knowledge across multiple chat sessions with AI assistants. This system balances task execution efficiency with comprehensive documentation, allowing for continuity across sessions while optimizing token usage.

## Key Features

- **Task-First Approach**: Prioritizing immediate task execution with minimal context loading
- **Progressive Loading**: Tiered documentation approach to optimize token usage
- **Session Continuity**: Mechanisms for maintaining context across multiple chat sessions
- **Standardized Tools**: Consistent XML-formatted tool usage for all operations
- **Comprehensive Documentation**: Structured framework for maintaining project knowledge

## Directory Structure

- `/` - Root directory containing the integrated system documentation
  - `integrated-rules.md` - Main documentation combining Code Rules and Memory Bank
  - `code-rules-and-memory-bank.md` - Original detailed specifications
  - `bootstrap.md` - Core system structure, loaded only when essential
  - `/memory-bank/` - Contains all Memory Bank documentation files
    - `activeContext.md` - Current state relevant to immediate tasks
    - `progress.md` - Status tracking and next priorities
    - `session_cache.md` - Continuity information for multi-session tasks
    - `projectbrief.md` - Core requirements and project scope
    - `.cursorrules` - Project patterns and implementation guidelines
    - `productContext.md` - Why and how the project works
    - `systemPatterns.md` - Architecture and design patterns
    - `techContext.md` - Technical implementation details
    - `changelog.md` - Record of system changes and updates
  - `/sessions/` - Contains time-stamped session logs
  - `/examples/` - Contains example usage patterns and templates

## Getting Started

1. Review `integrated-rules.md` for a complete understanding of the system
2. Explore the Memory Bank structure in the `/memory-bank/` directory
3. Use the command system to load and update Memory Bank files as needed
4. Follow the task-first implementation workflow for efficient execution
5. Maintain session continuity using the session cache mechanism

## Command System

### Task Execution Commands

| Command | Description |
|---------|-------------|
| `do_task [task]` | Execute specific task with minimal context loading |
| `continue_task` | Resume previous task using minimal context from cache |
| `complete_task` | Finish current task with targeted documentation updates |
| `verify_task` | Check implementation against code standards |

### Memory Management Commands

| Command | Description |
|---------|-------------|
| `read_mb` | Load Critical tier files needed for current task |
| `read_mb [file]` | Load specific file only |
| `read_mb standard` | Load Critical + Essential tiers |
| `read_mb complete` | Load all Memory Bank files (rarely needed) |
| `update_mb [file]` | Update specific file with minimal changes |

### Session Management Commands

| Command | Description |
|---------|-------------|
| `continue_session` | Flag this as a continuation; prioritize session_cache.md |
| `complete_session` | Mark session as complete, update necessary docs |
| `cache_session` | Create continuation point with minimal updates |
| `start_session` | Begin new session with fresh timestamp |

## Workflow

The system implements a task-first workflow:

1. Receive a task
2. Analyze immediate task needs
3. Load minimal required context
4. Execute first step
5. Load additional context only if needed for next steps
6. Verify implementation against standards
7. Update required documentation
8. Complete or cache the session

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Initial concept based on Memory Bank and Code Rules methodologies
- Designed for optimal interaction with AI assistants
- Created to balance efficiency with comprehensive documentation