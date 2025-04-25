# System Patterns
*Last Updated: April 25, 2025*

## Core Patterns

### 1. Keep It Really Simple (KIRS)
- Choose simplest possible solutions
- Avoid overengineering
- Question complex coordination
- Simplify further when possible

### 2. Hierarchical Organization
- Master registry files (.md) provide overview and links
- Individual task files contain full task details
- Session files track work periods
- Clear separation of concerns between file types

### 3. Progressive Loading
- Bootstrap: Core system structure
- Critical: Task-relevant information
- Essential: Scope and requirements
- Reference: Architecture and technical details

### 4. Task-First Implementation
- Focus on immediate requirements
- Load minimal context
- Verify and document changes
- Maintain task boundaries

### 5. Documentation Standards
- Clear headers with timestamps
- Consistent section formatting
- Status indicators
- Task ID references
- Progress tracking

## File Organization

### Task Files
- Main registry in tasks.md
- Individual files in tasks/ directory
- Clear status and progress tracking
- Related file references
- Implementation context

### Session Files
- Current state in session_cache.md
- Individual files in sessions/ directory
- Task focus and progress
- Working context
- Critical file references

### Documentation Files
- Changelog for system changes
- Edit history for file modifications
- Error log for issue tracking
- Technical documentation separated

## Implementation Guidelines

### Task Management
- Create individual task files
- Update master registry
- Track dependencies
- Maintain progress status

### Session Tracking
- Create session files for work periods
- Record focus and progress
- Document decisions
- Track file modifications

### Documentation Updates
- Update relevant files only
- Maintain consistent formats
- Include task references
- Track changes in edit history

## Best Practices

### Simplicity
- Follow KIRS principle
- Minimize complexity
- Clear organization
- Focused implementation

### Documentation
- Keep formats consistent
- Include timestamps
- Reference related items
- Track changes clearly

### Task Focus
- Load minimal context
- Clear boundaries
- Track progress
- Document decisions