import { writeFile } from 'fs/promises';

/**
 * Get current timestamp in user's timezone
 */
export function getCurrentTimestamp() {
  const now = new Date();
  const formatted = now.toLocaleString('en-US', { 
    year: 'numeric', 
    month: '2-digit', 
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  });
  
  let timeZoneName = 'UTC';
  try {
    const formatter = new Intl.DateTimeFormat('en-US', { timeZoneName: 'short' });
    const parts = formatter.formatToParts ? formatter.formatToParts(now) : [];
    const tzPart = parts.find(part => part.type === 'timeZoneName');
    if (tzPart) {
      timeZoneName = tzPart.value;
    }
  } catch (e) {
    timeZoneName = 'UTC';
  }
  
  return formatted.replace(/(\d+)\/(\d+)\/(\d+),\s(\d+):(\d+):(\d+)/, '$3-$2-$1 $4:$5:$6') + ' ' + timeZoneName;
}

/**
 * Generate package.json content
 */
export function generatePackageJson() {
  return JSON.stringify({
    name: "memory-bank-database",
    version: "1.0.0",
    description: "SQLite database for memory bank with better-sqlite3",
    type: "module",
    scripts: {
      parse: "node parse-edits.js && node parse-tasks.js && node parse-sessions.js && node parse-session-cache.js",
      query: "node query.js",
      "query-tasks": "node query-tasks.js"
    },
    dependencies: {
      "better-sqlite3": "^12.4.1"
    },
    packageManager: "pnpm@10.20.0+sha512.cf9998222162dd85864d0a8102e7892e7ba4ceadebbf5a31f9c2fce48dfce317a9c53b9f6464d1ef9042cba2e02ae02a9f7c143a2b438cd93c91840f0192b9dd"
  }, null, 2);
}

/**
 * Generate pnpm-lock.yaml content
 */
export function generatePnpmLock() {
  return `lockfileVersion: '9.0'

settings:
  autoInstallPeers: true
  excludeLinksFromLockfile: false

dependencies:
  better-sqlite3:
    specifier: ^12.4.1
    version: 12.4.1
`;
}

/**
 * Write database README file
 */
