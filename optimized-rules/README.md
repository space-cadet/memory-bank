# Optimized Rules System

*Last Updated: April 15, 2025*

## Overview

This directory contains the modular version of the Integrated Code Rules and Memory Bank System, designed to reduce token usage while maintaining functionality.

## Key Features

- **Modular Architecture**: Core rules plus loadable modules
- **Dynamic Loading**: Load only modules relevant to current task
- **Token Efficiency**: Reduced context size for LLM interactions
- **Progressive Disclosure**: Start with minimal instructions, add more as needed
- **Task-Specific Guidance**: Suggest modules based on task type

## Directory Structure

```
optimized-rules/                        # Root directory
├── core/                               # Essential instructions
│   ├── core-rules.md                   # Minimal essential instructions
│   ├── command-reference.md            # Command syntax reference
│   ├── quickstart.md                   # Startup instructions
│   └── manifest.json                   # Module registry and metadata
│
├── modules/                            # Loadable rule modules
│   ├── documentation-rules.md          # Documentation standards
│   ├── implementation-rules.md         # Code implementation standards
│   ├── memory-management-rules.md      # Memory Bank file management
│   ├── session-management-rules.md     # Session tracking and management
│   ├── task-management-rules.md        # Multi-task tracking and switching
│   ├── error-handling-rules.md         # Error logging and resolution
│   └── tool-usage-rules.md             # Tool usage guidelines
│
├── context-store/                      # Context storage (equivalent to memory-bank)
│   ├── activeContext.md
│   ├── edit_history.md
│   ├── errorLog.md
│   ├── progress.md
│   ├── session_cache.md                # Enhanced to track loaded modules
│   └── tasks.md                        # Enhanced with module associations
│
├── docs/                               # Detailed documentation
│   ├── guides/                         # User guides
│   └── specifications/                 # Technical specifications
│
├── examples/                           # Example usage
│   ├── workflows/                      # Workflow examples
│   ├── commands/                       # Command examples
│   └── templates/                      # Template examples
│
├── transition/                         # Transition support tools
│   ├── compatibility-layer.md          # Backward compatibility
│   ├── migration-guide.md              # Migration instructions
│   └── module-mapping.json             # Mapping from monolithic to modular
│
└── loader.md                           # Module loading instructions
```

## Getting Started

1. Begin with core-rules.md for essential instructions
2. Use module loading commands to add specific functionality:
   ```
   <load_module>
   <module_name>module-name</module_name>
   </load_module>
   ```
3. See quickstart.md for basic workflow instructions
4. Refer to command-reference.md for command syntax

## Development Status

This is a development version of the optimized rules system. It exists alongside the original system to allow for testing and refinement before adoption.

## Technical Notes

- Each module is versioned using semantic versioning (X.Y.Z)
- Module dependencies are managed through the manifest.json file
- The session_cache.md file tracks which modules are currently loaded
- The task registry can associate specific tasks with recommended modules
