# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Memory Bank is a structured documentation and context management system designed to maintain perfect project knowledge across multiple AI assistant sessions. It combines:

- **Text-first architecture** with Markdown files as the authoritative source
- **Tiered knowledge structure** for optimized context loading (Bootstrap, Critical, Essential, Reference)
- **Task management system** with 20+ tracked tasks and dependencies
- **CLI tools** for Memory Bank initialization and management
- **Experimental database paradigm** (not production-ready) for future enhancements

## Essential Commands

### Memory Bank Operations

```bash
# CLI initialization (mb-cli directory)
cd mb-cli
node src/index.js init              # Initialize new Memory Bank
node src/index.js init --dry-run    # Preview changes without making them
node src/index.js init --interactive # Step-by-step setup
node src/index.js init --core       # Initialize only core files
node src/index.js init --database   # Initialize database files

# Linting and formatting
pnpm exec eslint src/               # Check code style
pnpm exec prettier --write src/     # Format code
```

### Database Tools (Experimental)

```bash
# In mb-cli/src/server-package/
node init-schema.js                 # Initialize SQLite schema
node parse-edits.js                 # Parse edit_history.md into database
node parse-tasks.js                 # Parse tasks.md into database
node query.js                        # Interactive query tool
```

## Architecture and Structure

### Core Concepts

**Tiered Knowledge Structure** (v6.10):
- **Bootstrap Tier**: tasks.md, activeContext.md (minimal startup)
- **Critical Tier**: session_cache.md, edit_history.md, sessions/ (task-focused)
- **Essential Tier**: projectbrief.md, .cursorrules (clarification)
- **Reference Tier**: productContext.md, systemPatterns.md, techContext.md (deep dives)

Load only what's needed for the current task to optimize token usage.

### Directory Organization

```
memory-bank/
├── Core Files (status, registry, context)
│   ├── tasks.md - Master task registry with active/completed tasks
│   ├── activeContext.md - Current session focus and state
│   ├── session_cache.md - Active session metadata and task status
│   ├── edit_history.md - Chronological file modifications (prepend-only)
│   ├── errorLog.md - Error tracking and resolutions
│   ├── progress.md - Project status and milestones
│   └── changelog.md - System changes (November 2025 entries)
│
├── Documentation (architectural and design info)
│   ├── projectbrief.md - Project overview and scope
│   ├── productContext.md - Why/how the system works
│   ├── systemPatterns.md - Architecture and design patterns
│   ├── techContext.md - Technical implementation details
│   ├── .cursorrules - Implementation guidelines (4.3KB)
│   └── format-specification-v1.0.md - Data format standards
│
├── Tasks and Sessions
│   ├── tasks/ - Individual task files (T0-T21, META-1)
│   │   ├── T21.md - Database-Native Workflow (Phase A complete)
│   │   ├── T20a.md - Adaptive Format Parser (design complete)
│   │   ├── T20.md - Database Parser (Phase 3 in progress)
│   │   ├── T19.md - Memory Bank Viewer (Phase 2 in progress)
│   │   ├── T17.md - Integrated Rules (maintenance ongoing)
│   │   ├── T13.md - CLI Tools (85% complete)
│   │   └── ... (T0-T18 additional tasks)
│   └── sessions/ - Timestamped session files (YYYY-MM-DD-PERIOD.md)
│
├── Implementation (design and planning)
│   └── implementation-details/
│       ├── database-update-workflow-plan.md
│       ├── adaptive-parser-plan.md
│       ├── database-parser-plan.md
│       ├── memory-bank-viewer.md
│       └── database-planning/ (migration docs)
│
├── Database (experimental, not production-ready)
│   └── database/
│       ├── memory_bank.db (SQLite database)
│       ├── parse-edits.js - Parser for edit_history.md
│       ├── parse-tasks.js - Parser for tasks.md
│       └── query.js - Query interface
│
└── Archive (completed tasks from April 2025)
```

### Key Files to Know

