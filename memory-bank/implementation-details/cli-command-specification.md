# Memory Bank CLI Command Specifications
*Created: May 18, 2025*

## Core Command Structure
All commands follow the pattern: `mb <command> [subcommand] [options] [arguments]`

## Global Options
- `--help, -h`: Show help for command
- `--version, -v`: Show CLI version
- `--debug`: Enable debug output
- `--quiet, -q`: Suppress non-essential output

## Commands

### Project Management
```bash
# Initialize Memory Bank in existing project
mb init
# Expected output: Memory Bank initialized in current directory

# Create new project with Memory Bank
mb init <project-name>
# Expected output: New project created and Memory Bank initialized

# Common options
# --template <template-name>: Use specific template
# --force: Override existing memory-bank directory

# Show project status
mb status
# Expected output: Project status overview (tasks, sessions, etc.)
# Error scenarios: Not in project directory
```

**Options**:
- `[project-name]`: Optional. Create new project with this name
- `--template <n>`: Use specific project template
- `--force`: Override existing memory-bank directory (careful!)

**Behavior for Existing Project**:
- Validates current directory is suitable project root
- Creates memory-bank/ directory structure:
  - implementation-details/
  - templates/
  - tasks/
  - sessions/
  - database/
  - Other required directories and files
- Initializes configuration files
- Sets up default templates
- Creates initial session

**Behavior for New Project**:
- Checks if project-name directory exists
  - Errors if exists (unless --force)
- Creates new project directory
- Creates memory-bank/ directory and structure within it
- Initializes all required files and templates
- Creates initial session

**Error Scenarios**:
- For existing project:
  - Not a valid project root
  - memory-bank/ already exists
  - Insufficient permissions
- For new project:
  - Project directory already exists
  - Invalid project name
  - Parent directory not writable

### Task Management
```bash
# Create new task
mb task create <title> [--priority <p>] [--deps <task-ids>]
# Expected output: New task created with ID
# Error scenarios: Invalid priority, Invalid dependency IDs

# List tasks
mb task list [--status <status>] [--priority <p>]
# Expected output: Table of tasks matching criteria
# Error scenarios: Invalid status/priority filters

# Show task details
mb task show <task-id>
# Expected output: Detailed task information
# Error scenarios: Task not found
```

### Session Management
```bash
# Start new session
mb session start [--task <task-id>]
# Expected output: New session created
# Error scenarios: Active session exists

# Complete session
mb session complete [--notes <text>]
# Expected output: Session completed, summary shown
# Error scenarios: No active session
```

### Template Management
```bash
# List available templates
mb template list
# Expected output: List of available templates
# Error scenarios: Template directory not found

# Create from template
mb template use <template-name> <target>
# Expected output: New file/directory created from template
# Error scenarios: Template not found, Target exists
```

## Command Details

### Project Commands

#### `mb init`
**Purpose**: Initialize a new Memory Bank project
**Options**:
- `[directory]`: Target directory (default: current directory)
- `--template <name>`: Use specific project template
**Behavior**:
- Creates project directory structure:
```bash
memory-bank/
├── activeContext.md        # From template
├── changelog.md           # From template
├── edit_history.md       # From template
├── errorLog.md          # From template
├── progress.md         # From template
├── projectbrief.md    # From template
├── session_cache.md  # From template
├── systemPatterns.md
├── tasks.md         # From template
├── techContext.md  # From template
├── .cursorrules
├── tasks/          # Individual task files
├── sessions/       # Session files
├── templates/      # Core file templates
│   ├── activeContext.md
│   ├── changelog.md
│   ├── component_index.md
│   ├── edit_history.md
│   ├── errorLog.md
│   ├── progress.md
│   ├── projectbrief.md
│   ├── session_cache.md
│   ├── tasks.md
│   └── task-template.md
├── database/       # Database configuration
│   ├── admin/
│   ├── migration-scripts/
│   ├── migrations/
│   ├── schema.prisma
│   ├── .env
│   ├── package.json
│   └── pnpm-lock.yaml
├── implementation-details/  # Project-specific implementation docs
└── archive/               # Archived files
```
- Initializes configuration files
- Sets up default templates using template directory
- Creates initial session

#### `mb status`
**Purpose**: Show project status overview
**Options**: None
**Behavior**:
- Shows active tasks
- Shows current session
- Shows recent changes
- Displays warnings/alerts

### Task Commands

#### `mb task create`
**Purpose**: Create new task
**Options**:
- `<title>`: Task title (required)
- `--priority <p>`: Set priority (high|medium|low)
- `--deps <task-ids>`: Comma-separated dependent task IDs
**Behavior**:
- Generates unique task ID
- Creates task file from template
- Updates task registry
- Links dependencies

#### `mb task list`
**Purpose**: List tasks matching criteria
**Options**:
- `--status <status>`: Filter by status
- `--priority <p>`: Filter by priority
**Behavior**:
- Shows task summary table
- Applies filters if specified
- Sorts by priority/status
- Shows dependency status

#### `mb task show`
**Purpose**: Show detailed task information
**Options**:
- `<task-id>`: Task ID to show (required)
**Behavior**:
- Shows full task details
- Shows related files
- Shows dependency tree
- Shows progress status

### Session Commands

#### `mb session start`
**Purpose**: Start new work session
**Options**:
- `--task <task-id>`: Associate with task
**Behavior**:
- Creates session file
- Updates session cache
- Records start time
- Links to task if specified

#### `mb session complete`
**Purpose**: Complete current session
**Options**:
- `--notes <text>`: Add session notes
**Behavior**:
- Updates session status
- Records completion time
- Updates task progress
- Archives session data

### Template Commands

#### `mb template list`
**Purpose**: List available templates
**Options**: None
**Behavior**:
- Shows all templates
- Groups by type
- Shows template details
- Indicates custom templates

#### `mb template use`
**Purpose**: Create file from template
**Options**:
- `<template-name>`: Template to use
- `<target>`: Target path
**Behavior**:
- Validates template
- Processes variables
- Creates target file
- Updates references

## Error Handling
Each command follows these error handling principles:
1. Validate inputs before execution
2. Provide clear error messages
3. Suggest corrections when possible
4. Maintain system consistency on failure
5. Log errors for debugging

## Output Formatting
All commands follow these output guidelines:
1. Use consistent color coding
2. Show progress for long operations
3. Support quiet mode
4. Enable JSON output format
5. Include debug information when requested