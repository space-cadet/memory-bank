# Product Context: Memory Bank System

## Purpose and Problem Statement
The Memory Bank system addresses the fundamental challenge of context loss between chat sessions. When working with AI assistants, each new session typically starts with limited or no knowledge of previous work, causing:

1. Knowledge fragmentation across sessions
2. Repetitive explanations of project context
3. Inefficient use of tokens for re-establishing context
4. Inconsistent implementation approaches
5. Loss of important design decisions and rationales

The Memory Bank provides a structured solution by maintaining comprehensive, accessible documentation that can be efficiently loaded at the start of each session.

## Core User Experience Goals

### For Implementers (AI Assistants)
- Quick access to critical context at session start (Tiered Knowledge Structure)
- Clear understanding of project state and progress (19 active/completed tasks)
- Efficient retrieval of specific technical details (Web viewer for navigation)
- Ability to maintain consistency across sessions (documented workflows)
- Structured mechanism for updating project knowledge (Memory Bank Update Workflow v6.10)

### For End Users
- Continuity of experience across multiple sessions
- Reduced need to re-explain project context
- Confidence that design decisions are preserved and documented
- Ability to effectively manage complex, long-running projects
- Transparent insight into project status and progress (visible via viewer and task registry)

## Current System Capabilities

### Tiered Knowledge Structure (v6.10)
Progressive loading optimizes token usage by loading only necessary documentation:

**Bootstrap Tier** (Minimal Startup):
- tasks.md (registry of all tasks)
- activeContext.md (current focus)
Sufficient for understanding what's happening.

**Critical Tier** (Task-Focused):
- session_cache.md (current session state)
- edit_history.md (recent file modifications)
- errorLog.md (error history)

**Essential Tier** (Context Clarification):
- projectbrief.md (project overview)
- .cursorrules (implementation patterns)

**Reference Tier** (Deep Dives):
- productContext.md (product direction and capabilities)
- systemPatterns.md (architecture and design patterns)
- techContext.md (technical implementation details)

### Web Viewer Interface
Single-file HTML viewer (viewer.html, 1373 lines) with:
- Dual file discovery approaches (recursive directory scan and manifest-based)
- Memory bank file navigation and browsing
- Task registry visualization
- Session history tracking

### Memory Bank Update Workflow v6.10
Standardized 8-step procedure for updating documentation:
1. Determine system time and timezone
2. Update task files
3. Update implementation documentation
4. Handle session file (create if new, update if existing)
5. Update session cache
6. Update other relevant files
7. Update edit history (prepend entries)
8. Generate commit message with conventional commits format

### Database Migration System
Verified database integration (T3, 95% complete):
- 364 memory bank records successfully migrated to SQLite
- Zero data integrity issues (0 orphaned records, 0 circular dependencies)
- Multi-project support (memory-bank and spin_network_app)
- Non-destructive initialization with selective component installation

### CLI Interface (mb init command, 85% complete)
- Selective initialization: --core, --templates, --database, --full, --skip-existing
- Timezone-agnostic setup with automatic user timezone detection
- Database template inclusion and migration script support
- Non-destructive by default (skips existing files with guidance prompts)

## Experimental/In Development

### Database-Native Paradigm (T21, T20, T20a)
**Status**: Phase A complete, not ready for deployment

Planned future paradigm where database becomes authoritative source and text files are generated output:
- Phase A (Complete): 8-table schema with 21 indexes, dual init scripts
- Phase B (Planned): Database insert functions
- Phase C (Planned): Text regeneration functions  
- Phase D (Planned): CLI workflow commands
- Phase E (Planned): End-to-end testing

### Adaptive Format Parser (T20a)
**Status**: Design phase complete, not ready for deployment

Multi-project format compatibility system:
- Format variation analysis (8 variations across 4 projects)
- LLM-driven format detection and normalization
- Universal schema supporting different project conventions
- Ready for Phase 1 implementation (LLM prompt design)

## User Benefits

1. **Efficiency**: Progressive loading and tiered structure minimize token usage
2. **Continuity**: Perfect context preservation across sessions with web viewer and task tracking
3. **Consistency**: Standardized workflows and documented patterns ensure consistent implementation
4. **Transparency**: Clear visibility into project status through viewer, tasks, and sessions
5. **Control**: Explicit user control over component initialization and information flow
6. **Accessibility**: Web viewer provides non-technical access to memory bank documentation

## Future Direction

The system is evolving toward database-native architecture while maintaining text-first operational stability. Planned enhancements include:
- Full database-native paradigm implementation
- Adaptive format parsing for multi-project support
- Complete CLI command suite (task, session, template management)
- LLM integration for intelligent querying and analysis

*Last Updated: 2025-11-13 18:46:25 IST*