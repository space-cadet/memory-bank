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
  'schema.prisma',
  '.env',
  'package.json',
  'pnpm-lock.yaml',
  'DATABASE_README.md'
];

const DATABASE_DIRS = [
  'admin',
  'migration-scripts',
  'migrations'
];

const MIGRATION_SCRIPT_FILES = [
  'convert.js',
  'verify.js',
  'seed.js',
  'migration_guide.md'
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
  
  // Extract timezone abbreviation - compatible with all Node versions
  let timeZoneName = 'UTC';
  try {
    const formatter = new Intl.DateTimeFormat('en-US', { timeZoneName: 'short' });
    const parts = formatter.formatToParts ? formatter.formatToParts(now) : [];
    const tzPart = parts.find(part => part.type === 'timeZoneName');
    if (tzPart) {
      timeZoneName = tzPart.value;
    }
  } catch (e) {
    // Fallback if Intl.DateTimeFormat doesn't support timeZoneName
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
    migrationScriptsExist: []
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

  // Check migration scripts
  for (const file of MIGRATION_SCRIPT_FILES) {
    const filePath = path.join(mbDir, 'database', 'migration-scripts', file);
    if (fs.existsSync(filePath)) {
      scan.migrationScriptsExist.push(file);
    }
  }

  return scan;
}

// Utility: Display scan results and prompt user
async function promptForSelectiveInit(scan) {
  const components = [
    { name: 'core', label: 'Core files (tasks.md, session_cache.md, etc.)', exists: scan.coreFilesExist.length },
    { name: 'templates', label: 'Template files', exists: scan.templateFilesExist.length },
    { name: 'database', label: 'Database setup and migration scripts', exists: scan.databaseFilesExist.length + scan.migrationScriptsExist.length }
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
    directories: true  // Always create needed directories
  };

  // If --full flag, initialize everything
  if (options.full) {
    return { ...components, core: true, templates: true, database: true };
  }

  // If specific components requested
  if (options.core || options.templates || options.database) {
    if (options.core) components.core = true;
    if (options.templates) components.templates = true;
    if (options.database) components.database = true;
    return components;
  }

  // Default: skip existing, initialize missing
  if (!scan.exists || options.skipExisting) {
    return { ...components, core: true, templates: true, database: true };
  }

  // If memory bank exists and no flags specified
  components.core = scan.coreFilesExist.length < CORE_FILES.length;
  components.templates = scan.templateFilesExist.length < TEMPLATE_FILES.length;
  components.database = (scan.databaseFilesExist.length + scan.migrationScriptsExist.length) < (DATABASE_FILES.length + MIGRATION_SCRIPT_FILES.length);

  return components;
}

export async function initCommand(options) {
  const targetDir = process.cwd();
  const mbDir = path.join(targetDir, 'memory-bank');
  
  console.log(`Memory Bank Initialization ${options.dryRun ? '(DRY RUN)' : ''}`);
  console.log(`Target directory: ${targetDir}\n`);

  // Scan existing content
  const scan = scanExistingContent(targetDir);

  // If memory bank exists and no selective flags, show options
  if (scan.exists && !options.force && !options.core && !options.templates && !options.database && !options.skipExisting && !options.full) {
    await promptForSelectiveInit(scan);
    return;
  }

  // Determine which components to initialize
  const components = determineComponentsToInit(scan, options);

  try {
    console.log('The following will be initialized:\n');

    // 1. Create directories (always)
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

    // 4. Create database files and directories
    if (components.database) {
      console.log('Database directories:');
      for (const dir of DATABASE_DIRS) {
        const dirPath = path.join(mbDir, 'database', dir);
        const exists = fs.existsSync(dirPath);
        const status = exists ? '✓' : '+';
        console.log(`  [${status}] database/${dir}/`);
        if (!options.dryRun && !exists) {
          await mkdir(dirPath, { recursive: true });
        }
      }

      console.log('\nDatabase files in memory-bank/database/:');
      for (const file of DATABASE_FILES) {
        const filePath = path.join(mbDir, 'database', file);
        const exists = fs.existsSync(filePath);
        const status = exists ? '✓' : '+';
        console.log(`  [${status}] ${file}`);
        if (!options.dryRun && (!exists || options.force || options.full)) {
          if (file === 'DATABASE_README.md') {
            await writeDatabaseReadmeFile(filePath);
          } else {
            await writeTemplateFile(filePath, file);
          }
        }
      }

      console.log('\nMigration scripts in memory-bank/database/migration-scripts/:');
      for (const file of MIGRATION_SCRIPT_FILES) {
        const filePath = path.join(mbDir, 'database', 'migration-scripts', file);
        const exists = fs.existsSync(filePath);
        const status = exists ? '✓' : '+';
        console.log(`  [${status}] ${file}`);
        if (!options.dryRun && (!exists || options.force || options.full)) {
          const sourceFile = path.join(__dirname, '..', '..', '..', 'memory-bank', 'database', 'migration-scripts', file);
          
          try {
            if (fs.existsSync(sourceFile)) {
              const content = fs.readFileSync(sourceFile, 'utf8');
              await writeFile(filePath, content, { flag: 'w' });
            } else {
              if (file === 'migration_guide.md') {
                await writeFile(filePath, generateMigrationGuide(), { flag: 'w' });
              } else {
                await writeFile(filePath, `// ${file}\n// Placeholder - download from memory bank source\n`, { flag: 'w' });
              }
            }
          } catch (error) {
            console.warn(`  ⚠️  Could not copy ${file}: ${error.message}`);
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
        console.log('\nLegende: [+] created | [✓] skipped (already exists)');
      }
    }
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

// Content generators - refactored from writeTemplateFile
async function writeTemplateFile(filePath, fileName) {
  let content = '';
  switch(fileName) {
    case 'package.json':
      content = generatePackageJson();
      break;
    case 'schema.prisma':
      content = generateSchemaPrisma();
      break;
    case '.env':
      content = generateEnv();
      break;
    case 'pnpm-lock.yaml':
      content = generatePnpmLock();
      break;
  }
  await writeFile(filePath, content, { flag: 'w' });
}

function generatePackageJson() {
  return JSON.stringify({
    name: "memory-bank-database",
    version: "1.0.0",
    description: "Database implementation for memory bank",
    main: "index.js",
    scripts: {
      migrate: "prisma migrate dev",
      studio: "prisma studio",
      generate: "prisma generate",
      convert: "node ./migration-scripts/convert.js",
      seed: "node ./migration-scripts/seed.js",
      "start:mcp": "node ./mcp-server/index.js"
    },
    dependencies: {
      "@prisma/client": "6.6.0"
    },
    devDependencies: {
      cors: "^2.8.5",
      dotenv: "^16.3.1",
      express: "^4.18.2",
      "gray-matter": "^4.0.3",
      prisma: "6.6.0",
      remark: "^14.0.3",
      "remark-parse": "^10.0.2"
    },
    packageManager: "pnpm@10.20.0+sha512.cf9998222162dd85864d0a8102e7892e7ba4ceadebbf5a31f9c2fce48dfce317a9c53b9f6464d1ef9042cba2e02ae02a9f7c143a2b438cd93c91840f0192b9dd"
  }, null, 2);
}

function generateSchemaPrisma() {
  return `// This is your Prisma schema file,
// learn more about it in the docs: https://pris.ly/d/prisma-schema

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "sqlite"
  url      = env("DATABASE_URL")
}

// Add your models here
`;
}

function generateEnv() {
  return `# Database URL for Prisma
DATABASE_URL="file:./dev.db"

# Add your environment variables here
`;
}

function generatePnpmLock() {
  return `lockfileVersion: '9.0'

settings:
  autoInstallPeers: true
  excludeLinksFromLockfile: false
`;
}

async function writeDatabaseReadmeFile(filePath) {
  const timestamp = getCurrentTimestamp();
  const content = `# Memory Bank Database

*Initialized: ${timestamp}*

## Overview

This directory contains the database implementation for your Memory Bank using Prisma ORM and SQLite.

## Quick Start

### 1. Install Dependencies
\`\`\`bash
pnpm install
\`\`\`

### 2. Set Up Database
\`\`\`bash
pnpm run migrate
\`\`\`

### 3. Generate Prisma Client
\`\`\`bash
pnpm run generate
\`\`\`

### 4. Migrate from Markdown (Optional)
\`\`\`bash
node migration-scripts/convert.js
\`\`\`

## Directory Structure

\`\`\`
database/
├── schema.prisma           # Data model definitions
├── .env                    # Database configuration
├── package.json            # Dependencies and scripts
├── pnpm-lock.yaml          # Dependency lock file
├── migrations/             # Prisma migration history
├── migration-scripts/      # Database operation scripts
│   ├── convert.js          # Convert markdown to database
│   ├── seed.js             # Seed with sample data
│   └── verify.js           # Verify database integrity
├── admin/                  # Administrative utilities
└── mcp-server/             # MCP server implementation
\`\`\`

## Available Scripts

- \`pnpm run migrate\` - Run database migrations
- \`pnpm run studio\` - Open Prisma Studio browser
- \`pnpm run generate\` - Regenerate Prisma client
- \`pnpm run convert\` - Convert markdown files to database
- \`pnpm run seed\` - Populate with sample data
- \`pnpm run start:mcp\` - Start MCP server

## Next Steps

1. Install dependencies: \`pnpm install\`
2. Set up database: \`pnpm run migrate\`
3. View data: \`pnpm run studio\`
4. Migrate markdown (if existing): \`node migration-scripts/convert.js\`
5. Start building your memory bank application
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
pnpm run migrate
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
├── database/              # Database implementation
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
4. If using database: \`cd memory-bank/database && pnpm install && pnpm run migrate\`
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

function generateMigrationGuide() {
  return `# Database Migration Guide

## Overview
This directory contains scripts to migrate your markdown-based memory bank to the database system.

## Migration Scripts

### convert.js
Converts existing markdown files to database entries. Handles:
- tasks.md → Task records
- session_cache.md → Session records
- edit_history.md → Edit history with file modifications
- errorLog.md → Error records with affected files
- activeContext.md, progress.md, projectbrief.md, changelog.md

Usage:
\`\`\`bash
node convert.js
\`\`\`

Features:
- Automatic timezone detection from markdown timestamps
- Multi-project support (converts example projects in examples/ directory)
- Archived file conversion
- Relationship mapping for task dependencies

### verify.js
Verifies database integrity after migration.

Usage:
\`\`\`bash
node verify.js
\`\`\`

Checks:
- Record counts across all tables
- Orphaned records and broken references
- Circular dependencies
- Data consistency

### seed.js
Populates the database with sample data (optional).

Usage:
\`\`\`bash
node seed.js
\`\`\`

## Migration Process

1. Install dependencies: \`pnpm install\`
2. Set up database: \`pnpm run migrate\`
3. Run conversion: \`pnpm run convert\`
4. Verify integrity: \`node verify.js\`
5. Review and confirm data in Prisma Studio: \`pnpm run studio\`

## Timezone Handling

The migration scripts automatically detect and parse timestamps regardless of timezone:
- Supports ISO format: \`2025-11-11 18:02:49 IST\`
- Supports date strings: \`April 15, 2025\`
- Falls back to current date if parsing fails (with warning)

## Troubleshooting

### Issue: "Invalid date string"
The script encountered an unparseable date format and used the current date as fallback.
Check your markdown files for consistent date formatting.

### Issue: Missing relationships
Ensure task IDs in your markdown match the pattern T[number] (e.g., T1, T2, T123).

### Issue: Example projects not migrating
Verify the examples/ directory structure matches expected layout.

## Next Steps

After successful migration:
1. Review records in Prisma Studio
2. Test database queries
3. Set up MCP server if needed
4. Begin using database-backed workflows
`;
}

// Helper: Create empty files
async function writeEmptyFile(filePath) {
  await writeFile(filePath, '', { flag: 'w' });
}
