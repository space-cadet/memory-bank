import { mkdir, copyFile, writeFile } from 'fs/promises';
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
  '.cursorrules'
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
  'pnpm-lock.yaml'
];

const DATABASE_DIRS = [
  'admin',
  'migration-scripts',
  'migrations'
];

export async function initCommand(options) {
  const targetDir = process.cwd();
  console.log(`Memory Bank Initialization ${options.dryRun ? '(DRY RUN)' : ''}`);
  console.log(`Target directory: ${targetDir}\n`);

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
        await writeEmptyFile(filePath);
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
        await writeEmptyFile(filePath);
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

// Helper function to create empty files
async function writeEmptyFile(filePath) {
  await writeFile(filePath, '', { flag: 'w' });
}