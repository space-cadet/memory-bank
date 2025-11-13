# Memory Bank System - Project Documentation

*Last Updated: 2025-11-13 18:46:25 IST*

## Overview

The Memory Bank system provides structured documentation and context management for AI assistants working on long-running software projects. It maintains perfect project continuity across multiple sessions while optimizing token usage through progressive loading and efficient documentation patterns.

**Current Status**: Production-stable text-first system with experimental database paradigm in development.

## Key Features

**Operational (Production Ready)**:
- **Tiered Knowledge Structure**: Bootstrap → Critical → Essential → Reference loading
- **Text-First Workflow**: Markdown-based authoritative documentation
- **Task Management**: Registry with 20+ tasks, status tracking, and dependency management
- **Session Continuity**: Multi-session context preservation with session cache
- **Memory Bank Viewer**: Web-based viewer for file navigation and visualization
- **CLI Interface**: `mb init` command with selective component installation
- **Integrated Rules v6.10**: Comprehensive documentation with Memory Bank Update Workflow
- **Database Migration**: Verified 95% complete, 364 records migrated, zero errors

**Experimental (In Development, Not Production Ready)**:
- **Database-Native Paradigm**: T21 Phase A complete, Phases B-E pending
- **Adaptive Format Parser**: T20a design phase complete, Phase 1 pending
- **CLI Task/Session Commands**: T13 Phase 2 pending (only mb init complete)

## Project Structure

```
/Users/deepak/code/memory-bank/
├── README.md (this file)
├── integrated-rules-v6.10.md (v6.1-v6.10 versions available)
├── memory-bank/
│   ├── Core Files:
│   │   ├── activeContext.md (current session state)
│   │   ├── tasks.md (task registry with 20+ tasks)
│   │   ├── session_cache.md (multi-task session tracking)
│   │   ├── edit_history.md (chronological file modifications)
│   │   ├── errorLog.md (error tracking and resolutions)
│   │   ├── progress.md (project status and milestones)
│   │   ├── changelog.md (system changes, November 2025 entries)
│   │
│   ├── Documentation:
│   │   ├── projectbrief.md (project overview and scope)
│   │   ├── productContext.md (why and how the system works)
│   │   ├── systemPatterns.md (architecture and design patterns)
│   │   ├── techContext.md (technical implementation details)
│   │   ├── .cursorrules (implementation guidelines)
│   │
│   ├── Tasks:
│   │   └── tasks/ directory with T0-T21 and META-1 files
│   │       ├── T21.md (Database-Native Workflow, Phase A)
│   │       ├── T20a.md (Adaptive Format Parser, design complete)
│   │       ├── T20.md (Database Parser, Phase 3 in progress)
│   │       ├── T19.md (Memory Bank Viewer, Phase 2 in progress)
│   │       ├── T17.md (Rules v6.10, maintenance ongoing)
│   │       ├── T13.md (CLI, 85% complete)
│   │       ├── T3.md (Database Migration, 95% complete)
│   │       └── ... (T0-T18 additional tasks)
│   │
│   ├── Sessions:
│   │   └── sessions/ directory with time-stamped session files
│   │       ├── 2025-11-13-evening.md (current)
│   │       ├── 2025-11-12-evening.md
│   │       ├── 2025-11-11-evening.md
│   │       └── ... (session history)
│   │
│   ├── Implementation Details:
│   │   └── implementation-details/
│   │       ├── database-update-workflow-plan.md (T21 design)
│   │       ├── adaptive-parser-plan.md (T20a design)
│   │       ├── database-parser-plan.md (T20 implementation)
│   │       ├── memory-bank-viewer.md (T19 design)
│   │       ├── database-planning/ (migration docs)
│   │       ├── consciousness-dialogs/ (T16 dialog series)
│   │       └── ... (additional implementation notes)
│   │
│   ├── Database (Experimental):
│   │   └── database/
│   │       ├── memory_bank.db (SQLite database)
│   │       ├── parse-edits.js (parser for edit_history.md)
│   │       ├── parse-tasks.js (parser for tasks.md)
│   │       ├── query.js (query interface)
│   │       └── schema files
│   │
│   └── Archive:
│       ├── Completed tasks from April 2025
│       └── Historical documentation
│
├── viewer/
│   ├── viewer.html (1373-line single-file viewer)
│   ├── generate-manifest.js (file discovery)
│   ├── manifest.json (file catalog)
│   ├── server.js (optional HTTP server)
│   └── README.md (viewer documentation)
│
├── mb-cli/
│   ├── src/
│   │   ├── commands/
│   │   │   └── init.js (selective initialization)
│   │   └── index.js (CLI entry point)
│   ├── package.json
│   └── README.md (CLI documentation)
│
├── t21-workflow-testing/ (Experimental)
│   ├── database/
│   │   ├── schema.sql (8-table schema)
│   │   ├── init-schema.js (better-sqlite3 init)
│   │   └── init-schema-sqljs.js (sql.js init)
│   ├── package.json
│   └── docs/SETUP.md
│
└── templates/
    ├── Task file templates
    ├── Session file templates
    └── Memory Bank file templates
```

## Getting Started

