# Project Brief

## Memory Bank System

The Memory Bank system provides structured documentation and context management for AI assistants working on software development projects. It maintains project continuity across multiple sessions while optimizing resource usage.

## Core Components

- **Task Management**: Registry of tasks and subtasks with status tracking
- **Context Preservation**: Storing task state in dedicated context files
- **Documentation Standards**: Consistent formatting and organization
- **File Organization**: Modular structure for efficient access
- **Implementation Workflows**: Standardized processes for development

## Key Features (April 2025)

- Multi-task support with clear context boundaries
- Task hierarchies with parent-child relationships
- Modular task context files (integrated-rules-v5.md)
- File rotation for size management
- Database integration for efficient storage (in progress)
- Optimized rules system for token efficiency (in progress)

## Organization

- `/memory-bank/`: Core memory bank files
- `/memory-bank/task_contexts/`: Individual task context files
- `/memory-bank/subtasks/`: Detailed subtask contexts
- `/memory-bank/archive/`: Archived files
- `/templates/`: Templates for memory bank documents
- `/optimized-rules/`: Modular rules system (in development): Memory Bank System

## Overview
The Memory Bank is a structured documentation system designed to maintain perfect project knowledge across chat sessions. It uses a progressive loading approach to optimize token usage while preserving critical context.

## Core Requirements

### 1. Progressive Loading System
- Implement tiered documentation access (Critical, Essential, Reference)
- Load only necessary files based on context requirements
- Support explicit commands for controlling document loading

### 2. Session Continuity
- Maintain context across multiple chat sessions
- Use session_cache.md for temporary continuity information
- Support differential updates to minimize token usage

### 3. Documentation Structure
- Maintain a clear hierarchy of documentation files
- Provide cross-references between related components
- Organize content to facilitate quick context retrieval

### 4. Command System
- Support explicit commands for reading memory bank files
- Enable targeted updates of specific files
- Provide session management commands

## Project Scope
The Memory Bank system will serve as a meta-documentation system for itself, demonstrating the principles and practices it aims to establish. It will focus on:

1. Establishing a robust documentation structure
2. Implementing the progressive loading mechanism
3. Creating the session continuity system
4. Demonstrating effective knowledge management across sessions

## Success Criteria
- Complete documentation structure with all required files
- Functional progressive loading system
- Effective session continuity mechanism
- Clear demonstration of the Memory Bank system's capabilities

Last Updated: April 8, 2025