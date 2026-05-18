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
- `--database`: Initialize database files and workflow library
- `--setup-viewer`: Initialize viewer files (server + UI)
- `--core`: Initialize only core files
- `--templates`: Initialize only template files
- `--interactive`: Interactive setup menu
- `--dry-run`: Preview changes without making them

**Behavior for Existing Project**:
- Validates current directory is suitable project root
- Creates memory-bank/ directory structure:
  - implementation-details/
  - templates/
  - tasks/
  - sessions/
  - database/ (with --database)
    - lib/ (workflow library files)
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

### Task Management (Implemented 2026-05-12)

All task commands require `--db <path>` or expect `memory_bank.db` in standard locations.

```bash
# Create new task
mb task create "Build quantum simulator" \
  --priority high --status pending \
  --description "Implement fermionic operators" \
  --subtasks "Design schema,Implement API,Write tests" \
  --depends T1,T2

# List tasks
mb task list [--status in_progress] [--json]

# Show task details
mb task show T25 [--json]

# Update task status
mb task update T25 --status completed --note "Finished Phase 1"

# Update priority/title/description
mb task update T25 --priority high --title "New title"

# Delete task (archives file to memory-bank/archive/)
mb task delete T25 --yes
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

#### `mb task create <title>`
**Purpose**: Create a new task in DB, generate task file, regenerate tasks.md
**Options**:
- `--db <path>`: SQLite database path
- `--id <id>`: Explicit task ID (auto-generated if omitted: T{N+1} via numeric sort)
- `--priority <p>`: low | medium | high (default: medium)
- `--status <s>`: pending | in_progress | paused | completed (default: pending)
- `--description <text>`: Detailed description
- `--subtasks <list>`: Comma-separated checklist items
- `--depends <ids>`: Comma-separated dependency task IDs
**Behavior**:
- Inserts into `task_items` table via `inserts.upsertTask()`
- Inserts subtasks into `task_subtasks` table
- Inserts dependencies into `task_dependencies` table
- Generates `memory-bank/tasks/{id}.md` from template
- Regenerates `memory-bank/tasks.md` from DB state
**Error Scenarios**:
- No DB found → "Run `mb db init` first"
- Invalid priority/status → validation fails before DB write

#### `mb task list`
**Purpose**: List all tasks in a formatted table
**Options**:
- `--db <path>`: SQLite database path
- `--status <status>`: Filter by status
- `--json`: Output JSON instead of table
**Output**: Table with ID, Title, Status (emoji), Priority, Started
**Summary line**: `🔄 N  ✅ N  ⏸️ N  ⬜ N`

#### `mb task show <id>`
**Purpose**: Show detailed task information
**Options**:
- `--db <path>`: SQLite database path
- `--json`: Output JSON instead of formatted text
**Output**: Title, status (emoji), priority, dates, details, dependencies, subtasks with check count, file existence

#### `mb task update <id>`
**Purpose**: Update task properties
**Options**:
- `--db <path>`: SQLite database path
- `--status <s>`: Change status (appends `--note` to details)
- `--priority <p>`: Change priority
- `--title <text>`: Change title
- `--description <text>`: Replace details
- `--note <text>`: Append note when updating status
**Behavior**: Updates DB, regenerates task file and tasks.md

#### `mb task delete <id>`
**Purpose**: Delete a task
**Options**:
- `--db <path>`: SQLite database path
- `--yes`: Confirm without prompt
**Behavior**:
- Deletes from `task_items` (cascades subtasks/deps via FK)
- Archives task file to `memory-bank/archive/{id}.md` via `renameSync`
- Regenerates `tasks.md`
**Safety**: Requires `--yes` flag; without it shows preview and exits

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

### Database Commands

#### `mb db query <sql>`
**Purpose**: Execute SQL query against memory_bank.db
**Options**:
- `--json, -j`: Output as JSON instead of table
- `--db <path>`: Path to SQLite database
**Behavior**:
- Validates SQL syntax
- Executes query against database
- Formats output as table or JSON
- Handles errors gracefully

#### `mb db test`
**Purpose**: Run integration test suite
**Options**:
- `--db <path>`: Path to SQLite database
**Behavior**:
- Discovers test-workflow.js in database directory
- Runs integration tests
- Reports pass/fail status
- Validates DB schema and workflow functions

#### `mb db init`
**Purpose**: Initialize database schema
**Options**:
- `--db <path>`: Path to SQLite database (default: memory_bank.db)
**Behavior**:
- Creates database file if missing
- Loads and executes schema.sql
- Reports success or errors

#### `mb db workflow`
**Purpose**: Record session work and regenerate markdown files (DB-native)
**Options**:
- `--task <id>`: Task being worked on (e.g., T25)
- `--description <text>`: Brief description of work done
- `--files <list>`: Comma-separated file changes (action:path,action:path)
- `--status <status>`: New task status (in_progress, completed, paused)
- `--period <period>`: Session period (morning, afternoon, evening, night)
- `--output <dir>`: Directory to write markdown files
- `--db <path>`: Path to memory_bank.db
**Behavior**:
- Inserts edit entry + file modifications into SQLite
- Updates task status if changed
- Creates/updates session record
- Regenerates edit_history.md, tasks.md, session_cache.md
- Logs transaction for audit

### Workflow Command (Top-Level)

#### `mb workflow`
**Purpose**: Alias for `mb db workflow` — record session work and regenerate files
**Options**: Same as `mb db workflow`
**Behavior**:
- Same as `mb db workflow`
- More discoverable top-level command
- Full help text with examples

**Example**:
```bash
mb workflow --task T1 --description "Implemented feature X"
mb workflow --task T2 --description "Fixed bug" \
  --files "Modified:src/index.js,Created:lib/util.js" \
  --status completed
```

**Requirements**:
- Project must have `memory-bank/database/lib/` with workflow.js, sqlite.js, inserts.js, regenerate.js
- Set up with: `mb init --database`
- Database initialized with: `mb db init`

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

## DB-Native Workflow Notes
The `mb workflow` command (and `mb db workflow`) require:
1. `mb init --database` to copy workflow library files
2. `mb db init` to create and initialize the SQLite database
3. Project's `memory-bank/database/lib/` must contain:
   - `sqlite.js` — Database operations
   - `inserts.js` — Write operations
   - `regenerate.js` — Markdown generation
   - `workflow.js` — High-level API

The DB library resolution uses this priority:
1. Project's `memory-bank/database/lib/` (for per-project customization)
2. CLI's bundled templates (for development/testing)
3. Legacy mb-core repo structure (backward compatibility)

## Output Formatting
All commands follow these output guidelines:
1. Use consistent color coding
2. Show progress for long operations
3. Support quiet mode
4. Enable JSON output format
5. Include debug information when requested