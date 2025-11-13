# Technical Context: Memory Bank Implementation

## Production Technology Stack (Text-First)

### Primary Technologies
- **Markdown**: All documentation files use Markdown format for human readability
- **File System**: Directory-based organization in `/Users/deepak/code/memory-bank/`
- **Text Editor/CLI**: Shell commands and file operations for document management
- **Git**: Version control with conventional commits format

### File Format Standards
All Memory Bank files follow:
1. Consistent Markdown formatting
2. Hierarchical section headers (# title, ## section, ### subsection)
3. ISO 8601 timestamps with IST timezone (YYYY-MM-DD HH:MM:SS IST)
4. Relative links for cross-references
5. Task ID references (T0-T21, META-1, etc.)

### Web Viewer Technology Stack
- **HTML5**: Single-file HTML viewer (viewer.html, 1373 lines)
- **JavaScript**: File discovery, manifest generation, navigation
- **CSS3**: Styling and responsive layout
- **File API**: Local file system access

**Components**:
- viewer.html: Main viewer interface with file browsing
- generate-manifest.js: Recursive directory scanning and metadata generation
- manifest.json: Generated file catalog and hierarchy
- server.js: Optional HTTP server for testing

**Features**:
- Dual file discovery approaches (direct scan + manifest-based)
- Task registry visualization
- Session history display
- Real-time file content viewing
- Search and navigation capabilities

## Session Continuity Implementation

### Production Approach (Text-Based)
1. **Session File Creation**: Individual session file (YYYY-MM-DD-PERIOD.md) created for work periods
2. **Cache Updates**: session_cache.md maintains current session metadata and task status
3. **Incremental Updates**: Edit history appended prepend-only to preserve immutability
4. **Context Restoration**: Load session_cache.md and related session file at next session start

### Session File Structure
```
Session [DATE] - [PERIOD]
├── Focus Task: [Task ID]
├── Active Tasks: [List with status]
├── Progress Made: [Completed this session]
├── Files Modified: [List of changes]
├── Key Decisions: [Important choices]
└── Context for Next Session: [Continuity notes]
```

## CLI Implementation (mb-cli)

### Init Command Status
- **Implementation**: Complete and operational (T13, 85% overall)
- **Technology**: Node.js with commander.js framework
- **Location**: `mb-cli/src/commands/init.js`

**Features**:
- Selective initialization with flags: --core, --templates, --database, --full, --skip-existing
- Automatic timezone detection (system locale)
- Non-destructive by default (skips existing files)
- Interactive prompts for partial memory bank detection
- Database template inclusion with SQL migration scripts

**Planned Extensions** (Not yet implemented):
- mb task command: create, list, show, update
- mb session command: start, complete, cache
- mb template command: list, use

## Database Implementation (Experimental - Not Production Ready)

### Experimental Database Technologies
- **SQLite**: better-sqlite3 for Node.js (production-capable but experimental use)
- **Schema**: 8-table design with foreign keys and 21 indexes
- **Location**: `memory-bank/database/memory_bank.db`

### Database Components (T20, T20a, T21)
All experimental and not ready for production deployment.

**T20: Memory Bank Database Parser**
- parse-edits.js: Parses edit_history.md into database
- parse-tasks.js: Parses tasks.md into database
- query.js: Interactive query tool for database analysis
- **Status**: Phase 3 in progress (format handling improvements)

**Schema Tables**:
- edit_entries: Timestamp, task ID, description
- file_modifications: File path, action, description
- task_items: Task ID, status, priority, dependencies
- task_dependencies: Task relationship tracking
- sessions: Session metadata and timing
- session_cache: Current session state snapshot
- error_logs: Error tracking and resolution
- transaction_log: Transaction history

**Query Capabilities**:
- stats: Database statistics
- all [limit]: Show all entries
- task <id>: Entries by task
- files [search]: File modifications
- date <YYYY-MM-DD>: Entries by date

**T20a: Adaptive LLM-Based Format Parser** (Design Phase Complete)
- LLM format analysis system for multi-project support
- Format detection and parser selection
- Normalization to universal schema
- **Status**: Design complete, Phase 1 implementation pending

**T21: Database-Native Memory Bank Update Workflow** (Phase A Complete)
- Isolated workspace: `t21-workflow-testing/`
- Phase A: Schema design, dual init scripts
- Planned phases: B (insert functions), C (regeneration), D (CLI), E (testing)
- **Status**: Not ready for production

### Technical Constraints (Experimental Database)
- SQLite schema locked to development patterns
- Text regeneration formats not finalized
- LLM integration patterns still being explored
- No transaction log analysis tools yet
- Performance testing incomplete

### Migration Path (Future)
When database paradigm production-ready:
1. Gradual migration from text-first to database-first
2. Coexistence period with both workflows
3. Text files as generated output from database
4. Database as authoritative source

## Integration with Integrated Rules v6.10

### Memory Bank Update Workflow (Section 6.5)
Current 8-step text-first procedure:
1. Determine system time and timezone
2. Update task files
3. Update implementation documentation
4. Handle session file
5. Update session cache
6. Update other files
7. Update edit history (prepend)
8. Generate commit message

### Tiered Knowledge Structure (Section 2.2)
Loading guidance for progressive context loading:
- Bootstrap: Minimal startup context
- Critical: Task-focused information
- Essential: Scope and requirements
- Reference: Technical details

### Commit Message Format
Conventional commits with task tracking:
```
(type)TID: Headline - Details (% complete)
Example: (feat)T21: Database Phase A Complete - Schema & init scripts (75% complete)
```

## Technical Dependencies

### Required Technologies
- Node.js v20+ (specified in .nvmrc files)
- pnpm package manager
- SQLite (bundled with better-sqlite3)
- Markdown support (built-in to system)

### Development Tools
- git for version control
- Shell/bash for automation
- Text editor for markdown editing

### Optional Tools
- SQLite browser for direct database inspection
- VS Code extensions for markdown/SQL
- File system tools for backup/restoration

*Last Updated: 2025-11-13 18:46:25 IST*