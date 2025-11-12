import { mkdir, copyFile, writeFile } from 'fs/promises';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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
    // 1. Show directory structure that will be created
    console.log('The following structure will be created:');
    console.log('\nDirectories:');
    for (const dir of DIRS) {
      const fullPath = path.join(targetDir, dir);
      console.log(`  ${dir}/`);
      if (!options.dryRun) {
        await mkdir(fullPath, { recursive: true });
      }
    }

    // 2. Show template files
    console.log('\nTemplate files in memory-bank/templates/:');
    for (const file of TEMPLATE_FILES) {
      console.log(`  ${file}`);
      if (!options.dryRun) {
        const filePath = path.join(targetDir, 'memory-bank', 'templates', file);
        await writeEmptyFile(filePath);
      }
    }

    // 3. Show core files
    console.log('\nCore files in memory-bank/:');
    for (const file of CORE_FILES) {
      console.log(`  ${file}`);
      if (!options.dryRun) {
        const filePath = path.join(targetDir, 'memory-bank', file);
        if (file === 'README.md') {
          await writeReadmeFile(filePath);
        } else {
          await writeEmptyFile(filePath);
        }
      }
    }

    // 4. Show database structure
    console.log('\nDatabase structure in memory-bank/database/:');
    for (const dir of DATABASE_DIRS) {
      console.log(`  ${dir}/`);
      if (!options.dryRun) {
        await mkdir(path.join(targetDir, 'memory-bank', 'database', dir), { recursive: true });
      }
    }
    
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