export async function writeDatabaseReadmeFile(filePath) {
  const timestamp = getCurrentTimestamp();
  const content = `# Memory Bank Database

*Initialized: ${timestamp}*

## Overview

This directory contains the SQLite database for your Memory Bank using better-sqlite3 for direct database access.

## Quick Start

### 1. Install Dependencies
\`\`\`bash
pnpm install
\`\`\`

### 2. Parse Memory Bank Files

Parse all files at once:
\`\`\`bash
pnpm run parse
\`\`\`

Or parse individually:
\`\`\`bash
node parse-edits.js          # Parse edit history
node parse-tasks.js          # Parse tasks
node parse-sessions.js       # Parse session files
node parse-session-cache.js  # Parse session cache
\`\`\`

**Supported Formats:**

Edit history entries support both formats:
- With timezone: \`#### 19:43:25 IST - T3: Description\`
- Without timezone: \`#### 03:37 - T13: Description\` (defaults to UTC)

File modifications:
- \`- Created \\\`file\\\` - description\`
- \`- Modified \\\`file\\\` - description\`
- \`- Updated \\\`file\\\` - description\`

Tasks table format (flexible column count):
- Basic: \`| T1 | Title | 🔄 | HIGH | 2025-11-03 | Dependencies |\`
- With status details: \`| T1 | Title | 🔄 (70%) | HIGH | 2025-11-03 | - | Extra info |\`
- Status icons: 🔄 (in progress), ✅ (completed), ⏸️ (paused)

### 3. Query the Database

View statistics:
\`\`\`bash
node query.js stats
\`\`\`

View all entries:
\`\`\`bash
node query.js all 50
\`\`\`

Query by task:
\`\`\`bash
node query.js task T3
\`\`\`

Search files:
\`\`\`bash
node query.js files schema.prisma
\`\`\`

### 4. View Tasks

\`\`\`bash
node query-tasks.js
\`\`\`

### 5. Start the Viewer

\`\`\`bash
node server.js
\`\`\`

Then open: http://localhost:3000

## Files

- **parse-edits.js** - Parser for edit_history.md
- **parse-tasks.js** - Parser for tasks.md
- **parse-sessions.js** - Parser for sessions/*.md files
- **parse-session-cache.js** - Parser for session_cache.md
- **query.js** - Interactive query tool for edit history
- **query-tasks.js** - Task query tool
- **server.js** - Web-based viewer server
- **memory_bank.db** - SQLite database (generated after parsing)

## Database Structure

The database contains these main tables:

**edit_entries** - Records from edit_history.md
- date, time, timezone, timestamp
- task_id (optional)
- task_description

**edit_modifications** - File changes within each entry
- action (Created, Modified, Updated)
- file_path
- description

**task_items** - Records from tasks.md
- id (task ID like T1, T2)
- title, status, priority
- started date
- details

**task_dependencies** - Relationships between tasks
- task_id -> depends_on

**sessions** - Individual session files
- date, period, status
- focus, task counts
- full content

**session_cache** - Current session state
- focus task, status
- task counts
- raw content

## Using with SQLite Tools

The memory_bank.db file is a standard SQLite database and can be opened with:
- DB Browser for SQLite (https://sqlitebrowser.org/)
- sqlite3 command-line tool: \`sqlite3 memory_bank.db\`
- VS Code SQLite extensions
- Any SQLite viewer

## Next Steps

1. Install dependencies: \`pnpm install\`
2. Parse your markdown files: \`pnpm run parse\`
3. Query the database: \`node query.js stats\`
4. Start the viewer: \`node server.js\`
5. Open memory_bank.db in your favorite SQLite viewer
`;
  await writeFile(filePath, content, { flag: 'w' });
}

/**
 * Write main README file
 */
export async function writeReadmeFile(filePath) {
  const timestamp = getCurrentTimestamp();
  const content = `# Memory Bank Project

*Initialized: ${timestamp}*

## Overview

This directory contains your Memory Bank - a system for maintaining project knowledge, tracking tasks, and preserving context across work sessions.

## Getting Started

### 1. Update Core Files

**projectbrief.md** - Project overview
- Project name and description
- Core objectives
- Key constraints or requirements
- Success metrics

**tasks.md** - Task registry
- Create entries for planned tasks
- Use format: Task ID, title, status, priority
- Update as work progresses

**.cursorrules** - Development guidelines
- Project coding standards
- Architecture patterns
- Technology stack details
- Important conventions

### 2. Database Setup (if using database features)

After initializing the memory bank, set up the database:

\`\`\`bash
cd memory-bank/database
pnpm install
pnpm run parse
node query.js stats
\`\`\`

### 3. File Structure Reference

\`\`\`
memory-bank/
├── README.md              # This file
├── activeContext.md       # Current task context
├── changelog.md           # Project changes
├── edit_history.md        # File modification log
├── errorLog.md            # Error tracking
├── progress.md            # Implementation status
├── projectbrief.md        # Project overview
├── session_cache.md       # Session tracking
├── tasks.md               # Task registry
├── techContext.md         # Technical details
├── .cursorrules           # Development guidelines
├── tasks/                 # Individual task files
├── sessions/              # Session records
├── templates/             # File templates
├── database/              # Database and parser scripts
├── implementation-details/ # Technical notes
└── archive/               # Completed/archived items
\`\`\`

### 4. Working with the Memory Bank

When using with an AI assistant:

1. Reference memory bank files in prompts
2. Request specific sections when needed
3. Update files after completing work
4. Maintain activeContext.md and session_cache.md

### 5. Next Steps

1. Fill in **projectbrief.md** with your project details
2. Add your first tasks to **tasks.md**
3. Define development standards in **.cursorrules**
4. If using database: \`cd memory-bank/database && pnpm install && pnpm run parse\`
5. Start working and update context files as you progress
`;
  await writeFile(filePath, content, { flag: 'w' });
}

