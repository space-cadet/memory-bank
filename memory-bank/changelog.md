# Changelog

## November 2025

### [2025-11-13] T21 Database-Native Memory Bank Update Workflow - Phase A Complete
- Analyzed text-based Section 6.5 workflow for database paradigm conversion
- Designed database-first alternative with 4-phase approach (DB Ops → Text Regeneration → Validation → Logging)
- Created expanded 8-table schema with 21 indexes in isolated workspace (t21-workflow-testing/)
- Implemented Phase A: schema.sql with foreign key constraints and indexes
- Implemented dual initialization scripts: init-schema.js (better-sqlite3) and init-schema-sqljs.js (sql.js)
- Created comprehensive documentation: database-update-workflow-plan.md (486 lines)
- Designed Phases B-E implementation roadmap across T20, T13, testing
- **Status**: Experimental/exploratory phase. Database paradigm not ready for deployment.

### [2025-11-13] T17 Integrated Rules v6.10 - Major Enhancement
- Created new v6.10 with Tiered Knowledge Structure (Bootstrap, Critical, Essential, Reference)
- Added File Loading Priority Matrix with practical scenarios
- Expanded Section 6.5 with detailed 8-step Memory Bank Update Workflow
- Added commit message format: `(type)TID: Headline - Details (% complete)`
- Documented approval checkpoints and validation requirements
- Implemented progressive loading examples for practical guidance

### [2025-11-12] T20a Adaptive LLM-Based Format Parser - Design Phase Complete
- Conducted format variation analysis across 4 projects (8 variations documented)
- Designed LLM-driven format detection system vs universal regex comparison
- Implemented three-phase architecture: Analysis → Parser Selection → Normalization
- Created universal schema design supporting multi-project compatibility
- Documented comprehensive system architecture (adaptive-parser-plan.md)
- **Status**: Experimental/exploratory phase. Part of broader database system under development.

### [2025-11-12] T20 Memory Bank Database Parser - Phase 3 Continued
- Integrated unified memory_bank.db with table prefixing (edit_*, task_*)
- Implemented improved format handling (timezone optionality, flexible column parsing)
- Enhanced parser logic for better error recovery and status handling
- Completed tasks parser with dependency processing
- **Status**: Experimental/exploratory phase. Phase 3 format handling improvements ongoing.

### [2025-11-10] T19 Memory Bank Viewer Web Interface - Phase 1 Complete
- Completed single-file HTML viewer (1373 lines) with dual file discovery approaches
- Implemented Phase 1: Core infrastructure and file navigation
- Created manifest generation system with recursive directory scanning
- Deployed production-ready viewer for memory bank visualization
- **Status**: Production release. Phase 2 enhancements in progress.

### [2025-11-11] T3 Database Migration & T13 CLI - Integration and Verification
- Verified database migration: 364 records successfully migrated, zero data integrity issues
- Enhanced mb init command with selective initialization (--core, --templates, --database, --full, --skip-existing)
- Implemented timezone-agnostic initialization with automatic user timezone detection
- Added database templates and migration scripts to initialization
- Created non-destructive init system with existing content detection
- **Status**: T3 at 95% (MCP server postponed), T13 at 85% (task/session commands remain).

## April 30, 2025
### [v6.2] - Documentation Framework and File Operations
#### Added
- New Section 8.2.1: File Operation Prerequisites
  - Explicit requirements for checking file existence
  - Clear approval requirements for file operations

#### Changed
- Restructured Section 5: Documentation Decision Framework
  - Clearer update sequences for different file categories
  - More explicit change requirements table
  - Streamlined maintenance rules

#### Fixed
- Ambiguity in when to update which memory bank files
- Lack of clear guidance on file existence checks

## April 25, 2025
- Added KIRS (Keep It Really Simple, Stupid) principle to Memory Bank System
- Added Core Implementation Philosophy section emphasizing simplicity
- Updated initial warnings with KIRS principle

## April 17, 2025
- Added integrated-rules-v5.md with modular task context system
- Implemented hierarchical task structure with dedicated context files
- Transformed session_cache.md into a lightweight index
- Added templates for task and subtask context files: Memory Bank System

## [0.3.0] - April 15, 2025
### Added
- Database migration framework with Prisma ORM
- Multi-project support in database schema design
- SQLite configuration for initial database implementation
- Comprehensive schema for all memory bank data models
- Enhanced error logging with full-text support in database

### Changed
- Eliminated need for file rotation through database approach
- Improved task relationship modeling with enhanced dependency types
- Better structured Task model with pause/resume capability

### Planned
- MCP server implementation for database interactions
- Conversion scripts for markdown to database migration
- Integration with LLM workflows

## [0.2.0] - April 14, 2025
### Added
- Multi-task support with dedicated task registry
- Task ID referencing across all Memory Bank files
- Templates for all memory bank file types
- Task relationship visualization with mermaid diagrams
- Enhanced session cache with multi-task tracking

### Changed
- Moved templates directory to project root
- Updated integrated rules (v4) with multi-task support
- Enhanced edit history with task references
- Improved session continuity when switching between tasks

## [0.1.1] - April 10, 2025
### Added
- Error logging capability with errorLog.md
- File modification tracking with edit_history.md
- Task and milestone tracking in progress.md
- Enhanced session cache structure
- File size management protocol

### Changed
- Improved Documentation Decision Framework
- Enhanced XML tag formatting for tool usage
- More detailed file operation specifications
- Better structured session cache template

## [0.1.0] - April 8, 2025
### Added
- Integration with Code Rules into unified system
- Comprehensive XML tag format for tool usage
- Expanded command system for task execution and code implementation
- Workflow diagrams for task-first implementation and session management
- MCP server integration specifications
- Documentation standards for consistent project knowledge

### Changed
- Combined Code Rules and Memory Bank into single integrated system
- Prioritized task-first approach with minimal context loading
- Expanded tool usage with detailed XML tag formatting
- Added detailed file operation specifications

## [0.0.1] - April 8, 2025
### Added
- Initial Memory Bank structure
- Dedicated memory-bank subfolder within the project
- Tiered documentation approach
- Progressive loading framework
- Session continuity mechanism
- System architecture and patterns documentation

### Design Choices
- Selected Markdown as primary documentation format
- Organized files in hierarchical structure
- Implemented explicit commands for user control
- Used directory-based approach for documentation organization

Last Updated: April 15, 2025