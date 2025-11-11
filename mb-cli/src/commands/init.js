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

// Utility: Generate IST timestamp
function getISTTimestamp() {
  const now = new Date();
  const formatted = now.toLocaleString('en-IN', { 
    year: 'numeric', 
    month: '2-digit', 
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    timeZone: 'Asia/Kolkata'
  });
  return formatted.replace(/(\d+)\/(\d+)\/(\d+),\s(\d+):(\d+):(\d+)/, '$3-$2-$1 $4:$5:$6') + ' IST';
}

export async function initCommand(options) {
  const targetDir = process.cwd();
  const mbDir = path.join(targetDir, 'memory-bank');
  
  console.log(`Memory Bank Initialization ${options.dryRun ? '(DRY RUN)' : ''}`);
  console.log(`Target directory: ${targetDir}\n`);

  // Check if memory bank already exists
  if (fs.existsSync(mbDir) && !options.force) {
    const files = fs.readdirSync(mbDir);
    if (files.length > 0) {
      console.error('Error: Memory bank already exists at memory-bank/');
      console.error(`Found ${files.length} existing file(s):\n`);
      files.slice(0, 10).forEach(file => console.error(`  - ${file}`));
      if (files.length > 10) {
        console.error(`  ... and ${files.length - 10} more files`);
      }
      console.error('\nOptions:');
      console.error('  1. Use --force to overwrite existing memory bank');
      console.error('  2. Run init in a different directory');
      console.error('  3. Back up and remove existing memory-bank/ directory first');
      process.exit(1);
    }
  }

  try {
    // 1. Create directories
    console.log('The following structure will be created:');
    console.log('\nDirectories:');
    for (const dir of DIRS) {
      console.log(`  ${dir}/`);
      if (!options.dryRun) {
        await mkdir(path.join(targetDir, dir), { recursive: true });
      }
    }

    // 2. Create template files
    console.log('\nTemplate files in memory-bank/templates/:');
    for (const file of TEMPLATE_FILES) {
      console.log(`  ${file}`);
      if (!options.dryRun) {
        const filePath = path.join(targetDir, 'memory-bank', 'templates', file);
        await writeEmptyFile(filePath);
      }
    }

    // 3. Create core files with content
    console.log('\nCore files in memory-bank/:');
    for (const file of CORE_FILES) {
      console.log(`  ${file}`);
      if (!options.dryRun) {
        const filePath = path.join(targetDir, 'memory-bank', file);
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

    // 4. Create database directories
    console.log('\nDatabase structure in memory-bank/database/:');
    for (const dir of DATABASE_DIRS) {
      console.log(`  ${dir}/`);
      if (!options.dryRun) {
        await mkdir(path.join(targetDir, 'memory-bank', 'database', dir), { recursive: true });
      }
    }
    
    // 5. Create database files
    console.log('\nDatabase files in memory-bank/database/:');
    for (const file of DATABASE_FILES) {
      console.log(`  ${file}`);
      if (!options.dryRun) {
        const filePath = path.join(targetDir, 'memory-bank', 'database', file);
        if (file === 'DATABASE_README.md') {
          await writeDatabaseReadmeFile(filePath);
        } else {
          await writeTemplateFile(filePath, file);
        }
      }
    }

    if (options.dryRun) {
      console.log('\nDRY RUN: No files were actually created');
    } else {
      console.log('\nMemory Bank initialization completed successfully!');
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
  const timestamp = getISTTimestamp();
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
  const timestamp = getISTTimestamp();
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
  const timestamp = getISTTimestamp();
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
  const timestamp = getISTTimestamp();
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
  const timestamp = getISTTimestamp();
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
