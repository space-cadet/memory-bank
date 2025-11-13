# System Patterns
*Last Updated: 2025-11-13 18:46:25 IST*

## Core Principles

### 1. Keep It Really Simple, Stupid (KIRS)
- Choose simplest possible solutions
- Avoid overengineering
- Question complex coordination
- Simplify further when possible

### 2. Hierarchical Organization
- Master registry files (.md) provide overview and links
- Individual task files contain full task details
- Session files track work periods
- Clear separation of concerns between file types
- Web viewer provides navigation across hierarchy

### 3. Tiered Knowledge Structure (v6.10)
- **Bootstrap Tier**: Minimal startup (tasks.md, activeContext.md)
- **Critical Tier**: Task-focused information (session_cache.md, edit_history.md, errorLog.md)
- **Essential Tier**: Context clarification (projectbrief.md, .cursorrules)
- **Reference Tier**: Deep dives (productContext.md, systemPatterns.md, techContext.md)

### 4. Task-First Implementation
- Focus on immediate task requirements
- Load minimal necessary context using tiered structure
- Verify and document changes systematically
- Maintain clear task boundaries with dependencies
- Track progress through session files and edit history

### 5. Documentation Standards
- Clear headers with IST timestamps
- Consistent section formatting across all files
- Status indicators (✅, 🔄, ⏸️, ⬜)
- Task ID references for traceability
- Progress tracking with dates and times

### 6. Text-First Workflow (Production)
- Text files are authoritative source
- Markdown format for consistency
- Update workflow documented in Memory Bank Update Workflow v6.10
- 8-step procedure with approval checkpoints
- Prepend-only edit history for immutability

## File Organization

### Task Files
- Main registry in tasks.md with active/completed sections
- Individual files in tasks/ directory with detailed information
- Status tracking with emoji indicators (🔄, ✅, ⏸️, ⬜)
- Dependencies and file references
- Progress tracking with timestamps

### Session Files
- Current session state in session_cache.md
- Individual session files in sessions/ directory (YYYY-MM-DD-PERIOD.md)
- Task focus and progress during session
- Working context and decisions made
- Critical files referenced and modified

### Documentation Files
- changelog.md for system changes and milestones
- edit_history.md for file modifications (prepend-only)
- errorLog.md for issue tracking and resolutions
- implementation-details/ for design documentation
- database/ for experimental database tools

## Implementation Guidelines

### Task Management (Production)
- Create individual task file when starting new task
- Update tasks.md master registry with current status
- Track dependencies between tasks
- Maintain progress status with timestamps
- Use session files to record work periods

### Session Tracking (Production)
- Create session file at session start (if new session)
- Record focus task and active tasks
- Document work completed and decisions
- Track files consulted and modified
- Update session_cache.md with metadata at session end

### Documentation Updates (Production)
- Update relevant files only (differential updates)
- Maintain consistent timestamp format (IST)
- Include task ID references for traceability
- Track all changes in edit_history.md
- Verify cross-references after major updates

## Experimental Patterns (Not Production)

### Database-Native Architecture (T21, T20, T20a)
**Status**: Under development, not ready for deployment

Planned future paradigm where database becomes authoritative source:

**Database Patterns** (Experimental):
- Atomic transactions for multi-step updates
- Foreign key constraints for data integrity
- Single authoritative database (memory_bank.db)
- Text regeneration from database state
- Transaction log for audit trail

**Implementation Note**: See `implementation-details/database-update-workflow-plan.md` for complete database workflow design. This is exploratory work and should not replace text-first production workflow.

## Best Practices

### Simplicity (Production)
- Follow KIRS principle for all implementations
- Minimize complexity in workflows
- Keep clear organization and focused implementation
- Prefer text-first approaches until database paradigm production-ready

### Documentation (Production)
- Keep formats consistent across all files
- Include timestamps with IST timezone
- Reference related items with relative links
- Track changes clearly in edit_history.md
- Cross-reference task IDs for traceability

### Task Focus (Production)
- Load minimal context using tiered structure
- Keep clear task boundaries with dependency tracking
- Track progress with timestamps and status
- Document decisions in session files
- Use web viewer for navigation

### Experimental Work
- Isolate experimental code in dedicated directories (t21-workflow-testing/)
- Maintain clear separation from production systems
- Document design assumptions and limitations
- Plan migration path to production when ready