### Load Project Memory
Start any session with the Memory Bank:
```bash
# Minimal startup (Bootstrap tier)
# Load: tasks.md, activeContext.md

# Task-focused context (Critical tier)
# Load: session_cache.md, edit_history.md, errorLog.md

# Full context (All tiers)
# Load: projectbrief.md, systemPatterns.md, techContext.md, productContext.md
```

### Using the Memory Bank Viewer
```bash
cd viewer
node server.js
# Open browser to http://localhost:3000
# Browse memory bank files and task registry
```

### Using the CLI
```bash
cd mb-cli
node src/index.js init
# Options: --core, --templates, --database, --full, --skip-existing
```

## Core Workflows

### Memory Bank Update Workflow (v6.10, Section 6.5)

**8-Step Production Procedure**:
1. Determine system time and timezone (IST standard)
2. Update individual task file (with progress, timestamp)
3. Update tasks.md master registry
4. Update implementation-details files
5. Handle session file (create if new, update if existing)
6. Update session_cache.md (metadata, task status)
7. Update other files (activeContext.md, errorLog.md, progress.md, changelog.md)
8. Update edit_history.md (prepend entries with timestamp and task ID)

### Task Management Workflow

1. Create individual task file in `tasks/` directory
2. Add task to `tasks.md` registry
3. Track progress in session files
4. Update task file with completion status
5. Move to completed section when done

### Session Continuity

1. At session start: Load `tasks.md` and `activeContext.md` (Bootstrap)
2. Check `session_cache.md` for continuation context
3. Load individual session file if continuing work
4. At session end: Update session file and `session_cache.md`
5. Create new session file if continuing multiple sessions

## Current Development Status

### Production Components (Ready to Use)
- **Integrated Rules v6.10**: Complete with Tiered Knowledge Structure
- **Memory Bank Viewer**: Phase 1 complete, Phase 2 in progress
- **CLI init command**: Fully operational, selective initialization working
- **Text-first workflow**: Operational, 8-step documented procedure
- **Task management**: 20+ tasks tracked, dependencies clear

### In Progress Components
- **T19 Viewer Phase 2**: File content enhancements (1373-line viewer)
- **T20 Parser Phase 3**: Format handling improvements
- **T17 Rules v6.10**: Maintenance ongoing, continuous improvements
- **T13 CLI Phase 2**: Task/session/template commands pending

### Experimental Components (NOT Production Ready)
- **T21 Database Workflow**: Phase A complete (schema, dual init scripts)
- **T20a Adaptive Parser**: Design phase complete, Phase 1 pending
- **T20 Database Tools**: Phase 3 in progress, exploratory implementation
- **Database-native paradigm**: Under development, significant changes pending

## System Statistics

| Metric | Status |
|--------|--------|
| Active Tasks | 11 (T1, T3, T4, T5, T8, T9, T11-T21, META-1) |
| Completed Tasks | 7 (T0, T2, T6, T7, T10, T15, T18) |
| Paused Tasks | 1 (T3 in database form, but 95% complete) |
| Task Files | 20+ individual files with detailed specifications |
| Session Files | 10+ tracked sessions with context preservation |
| Database Records | 364 migrated and verified (zero errors) |
| Rules Versions | 10 versions (v6.1 through v6.10) |
| Implementation Details | 50+ documentation files |

## Key Technologies

**Production**:
- Markdown for documentation
- File system for storage
- Git for version control
- HTML5/JavaScript for web viewer
- Node.js for CLI tools

**Experimental**:
- SQLite (better-sqlite3) for database
- LLM integration (planned for T20a)
- Transaction-based workflows (T21)

## Recent Accomplishments (November 2025)

- ✅ T21 Phase A: Database schema and dual init scripts
- ✅ T20a: Adaptive format parser design complete
- ✅ T20: Database parser Phase 3 (unified integration)
- ✅ T19: Memory Bank Viewer released (1373 lines)
- ✅ T17: Rules v6.10 with Tiered Knowledge Structure
- ✅ T3: Database migration verified (95%, 364 records)
- ✅ T13: CLI init command fully featured (85% complete)
- ✅ META-1: Memory Bank update and maintenance task created

## Next Steps

1. **Complete T19 Phase 2**: File content viewer enhancements
2. **Develop T21 Phase B**: Database insert functions
3. **Implement T20a Phase 1**: LLM prompt design
4. **Complete T13 Phase 2**: Task/session/template commands
5. **Validate database paradigm**: Complete testing before production migration

## Documentation

- **Integrated Rules**: Complete system documentation in `integrated-rules-v6.10.md`
- **Memory Bank**: Core documentation in `/memory-bank/` directory
- **Tasks**: Individual task specifications in `/memory-bank/tasks/`
- **Implementation**: Design documents in `/memory-bank/implementation-details/`
- **Viewer**: Usage guide in `viewer/README.md`
- **CLI**: Usage guide in `mb-cli/README.md`

## Support

For information about:
- **Task execution**: See individual task files
- **System architecture**: Review `systemPatterns.md` and `techContext.md`
- **Project status**: Check `progress.md` and `changelog.md`
- **Experimental work**: Review `/implementation-details/` directory
- **Web viewer**: See `viewer/README.md`
- **CLI tools**: See `mb-cli/README.md`

## License

This project uses the Memory Bank system methodology for documentation and context management.

---

**Project Status**: Stable and operational. Experimental database paradigm in active development. See `progress.md` for detailed task status.