/**
 * Write tasks.md file
 */
export async function writeTasksFile(filePath) {
  const timestamp = getCurrentTimestamp();
  const content = `# Task Registry
*Last Updated: ${timestamp}*

## Active Tasks
| ID | Title | Status | Priority | Started | Dependencies |
|----|-------|--------|----------|---------|--------------|

## Completed Tasks
| ID | Title | Completed |
|----|-------|-----------|

## Task Template
When creating new tasks, use this format:

### TXX: Task Title
**Description**: Brief description of what this task accomplishes
**Status**: 🔄 In Progress
**Priority**: HIGH/MEDIUM/LOW
**Started**: YYYY-MM-DD
**Dependencies**: Other task IDs if applicable

## Completion Criteria
- [ ] Criterion 1
- [ ] Criterion 2
- [ ] Criterion 3

## Progress
1. ⬜ Step 1
2. ⬜ Step 2
3. ⬜ Step 3

## Notes
Context and important decisions for this task
`;
  await writeFile(filePath, content, { flag: 'w' });
}

/**
 * Write projectbrief.md file
 */
export async function writeProjectBriefFile(filePath) {
  const timestamp = getCurrentTimestamp();
  const content = `# Project Brief
*Last Updated: ${timestamp}*

## Project Overview
**Project Name**: [Fill in project name]
**Description**: [Brief description of what this project does]

## Objectives
1. [Primary objective]
2. [Secondary objective]
3. [Additional objectives]

## Key Features
- [Feature 1]
- [Feature 2]
- [Feature 3]

## Tech Stack
- **Language**: [Primary language]
- **Framework**: [Framework if applicable]
- **Database**: [Database choice]
- **Other tools**: [Other relevant tools]

## Constraints & Requirements
- [Constraint/Requirement 1]
- [Constraint/Requirement 2]
- [Constraint/Requirement 3]

## Success Metrics
- [Metric 1]
- [Metric 2]
- [Metric 3]

## Repository
**URL**: [Link to repository if applicable]

## Team/Contributors
- [Name]: [Role]
`;
  await writeFile(filePath, content, { flag: 'w' });
}

/**
 * Write session_cache.md file
 */
export async function writeSessionCacheFile(filePath) {
  const timestamp = getCurrentTimestamp();
  const content = `# Session Cache
*Created: ${timestamp}*
*Last Updated: ${timestamp}*

## Current Session
**Started**: ${timestamp}
**Focus Task**: [Task ID]

## Active Tasks
| ID | Title | Status | Progress |
|----|-------|--------|----------|

## Session History
(Sessions will be recorded here as work progresses)

## Next Session Context
[Notes for next session]
`;
  await writeFile(filePath, content, { flag: 'w' });
}

/**
 * Write .cursorrules file
 */
export async function writeCursorrulesFile(filePath) {
  const content = `# Development Guidelines

## Project Standards

### Code Style
- [Add your coding standards]
- [Formatting preferences]
- [Naming conventions]

### Architecture Patterns
- [Key patterns used in this project]
- [Design principles]
- [Architectural decisions]

### File Organization
- [How files are organized]
- [Module structure]
- [Naming conventions for files/folders]

### Dependencies
- [Key dependencies]
- [Version constraints]
- [Why each dependency is used]

### Testing Requirements
- [Testing framework]
- [Coverage requirements]
- [Testing conventions]

### Documentation Standards
- [Comment style]
- [README requirements]
- [API documentation format]

### Git Workflow
- [Branch naming conventions]
- [Commit message format]
- [PR review process]

### Important Notes
- [Project-specific considerations]
- [Common gotchas]
- [Best practices for this codebase]
`;
  await writeFile(filePath, content, { flag: 'w' });
}

/**
 * Write empty file
 */
export async function writeEmptyFile(filePath) {
  await writeFile(filePath, '', { flag: 'w' });
}
