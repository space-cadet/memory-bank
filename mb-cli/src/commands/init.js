import { mkdir, writeFile } from 'fs/promises';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Directory and file configurations
const DIRS = [
  'memory-bank',
  'memory-bank/tasks',
  'memory-bank/sessions',
  'memory-bank/templates',
  'memory-bank/database',
  'memory-bank/implementation-details',
  'memory-bank/archive'
];

const CORE_FILES = [
  'activeContext.md',
  'changelog.md',
  'edit_history.md',
  'errorLog.md',
  'progress.md',
  'projectbrief.md',
  'session_cache.md',
  'systemPatterns.md',
  'tasks.md',
  'techContext.md',
  '.cursorrules',
  'README.md'
];

const TEMPLATE_FILES = [
  'activeContext.md',
  'changelog.md',
  'component_index.md',
  'edit_history.md',
  'errorLog.md',
  'progress.md',
  'projectbrief.md',
  'session_cache.md',
  'tasks.md',
  'task-template.md'
];

const DATABASE_FILES = [
  'package.json',
  'pnpm-lock.yaml',
  'DATABASE_README.md'
];

const DATABASE_SCRIPTS = [
  'parse-edits.js',
  'parse-tasks.js',
  'query.js',
  'query-tasks.js'
];

// Utility: Get current timestamp in user's timezone
function getCurrentTimestamp() {
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

// Utility: Scan existing memory bank content
function scanExistingContent(targetDir) {
  const mbDir = path.join(targetDir, 'memory-bank');
  
  const scan = {
    exists: fs.existsSync(mbDir),
    dirsExist: [],
    coreFilesExist: [],
    templateFilesExist: [],
    databaseFilesExist: [],
    databaseScriptsExist: []
  };

  if (!scan.exists) {
    return scan;
  }

  // Check directories
  for (const dir of DIRS) {
    const dirPath = path.join(targetDir, dir);
    if (fs.existsSync(dirPath)) {
      scan.dirsExist.push(dir);
    }
  }

  // Check core files
  for (const file of CORE_FILES) {
    const filePath = path.join(mbDir, file);
    if (fs.existsSync(filePath)) {
      scan.coreFilesExist.push(file);
    }
  }

  // Check template files
  for (const file of TEMPLATE_FILES) {
    const filePath = path.join(mbDir, 'templates', file);
    if (fs.existsSync(filePath)) {
      scan.templateFilesExist.push(file);
    }
  }

  // Check database files
  for (const file of DATABASE_FILES) {
    const filePath = path.join(mbDir, 'database', file);
    if (fs.existsSync(filePath)) {
      scan.databaseFilesExist.push(file);
    }
  }

  // Check database scripts
  for (const file of DATABASE_SCRIPTS) {
    const filePath = path.join(mbDir, 'database', file);
    if (fs.existsSync(filePath)) {
      scan.databaseScriptsExist.push(file);
    }
  }

  return scan;
}

// Utility: Display scan results and prompt user
async function promptForSelectiveInit(scan) {
  const components = [
    { name: 'core', label: 'Core files (tasks.md, session_cache.md, etc.)', exists: scan.coreFilesExist.length },
    { name: 'templates', label: 'Template files', exists: scan.templateFilesExist.length },
    { name: 'database', label: 'Database setup and parser scripts', exists: scan.databaseFilesExist.length + scan.databaseScriptsExist.length }
  ];

  console.log('\nExisting Memory Bank detected!\n');
  console.log('Components:');
  
  for (const comp of components) {
    if (comp.exists > 0) {
      console.log(`  ✓ ${comp.label} (${comp.exists} files exist)`);
    } else {
      console.log(`  ⬜ ${comp.label} (missing)`);
    }
  }

  console.log('\nOptions for selective initialization:');
  console.log('  --full           Initialize all components (overwrites existing)');
  console.log('  --core           Initialize only core files');
  console.log('  --templates      Initialize only template files');
  console.log('  --database       Initialize only database files');
  console.log('  --skip-existing  Initialize only missing files (default)');
  console.log('  --force          Override all existing files\n');
}

// Determine which components to initialize based on options and existing content
function determineComponentsToInit(scan, options) {
  const components = {
    core: false,
    templates: false,
    database: false,
    directories: true
  };

  if (options.full) {
    return { ...components, core: true, templates: true, database: true };
  }

  if (options.core || options.templates || options.database) {
    if (options.core) components.core = true;
    if (options.templates) components.templates = true;
    if (options.database) components.database = true;
    return components;
  }

  if (!scan.exists || options.skipExisting) {
    return { ...components, core: true, templates: true, database: true };
  }

  components.core = scan.coreFilesExist.length < CORE_FILES.length;
  components.templates = scan.templateFilesExist.length < TEMPLATE_FILES.length;
  components.database = (scan.databaseFilesExist.length + scan.databaseScriptsExist.length) < (DATABASE_FILES.length + DATABASE_SCRIPTS.length);

  return components;
}

export async function initCommand(options) {
  const targetDir = process.cwd();
  const mbDir = path.join(targetDir, 'memory-bank');
  
  console.log(`Memory Bank Initialization ${options.dryRun ? '(DRY RUN)' : ''}`);
  console.log(`Target directory: ${targetDir}\n`);

  const scan = scanExistingContent(targetDir);

  if (scan.exists && !options.force && !options.core && !options.templates && !options.database && !options.skipExisting && !options.full) {
    await promptForSelectiveInit(scan);
    return;
  }

  const components = determineComponentsToInit(scan, options);

  try {
    console.log('The following will be initialized:\n');

    let summary = [];
    let targetDisplay = targetDir;
    
    if (components.core) summary.push('Core memory bank files');
    if (components.templates) summary.push('Template files');
    if (components.database) {
      summary.push('Database setup with SQLite parser scripts');
      targetDisplay = path.join(targetDir, 'memory-bank', 'database');
    }
    
    if (summary.length > 0) {
      console.log('Components to initialize: ' + summary.join(', '));
      console.log(`Target directory: ${targetDisplay}\n`);
    }

    if (!options.force && !process.argv.includes('--skip-confirmation')) {
      const readline = await import('readline');
      const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
      });

      const confirmed = await new Promise((resolve) => {
        rl.question('Proceed with initialization? (yes/no): ', (answer) => {
          rl.close();
          resolve(answer.toLowerCase() === 'yes' || answer.toLowerCase() === 'y');
        });
      });

      if (!confirmed) {
        console.log('Initialization cancelled.');
        return;
      }
    }

    console.log('Starting initialization...\n');

    // 1. Create directories
    if (components.directories) {
      console.log('Directories:');
      for (const dir of DIRS) {
        const dirPath = path.join(targetDir, dir);
        const exists = fs.existsSync(dirPath);
        const status = exists ? '✓' : '+';
        console.log(`  [${status}] ${dir}/`);
        if (!options.dryRun && !exists) {
          await mkdir(dirPath, { recursive: true });
        }
      }
      console.log('');
    }

    // 2. Create core files
    if (components.core) {
      console.log('Core files in memory-bank/:');
      for (const file of CORE_FILES) {
        const filePath = path.join(mbDir, file);
        const exists = fs.existsSync(filePath);
        const status = exists ? '✓' : '+';
        console.log(`  [${status}] ${file}`);
        if (!options.dryRun && (!exists || options.force || options.full)) {
          if (file === 'README.md') {
            await writeReadmeFile(filePath);
          } else if (file === 'tasks.md') {
            await writeTasksFile(filePath);
          } else if (file === 'projectbrief.md') {
            await writeProjectBriefFile(filePath);
          } else if (file === 'session_cache.md') {
            await writeSessionCacheFile(filePath);
          } else if (file === '.cursorrules') {
            await writeCursorrulesFile(filePath);
          } else {
            await writeEmptyFile(filePath);
          }
        }
      }
      console.log('');
    }

    // 3. Create template files
    if (components.templates) {
      console.log('Template files in memory-bank/templates/:');
      for (const file of TEMPLATE_FILES) {
        const filePath = path.join(mbDir, 'templates', file);
        const exists = fs.existsSync(filePath);
        const status = exists ? '✓' : '+';
        console.log(`  [${status}] ${file}`);
        if (!options.dryRun && (!exists || options.force || options.full)) {
          await writeEmptyFile(filePath);
        }
      }
      console.log('');
    }

    // 4. Create database files
    if (components.database) {
      console.log('Database files in memory-bank/database/:');
      for (const file of DATABASE_FILES) {
        const filePath = path.join(mbDir, 'database', file);
        const exists = fs.existsSync(filePath);
        const status = exists ? '✓' : '+';
        console.log(`  [${status}] ${file}`);
        if (!options.dryRun && (!exists || options.force || options.full)) {
          if (file === 'DATABASE_README.md') {
            await writeDatabaseReadmeFile(filePath);
          } else if (file === 'package.json') {
            await writeFile(filePath, generatePackageJson(), { flag: 'w' });
          } else if (file === 'pnpm-lock.yaml') {
            await writeFile(filePath, generatePnpmLock(), { flag: 'w' });
          }
        }
      }

      console.log('\nDatabase parser scripts in memory-bank/database/:');
      for (const file of DATABASE_SCRIPTS) {
        const filePath = path.join(mbDir, 'database', file);
        const exists = fs.existsSync(filePath);
        const status = exists ? '✓' : '+';
        console.log(`  [${status}] ${file}`);
        if (!options.dryRun && (!exists || options.force || options.full)) {
          const sourceFile = path.join(__dirname, '..', '..', '..', 'memory-bank', 'database', file);
          if (fs.existsSync(sourceFile)) {
            const content = fs.readFileSync(sourceFile, 'utf8');
            await writeFile(filePath, content, { flag: 'w' });
          } else {
            console.warn(`  ⚠️  Warning: Source file not found: ${file}`);
          }
        }
      }
      console.log('');
    }

    if (options.dryRun) {
      console.log('DRY RUN: No files were actually created');
    } else {
      console.log('Memory Bank initialization completed successfully!');
      if (scan.exists && !options.full && !options.force) {
        console.log('\nLegend: [+] created | [✓] skipped (already exists)');
      }

      if (components.database) {
        console.log('\n' + '='.repeat(60));
        console.log('DATABASE SETUP');
        console.log('='.repeat(60));
        console.log('\nTo set up the database parser:');
        console.log(`  cd ${path.join(mbDir, 'database')}`);
        console.log('  pnpm install');
        console.log('  node parse-edits.js      # Parse edit history');
        console.log('  node parse-tasks.js      # Parse tasks');
        console.log('  node query.js stats      # View database statistics');
      }
    }
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

function generatePackageJson() {
  return JSON.stringify({
    name: "memory-bank-database",
    version: "1.0.0",
    description: "SQLite database for memory bank with better-sqlite3",
    type: "module",
    scripts: {
      parse: "node parse-edits.js && node parse-tasks.js",
      query: "node query.js",
      "query-tasks": "node query-tasks.js"
    },
    dependencies: {
      "better-sqlite3": "^12.4.1"
    },
    packageManager: "pnpm@10.20.0+sha512.cf9998222162dd85864d0a8102e7892e7ba4ceadebbf5a31f9c2fce48dfce317a9c53b9f6464d1ef9042cba2e02ae02a9f7c143a2b438cd93c91840f0192b9dd"
  }, null, 2);
}

function generatePnpmLock() {
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

async function writeDatabaseReadmeFile(filePath) {
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

Parse edit history:
\`\`\`bash
node parse-edits.js
\`\`\`

Parse tasks:
\`\`\`bash
node parse-tasks.js
\`\`\`

Or parse both at once:
\`\`\`bash
pnpm run parse
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

## Files

- **parse-edits.js** - Parser for edit_history.md
- **parse-tasks.js** - Parser for tasks.md
- **query.js** - Interactive query tool for edit history
- **query-tasks.js** - Task query tool
- **memory_bank.db** - SQLite database (generated after parsing)

## Database Structure

The database contains two main tables:

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
4. Open memory_bank.db in your favorite SQLite viewer
`;
  await writeFile(filePath, content, { flag: 'w' });
}

async function writeReadmeFile(filePath) {
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

async function writeTasksFile(filePath) {
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

async function writeProjectBriefFile(filePath) {
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

async function writeSessionCacheFile(filePath) {
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

async function writeCursorrulesFile(filePath) {
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

// Helper: Create empty files
async function writeEmptyFile(filePath) {
  await writeFile(filePath, '', { flag: 'w' });
}