**Critical for any session**:
- `/memory-bank/tasks.md` - Always load this first to understand current task status
- `/memory-bank/activeContext.md` - Current focus and state
- `/memory-bank/.cursorrules` - Implementation patterns and guidelines
- `/integrated-rules-v6.11.md` - Comprehensive system documentation (canonical version)

**Core Workflows** (immediate reference for common tasks):
- `/memory-bank/protocols/memory-bank-update-workflow.md` - How to update Memory Bank files after work session
- `/memory-bank/protocols/task-implementation-workflow.md` - How to implement tasks
- `/memory-bank/protocols/session-management-workflow.md` - How to create and manage sessions
- `/memory-bank/protocols/error-handling-workflow.md` - How to handle and document errors
- `/memory-bank/protocols/file-update-workflow.md` - How to safely update files

**For specific tasks**:
- `/memory-bank/tasks/T[ID].md` - Individual task details and requirements
- `/memory-bank/sessions/` - Load current session file for work continuity
- `/memory-bank/session_cache.md` - Current session metadata

**For architectural questions**:
- `/memory-bank/systemPatterns.md` - System design and patterns
- `/memory-bank/techContext.md` - Technical implementation details
- `/memory-bank/productContext.md` - Why the system exists

### Important Patterns to Follow

**Memory Bank Update Workflow** (see `/memory-bank/protocols/memory-bank-update-workflow.md` for complete protocol):

Follow this 9-step workflow after completing work:
0. **Identify Relevant Files First** - Check tasks/ and implementation-details/ directories to determine which files need updating. If no relevant files exist, request user approval before creating new ones.
1. Determine system time and timezone (IST standard: `YYYY-MM-DD HH:MM:SS IST`)
2. Update individual task file (with progress, timestamp)
3. Update tasks.md master registry (use strict emoji status format)
4. Update implementation-details files (identified in Step 0)
5. Handle session file (create if new, update if existing, always preserve context)
6. Update session_cache.md (metadata, task status, session history)
7. Update other files (activeContext.md, errorLog.md, progress.md, changelog.md as needed)
8. Update edit_history.md (PREPEND entries with timestamp and task ID, use strict format)
9. Generate conventional commit message

**See `/memory-bank/protocols/memory-bank-update-workflow.md` for detailed requirements, format specifications, and examples.**

**KIRSS Principle** (Keep It Really Simple, Stupid):
- Choose simplest possible solutions
- Avoid overengineering
- Question complex coordination
- When you think something is simple enough, make it even simpler

**Critical Rules** (from integrated-rules-v6.11.md):
- Never update Memory Bank files without explicit user approval
- Never add new features without approval
- Never generate code without approval
- Use absolute paths (no relative paths or tildes)
- Include timestamps in IST format (YYYY-MM-DD HH:MM:SS IST)

**Note**: Version 6.12 with chunked edit features is planned as the future canonical version. Currently using v6.11.

## Current Project Status

### Production-Ready Components
- Text-first Memory Bank workflow (authoritative source)
- Tiered Knowledge Structure (v6.10)
- Memory Bank Viewer Phase 1 (web-based file navigation)
- CLI init command (selective initialization with multiple flags)
- Integrated Rules v6.12 (comprehensive documentation)
- Database migration verified (95% complete, 364 records)

### Experimental Components (NOT Production-Ready)
- Database-native paradigm (T21 Phase A: schema + init scripts only)
- Adaptive LLM-based format parser (T20a: design phase complete)
- Database parsers and query tools (T20: Phase 3 in progress)
- CLI task/session commands (T13 Phase 2: not yet implemented)

## Key Technologies

**Production Stack**:
- Markdown for all documentation
- File system for storage (text-first)
- Git for version control
- HTML5/JavaScript for web viewer
- Node.js (no specific version pinned, typically v20+)
- Commander.js for CLI (v14.0.0)

**Dependencies**:
- commander: 14.0.0 (CLI framework)
- eslint: 9.27.0 (linting)
- prettier: 3.5.3 (code formatting)