// Helper function to write template files with appropriate content
async function writeTemplateFile(filePath, fileName) {
  let content = '';

  if (fileName === 'package.json') {
    content = JSON.stringify({
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
  } else if (fileName === 'schema.prisma') {
    content = `// This is your Prisma schema file,
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
  } else if (fileName === '.env') {
    content = `# Database URL for Prisma
DATABASE_URL="file:./dev.db"

# Add your environment variables here
`;
  } else if (fileName === 'pnpm-lock.yaml') {
    content = `lockfileVersion: '9.0'

settings:
  autoInstallPeers: true
  excludeLinksFromLockfile: false
`;
  } else if (fileName === 'DATABASE_README.md') {
    content = `# Memory Bank Database

*Initialized: ${new Date().toLocaleString('en-IN', { 
    year: 'numeric', 
    month: '2-digit', 
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    timeZone: 'Asia/Kolkata'
  }).replace(/(\d+)\/(\d+)\/(\d+),\s(\d+):(\d+):(\d+)/, '$3-$2-$1 $4:$5:$6')} IST*

## Overview

This directory contains the database implementation for your Memory Bank using Prisma ORM and SQLite. The database stores all memory bank data (tasks, sessions, edit history, errors, etc.) in a structured relational format.

## Quick Start

### 1. Install Dependencies
\`\`\`bash
pnpm install
\`\`\`

### 2. Set Up Database
\`\`\`bash
pnpm run migrate
\`\`\`

### 3. Generate Prisma Client (if schema changes)
\`\`\`bash
pnpm run generate
\`\`\`

### 4. Migrate from Markdown (Optional)
If you already have markdown memory bank files:
\`\`\`bash
node migration-scripts/convert.js
\`\`\`

## Directory Structure

\`\`\`
database/
├── README.md               # This file
├── schema.prisma           # Prisma data model definitions
├── .env                    # Database configuration
├── package.json            # Dependencies and scripts
├── pnpm-lock.yaml          # Dependency lock file
├── migrations/             # Prisma migration history
├── migration-scripts/      # Database operation scripts
│   ├── convert.js          # Convert markdown to database
│   ├── seed.js             # Seed database with sample data
│   ├── verify.js           # Verify database integrity
│   └── migration_guide.md  # Detailed migration instructions
├── admin/                  # Administrative utilities
└── mcp-server/             # MCP server implementation
\`\`\`

## Configuration

### .env File

The database connection is configured in \`.env\`:

\`\`\`
DATABASE_URL="file:../memory-bank.db"
\`\`\`

Supported databases:
- **SQLite** (default): \`file:./dev.db\` or \`file:../memory-bank.db\`
- **PostgreSQL**: \`postgresql://user:password@localhost:5432/memory_bank\`
- **MySQL**: \`mysql://user:password@localhost:3306/memory_bank\`
- **MongoDB**: \`mongodb://user:password@localhost:27017/memory_bank\`

To use a different database:
1. Update DATABASE_URL in \`.env\`
2. Update datasource provider in \`schema.prisma\`
3. Run \`pnpm run migrate\` to create schema

## Data Models

The database contains the following main data models:

### Project
Top-level container for all project data. Supports multiple projects in one database.

**Fields**: id, name, path, createdAt, updatedAt

### Task
Individual work items corresponding to tasks.md entries.

**Fields**: id, title, description, status, priority, startedAt, completedAt, lastActiveAt, pausedAt, pausedReason, owner, completionCriteria, notes, projectId

**Relationships**: dependencies, dependents, relatedFiles, editHistoryEntries, errors, sessions

### Session
Recording of work sessions corresponding to session_cache.md.

**Fields**: id, createdAt, updatedAt, status, notes, implementationFocus, projectId

**Relationships**: tasks (via SessionTask), project

### SessionTask
Join table linking sessions to tasks with session-specific progress.

**Fields**: id, sessionId, taskId, isFocus, stepProgress, contextNotes

### EditHistoryEntry
File modification records corresponding to edit_history.md.

**Fields**: id, timestamp, description, taskId, projectId

**Relationships**: modifications (file-specific changes), task, project

### FileModification
Individual file changes within edit history entries.

**Fields**: id, path, action (CREATED/MODIFIED/DELETED), description, editHistoryEntryId

### Error
Error tracking corresponding to errorLog.md.

**Fields**: id, timestamp, title, filePath, errorDescription, errorMessage, cause, fix, keyCodeChanges, taskId, projectId

**Relationships**: affectedFiles, task, project

### AffectedFile
Files impacted by errors.

**Fields**: id, path, errorId

### ActiveContext
Current focus and decisions corresponding to activeContext.md.

**Fields**: id, createdAt, updatedAt, implementationFocus, currentDecisions, nextActions, projectId

### Progress
Project milestones and status corresponding to progress.md.

**Fields**: id, updatedAt, milestones, knownIssues, goals, projectId

### ProjectBrief
Project overview and requirements corresponding to projectbrief.md.

**Fields**: id, updatedAt, overview, objectives, keyFiles, architecture, technologies, projectId

### ChangelogEntry
Project changes and releases corresponding to changelog.md.

**Fields**: id, version, date, changes, projectId

### CustomDocument
Project-specific documentation.

**Fields**: id, title, path, content, category, updatedAt, projectId

## Available Scripts

### pnpm run migrate
Runs Prisma migrations and updates the database schema. Use this after schema changes or for initial setup.

### pnpm run studio
Opens Prisma Studio, a visual database browser and editor. Useful for inspecting and modifying data directly.

\`\`\`bash
pnpm run studio
\`\`\`

### pnpm run generate
Regenerates the Prisma client. Use this after editing schema.prisma.

### pnpm run convert
Converts markdown memory bank files to database entries. See migration_guide.md for details.

### pnpm run seed
Populates the database with sample data for testing. Defined in migration-scripts/seed.js.

### pnpm run start:mcp
Starts the MCP server for database interaction via Model Context Protocol.

## Migration from Markdown

To migrate existing markdown files to the database:

### Before Migration
1. Back up your markdown files:
   \`\`\`bash
   cp -r ../memory-bank ../memory-bank-backup
   \`\`\`

2. Ensure database is initialized:
   \`\`\`bash
   pnpm run migrate
   \`\`\`

### Run Migration
\`\`\`bash
node migration-scripts/convert.js
\`\`\`

The script automatically:
- Reads all markdown files from ../memory-bank/
- Parses task, session, edit history, error, and other data
- Creates corresponding database records
- Preserves relationships and metadata
- Skips duplicate entries on subsequent runs

### After Migration
- Verify data was converted correctly:
  \`\`\`bash
  node migration-scripts/verify.js
  \`\`\`

- Query the database using Prisma Studio:
  \`\`\`bash
  pnpm run studio
  \`\`\`

- Keep markdown files as backup or continue using them alongside the database

See migration-scripts/migration_guide.md for detailed troubleshooting.

## Working with Data

### Using Prisma Studio
The easiest way to view and edit database data:

\`\`\`bash
pnpm run studio
\`\`\`

Then open http://localhost:5555 in your browser.

### Querying with Prisma Client
Create a JavaScript file to query data programmatically:

\`\`\`javascript
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Get all tasks for a project
const tasks = await prisma.task.findMany({
  where: { projectId: 'project-id' },
  include: { dependencies: true }
});

await prisma.$disconnect();
\`\`\`

### Schema Changes
If you need to modify the database schema:

1. Edit \`schema.prisma\`
2. Run \`pnpm run generate\` to update Prisma client
3. Run \`pnpm run migrate\` to apply changes to database

## Troubleshooting

### Database File Not Found
If you see "database file not found" errors:
- Check .env DATABASE_URL is correct
- Ensure the path exists: \`mkdir -p ../\` if needed
- Run \`pnpm run migrate\` to create database

### Migration Errors
If \`pnpm run migrate\` fails:
- Check error message for specific issue
- Ensure .env DATABASE_URL is valid
- Try backing up and deleting memory-bank.db to start fresh
- See migration_guide.md for more help

### Prisma Client Issues
If Prisma client errors occur:
- Run \`pnpm run generate\` to regenerate
- Delete node_modules and run \`pnpm install\`
- Ensure @prisma/client version matches prisma CLI version

### Conversion Script Issues
If markdown conversion fails:
- Check migration_guide.md for date format issues
- Run verify script after conversion: \`node migration-scripts/verify.js\`
- Check console output for specific file/record errors
- Ensure markdown files are in ../memory-bank/ directory

## Best Practices

1. **Regular Backups**: Keep markdown file backups or use git for version control
2. **Migrations**: Always run migrations after pulling schema changes from git
3. **Data Integrity**: Use \`pnpm run studio\` to verify data periodically
4. **Multi-Project**: Use the Project model if managing multiple projects
5. **Relationships**: Leverage task dependencies and file relationships for better querying

## Additional Resources

- Prisma Documentation: https://www.prisma.io/docs/
- Database Schema: See schema.prisma for complete model definitions
- Migration Guide: See migration-scripts/migration_guide.md
- Examples: Check the parent memory-bank/ directory for example usage

## Next Steps

1. Install dependencies: \`pnpm install\`
2. Set up database: \`pnpm run migrate\`
3. View data: \`pnpm run studio\`
4. Migrate markdown (if existing): \`node migration-scripts/convert.js\`
5. Start building your memory bank application
`;
  }

  await writeFile(filePath, content, { flag: 'w' });
}

// Helper function to write DATABASE README with current timestamp
async function writeDatabaseReadmeFile(filePath) {
  const now = new Date();
  const timestamp = now.toLocaleString('en-IN', { 
    year: 'numeric', 
    month: '2-digit', 
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    timeZone: 'Asia/Kolkata'
  }).replace(/(\d+)\/(\d+)\/(\d+),\s(\d+):(\d+):(\d+)/, '$3-$2-$1 $4:$5:$6') + ' IST';

  const content = `# Memory Bank Database

*Initialized: ${timestamp}*

## Overview

This directory contains the database implementation for your Memory Bank using Prisma ORM and SQLite. The database stores all memory bank data (tasks, sessions, edit history, errors, etc.) in a structured relational format.

## Quick Start

### 1. Install Dependencies
\`\`\`bash
pnpm install
\`\`\`

### 2. Set Up Database
\`\`\`bash
pnpm run migrate
\`\`\`

### 3. Generate Prisma Client (if schema changes)
\`\`\`bash
pnpm run generate
\`\`\`

### 4. Migrate from Markdown (Optional)
If you already have markdown memory bank files:
\`\`\`bash
node migration-scripts/convert.js
\`\`\`

## Directory Structure

\`\`\`
database/
├── DATABASE_README.md       # This file
├── schema.prisma            # Prisma data model definitions
├── .env                     # Database configuration
├── package.json             # Dependencies and scripts
├── pnpm-lock.yaml           # Dependency lock file
├── migrations/              # Prisma migration history
├── migration-scripts/       # Database operation scripts
│   ├── convert.js           # Convert markdown to database
│   ├── seed.js              # Seed database with sample data
│   ├── verify.js            # Verify database integrity
│   └── migration_guide.md   # Detailed migration instructions
├── admin/                   # Administrative utilities
└── mcp-server/              # MCP server implementation
\`\`\`

## Configuration

### .env File

The database connection is configured in \`.env\`:

\`\`\`
DATABASE_URL="file:../memory-bank.db"
\`\`\`

Supported databases:
- **SQLite** (default): \`file:./dev.db\` or \`file:../memory-bank.db\`
- **PostgreSQL**: \`postgresql://user:password@localhost:5432/memory_bank\`
- **MySQL**: \`mysql://user:password@localhost:3306/memory_bank\`
- **MongoDB**: \`mongodb://user:password@localhost:27017/memory_bank\`

To use a different database:
1. Update DATABASE_URL in \`.env\`
2. Update datasource provider in \`schema.prisma\`
3. Run \`pnpm run migrate\` to create schema

## Data Models

The database contains the following main data models:

### Project
Top-level container for all project data. Supports multiple projects in one database.

**Fields**: id, name, path, createdAt, updatedAt

### Task
Individual work items corresponding to tasks.md entries.

**Fields**: id, title, description, status, priority, startedAt, completedAt, lastActiveAt, pausedAt, pausedReason, owner, completionCriteria, notes, projectId

**Relationships**: dependencies, dependents, relatedFiles, editHistoryEntries, errors, sessions

### Session
Recording of work sessions corresponding to session_cache.md.

**Fields**: id, createdAt, updatedAt, status, notes, implementationFocus, projectId

**Relationships**: tasks (via SessionTask), project

### SessionTask
Join table linking sessions to tasks with session-specific progress.

**Fields**: id, sessionId, taskId, isFocus, stepProgress, contextNotes

### EditHistoryEntry
File modification records corresponding to edit_history.md.

**Fields**: id, timestamp, description, taskId, projectId

**Relationships**: modifications (file-specific changes), task, project

### FileModification
Individual file changes within edit history entries.

**Fields**: id, path, action (CREATED/MODIFIED/DELETED), description, editHistoryEntryId

### Error
Error tracking corresponding to errorLog.md.

**Fields**: id, timestamp, title, filePath, errorDescription, errorMessage, cause, fix, keyCodeChanges, taskId, projectId

**Relationships**: affectedFiles, task, project

### AffectedFile
Files impacted by errors.

**Fields**: id, path, errorId

### ActiveContext
Current focus and decisions corresponding to activeContext.md.

**Fields**: id, createdAt, updatedAt, implementationFocus, currentDecisions, nextActions, projectId

### Progress
Project milestones and status corresponding to progress.md.

**Fields**: id, updatedAt, milestones, knownIssues, goals, projectId

### ProjectBrief
Project overview and requirements corresponding to projectbrief.md.

**Fields**: id, updatedAt, overview, objectives, keyFiles, architecture, technologies, projectId

### ChangelogEntry
Project changes and releases corresponding to changelog.md.

**Fields**: id, version, date, changes, projectId

### CustomDocument
Project-specific documentation.

**Fields**: id, title, path, content, category, updatedAt, projectId

## Available Scripts

### pnpm run migrate
Runs Prisma migrations and updates the database schema. Use this after schema changes or for initial setup.

### pnpm run studio
Opens Prisma Studio, a visual database browser and editor. Useful for inspecting and modifying data directly.

\`\`\`bash
pnpm run studio
\`\`\`

### pnpm run generate
Regenerates the Prisma client. Use this after editing schema.prisma.

### pnpm run convert
Converts markdown memory bank files to database entries. See migration_guide.md for details.

### pnpm run seed
Populates the database with sample data for testing. Defined in migration-scripts/seed.js.

### pnpm run start:mcp
Starts the MCP server for database interaction via Model Context Protocol.

## Migration from Markdown

To migrate existing markdown files to the database:

### Before Migration
1. Back up your markdown files:
   \`\`\`bash
   cp -r ../memory-bank ../memory-bank-backup
   \`\`\`

2. Ensure database is initialized:
   \`\`\`bash
   pnpm run migrate
   \`\`\`

### Run Migration
\`\`\`bash
node migration-scripts/convert.js
\`\`\`

The script automatically:
- Reads all markdown files from ../memory-bank/
- Parses task, session, edit history, error, and other data
- Creates corresponding database records
- Preserves relationships and metadata
- Skips duplicate entries on subsequent runs

### After Migration
- Verify data was converted correctly:
  \`\`\`bash
  node migration-scripts/verify.js
  \`\`\`

- Query the database using Prisma Studio:
  \`\`\`bash
  pnpm run studio
  \`\`\`

- Keep markdown files as backup or continue using them alongside the database

See migration-scripts/migration_guide.md for detailed troubleshooting.

## Working with Data

### Using Prisma Studio
The easiest way to view and edit database data:

\`\`\`bash
pnpm run studio
\`\`\`

Then open http://localhost:5555 in your browser.

### Querying with Prisma Client
Create a JavaScript file to query data programmatically:

\`\`\`javascript
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Get all tasks for a project
const tasks = await prisma.task.findMany({
  where: { projectId: 'project-id' },
  include: { dependencies: true }
});

await prisma.$disconnect();
\`\`\`

### Schema Changes
If you need to modify the database schema:

1. Edit \`schema.prisma\`
2. Run \`pnpm run generate\` to update Prisma client
3. Run \`pnpm run migrate\` to apply changes to database

## Troubleshooting

### Database File Not Found
If you see "database file not found" errors:
- Check .env DATABASE_URL is correct
- Ensure the path exists: \`mkdir -p ../\` if needed
- Run \`pnpm run migrate\` to create database

### Migration Errors
If \`pnpm run migrate\` fails:
- Check error message for specific issue
- Ensure .env DATABASE_URL is valid
- Try backing up and deleting memory-bank.db to start fresh
- See migration_guide.md for more help

### Prisma Client Issues
If Prisma client errors occur:
- Run \`pnpm run generate\` to regenerate
- Delete node_modules and run \`pnpm install\`
- Ensure @prisma/client version matches prisma CLI version

### Conversion Script Issues
If markdown conversion fails:
- Check migration_guide.md for date format issues
- Run verify script after conversion: \`node migration-scripts/verify.js\`
- Check console output for specific file/record errors
- Ensure markdown files are in ../memory-bank/ directory

## Best Practices

1. **Regular Backups**: Keep markdown file backups or use git for version control
2. **Migrations**: Always run migrations after pulling schema changes from git
3. **Data Integrity**: Use \`pnpm run studio\` to verify data periodically
4. **Multi-Project**: Use the Project model if managing multiple projects
5. **Relationships**: Leverage task dependencies and file relationships for better querying

## Additional Resources

- Prisma Documentation: https://www.prisma.io/docs/
- Database Schema: See schema.prisma for complete model definitions
- Migration Guide: See migration-scripts/migration_guide.md
- Examples: Check the parent memory-bank/ directory for example usage

## Next Steps

1. Install dependencies: \`pnpm install\`
2. Set up database: \`pnpm run migrate\`
3. View data: \`pnpm run studio\`
4. Migrate markdown (if existing): \`node migration-scripts/convert.js\`
5. Start building your memory bank application
`;

  await writeFile(filePath, content, { flag: 'w' });
}

// Helper function to write README with current timestamp
async function writeReadmeFile(filePath) {
  const now = new Date();
  const timestamp = now.toLocaleString('en-IN', { 
    year: 'numeric', 
    month: '2-digit', 
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    timeZone: 'Asia/Kolkata'
  }).replace(/(\d+)\/(\d+)\/(\d+),\s(\d+):(\d+):(\d+)/, '$3-$2-$1 $4:$5:$6') + ' IST';

  const content = `# Memory Bank Project

*Initialized: ${timestamp}*

## Overview

This directory contains your Memory Bank - a system for maintaining project knowledge, tracking tasks, and preserving context across work sessions.

## Getting Started

### 1. Update Core Files

Before using the memory bank, initialize these key files with your project information:

**projectbrief.md** - Start here
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

After initializing the memory bank, set up the database with this workflow:

**Step 1: Install dependencies**
\`\`\`bash
cd memory-bank/database
pnpm install
\`\`\`

**Step 2: Configure database connection**
- Edit \`.env\` file - DATABASE_URL is pre-configured to use SQLite (memory-bank.db)
- For other databases, update the datasource and DATABASE_URL

**Step 3: Generate Prisma client**
\`\`\`bash
pnpm run generate
\`\`\`

**Step 4: Create initial database schema**
\`\`\`bash
pnpm run migrate
\`\`\`

**Step 5 (Optional): Migrate existing markdown files to database**
If you already have markdown files (tasks.md, edit_history.md, etc.), convert them:
\`\`\`bash
node migration-scripts/convert.js
\`\`\`

This reads all memory bank markdown files and stores data in the database.

The database directory structure:
- \`schema.prisma\` - Prisma schema defining all data models
- \`.env\` - Database connection configuration
- \`package.json\` - Dependencies (@prisma/client, express, etc.)
- \`migration-scripts/\` - Scripts for database operations
  - \`convert.js\` - Converts markdown files to database
  - \`seed.js\` - Populates database with sample data
  - \`verify.js\` - Validates database integrity
  - \`migration_guide.md\` - Detailed migration documentation
- \`migrations/\` - Prisma migration history
- \`admin/\` - Administrative tools and utilities
- \`mcp-server/\` - MCP server for database interaction

### 3. File Structure Reference

\`\`\`
memory-bank/
├── README.md              # This file
├── activeContext.md       # Current task context and focus
├── changelog.md           # Record of project changes
├── edit_history.md        # Technical file modification log
├── errorLog.md            # Error tracking and resolution
├── progress.md            # Implementation status and milestones
├── projectbrief.md        # Project overview and requirements
├── session_cache.md       # Multi-session state tracking
├── systemPatterns.md      # Architecture and design patterns
├── tasks.md               # Task registry and tracking
├── techContext.md         # Technical implementation details
├── .cursorrules           # Development guidelines
├── tasks/                 # Individual task files
├── sessions/              # Timestamped session records
├── templates/             # File templates
├── database/              # Database implementation
│   ├── schema.prisma
│   ├── .env
│   ├── package.json
│   ├── migrations/
│   ├── migration-scripts/
│   └── admin/
├── implementation-details/ # Detailed technical notes
└── archive/               # Completed/archived items
\`\`\`

### 4. File Purposes

**Essential Files** - Update regularly:
- **activeContext.md** - What you're currently working on and why
- **tasks.md** - What needs to be done, who's doing it, and status
- **progress.md** - Milestones completed and upcoming priorities

**Context Files** - Update as needed:
- **projectbrief.md** - Project scope and requirements
- **.cursorrules** - Coding standards and patterns
- **techContext.md** - Technical decisions and implementation details
- **systemPatterns.md** - Architecture and design patterns

**Tracking Files** - Maintained automatically:
- **edit_history.md** - Records of file modifications
- **errorLog.md** - Errors encountered and solutions
- **session_cache.md** - Session history and current state
- **changelog.md** - Project changes and releases

### 5. Working with the Memory Bank

When working with an AI assistant:

1. **Reference files in prompts** - Mention which memory bank files contain relevant context
2. **Request specific sections** - Ask the AI to read particular files when needed
3. **Update systematically** - Have the AI update memory bank files after completing work
4. **Use session tracking** - Maintain activeContext.md and session_cache.md for continuity

Example prompt structure:
\`\`\`
Read memory-bank/projectbrief.md and memory-bank/activeContext.md
Then implement the authentication system with the following requirements...
Update memory-bank/edit_history.md and memory-bank/progress.md when done
\`\`\`

### 6. Next Steps

1. Fill in **projectbrief.md** with your project details
2. Add your first tasks to **tasks.md**
3. Define development standards in **.cursorrules**
4. If using database: run \`pnpm install\` and \`pnpm run migrate\` in database/
5. Start working and update context files as you progress

## File Templates

Template files are available in \`templates/\` directory to help with formatting and structure for memory bank files.

## Session Continuity

Each work session should:
1. Load relevant context from memory bank files
2. Work on planned tasks
3. Update memory bank files to reflect progress
4. Record session information for future reference

See **session_cache.md** for session history and current state.

## Questions?

Refer to the system documentation or update files based on your project's actual needs. The memory bank adapts to your workflow.
`;

  await writeFile(filePath, content, { flag: 'w' });
}

// Helper function to create empty files
async function writeEmptyFile(filePath) {
  await writeFile(filePath, '', { flag: 'w' });
}