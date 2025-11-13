# Project Brief

## Memory Bank System

The Memory Bank system provides structured documentation and context management for AI assistants working on software development projects. It maintains project continuity across multiple sessions while optimizing resource usage through progressive loading and efficient documentation patterns.

## Core Components

- **Task Management**: Comprehensive registry with status tracking, dependencies, and progress
- **Context Preservation**: Multi-tiered documentation system (Bootstrap, Critical, Essential, Reference)
- **Documentation Standards**: Consistent formatting, timestamps, and cross-references
- **File Organization**: Modular structure with isolated task files and session tracking
- **Implementation Workflows**: Standardized processes including Memory Bank Update Workflow v6.10
- **Web Viewer**: Single-file HTML viewer for memory bank visualization and navigation

## Key Features (November 2025)

**Operational Components**:
- Multi-task support with clear context boundaries and dependencies
- Task hierarchies with parent-child relationships and status tracking
- Modular task context files in dedicated tasks/ directory
- Tiered Knowledge Structure for optimized context loading (v6.10)
- Memory Bank Update Workflow with 8-step procedure and approval checkpoints
- Database migration verified (95% complete, 364 records, zero errors)
- CLI initialization system with selective component installation (mb init command)
- Web-based viewer with dual file discovery and navigation (Phase 1 complete)
- Integrated Rules v6.10 with comprehensive documentation and commit message standards

**Experimental/In Development Components**:
- Database-native paradigm (T21 Phase A complete, Phases B-E pending) - not ready for deployment
- Adaptive LLM-based format parser (T20a design phase complete)
- CLI task/session commands (T13 Phase 2 pending)

## Organization

- `/memory-bank/`: Core memory bank files and session tracking
  - `tasks/`: Individual task files (T0-T21, META-1)
  - `sessions/`: Session tracking and context files
  - `archive/`: Completed and archived tasks
  - `database/`: SQLite parser and query tools (experimental)
  - `implementation-details/`: System design documentation
- `/viewer/`: Web-based memory bank viewer (HTML, manifest generation, server)
- `/mb-cli/`: Command-line interface for memory bank operations
- `/t21-workflow-testing/`: Isolated workspace for database paradigm development (experimental)

## Project Evolution

### Phase 1: Foundation (April 2025)
- Initial structure setup with tiered documentation
- Multi-task support implementation
- Database migration planning and initial implementation

### Phase 2: Enhancement (May-July 2025)
- Rules optimization (v6.2-v6.9)
- Creative expression balance implementation
- AI consciousness exploration documentation
- Comprehensive rules redesign (v6.10)

### Phase 3: Expansion (October-November 2025)
- Memory Bank Viewer web interface (Phase 1 complete)
- Database parser implementation (T20, Phase 3 ongoing)
- Database migration verification (364 records, zero errors)
- Adaptive format parser design (T20a complete)
- Database-native workflow design (T21 Phase A complete)

### Phase 4: Integration (Planned)
- Database-native paradigm implementation (pending T21 Phase B-E)
- CLI task/session commands completion
- Adaptive parser Phase 1 implementation
- End-to-end testing and validation

## System Status

**Production Ready**:
- Text-first Memory Bank workflow (authoritative)
- Memory Bank Viewer Phase 1
- CLI init command with selective initialization
- Integrated Rules v6.10
- Database migration (verified, 95% complete)

**Experimental (Not Production Ready)**:
- Database-native paradigm (T21, T20, T20a)
- Database parsers and query tools (T20)
- CLI task/session commands (T13 Phase 2)

## Technical Foundation

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