**Experimental**:
- SQLite (better-sqlite3) for database experiments
- sql.js for browser-based database work

## Development Notes

### Code Organization

**mb-cli/src/** directory structure:
- `index.js` - CLI entry point and command registration
- `commands/init.js` - Memory Bank initialization command
- `lib/validators.js` - Input validation helpers
- `lib/prompts.js` - Interactive prompt utilities
- `lib/writers.js` - File writing utilities
- `server-package/` - Database tools and web server (experimental)

### Important Implementation Details

**Session File Format** (YYYY-MM-DD-PERIOD.md):
- Current section at top
- Focus Task: [Task ID]
- Active Tasks: [List with status]
- Progress Made: [Accomplishments]
- Files Modified: [Change list]
- Key Decisions: [Important choices]
- Context for Next Session: [Continuity notes]

**Task Status Indicators**:
- ✅ Complete/Working
- 🔄 In Progress
- ⏸️ Paused
- ⬜ Not Started
- ❌ Blocked/Issue

**Timestamp Format** (required in all files):
- Format: `YYYY-MM-DD HH:MM:SS IST`
- Example: `2025-07-15 13:23:37 IST`
- Always include IST timezone

### Experimental Database Work

If working on database-related features (T20, T20a, T21):
- Isolated in `/t21-workflow-testing/` and `mb-cli/src/server-package/`
- NOT ready for production use
- Test thoroughly before considering production migration
- Keep clear separation from text-first workflow

### Code Quality Standards

From .cursorrules:
- Use ESLint for code style (eslint.json configured)
- Format with Prettier (prettier.rc configured)
- Maintain consistent JavaScript/Node.js patterns
- Follow Memory Bank naming conventions (camelCase for files)

## Common Workflows

### Starting a Session

1. Load `/memory-bank/tasks.md` to understand current tasks
2. Load `/memory-bank/activeContext.md` for immediate state
3. Check `/memory-bank/session_cache.md` for continuation context
4. Load relevant task file if continuing work on specific task
5. Refer to `/memory-bank/systemPatterns.md` if architecture unclear

### Implementing a Feature

1. Review relevant task file in `/memory-bank/tasks/T[ID].md`
2. Check `.cursorrules` for implementation patterns
3. Implement in mb-cli or relevant source directory
4. Update corresponding Memory Bank files (task file, session, edit_history)
5. Follow Memory Bank Update Workflow for all documentation changes

### Debugging Issues

1. Check `/memory-bank/errorLog.md` for similar issues
2. Review relevant session file in `/memory-bank/sessions/`
3. Check `/memory-bank/systemPatterns.md` for architectural context
4. Review `/memory-bank/edit_history.md` for recent changes
5. Document investigation and findings in session file

### Working with Database Features

Only if working on T20, T20a, T21:
1. Use isolated directory: `mb-cli/src/server-package/` or `/t21-workflow-testing/`
2. Reference design docs: `memory-bank/implementation-details/`
3. Test extensively before proposing production integration
4. Keep clear separation from text-first workflow
5. Document experimental status clearly

## References

**Essential Documentation**:
- `/integrated-rules-v6.12.md` - Master rules document (updated Nov 22, 2025)
- `/memory-bank/.cursorrules` - Implementation guidelines
- `/memory-bank/systemPatterns.md` - Architecture patterns
- `/memory-bank/README.md` - Project overview

**Task-Specific Documentation**:
- `/memory-bank/tasks.md` - Master task registry
- `/memory-bank/tasks/T[ID].md` - Individual task files
- `/memory-bank/implementation-details/` - Design documentation

**Configuration Files**:
- `mb-cli/.eslintrc.json` - ESLint configuration
- `mb-cli/.prettierrc` - Prettier configuration
- `.cursorrules` - Repository-level guidelines

---

*Last Generated: 2026-01-04*
*Guidance for Claude Code instances working on Memory Bank system*
