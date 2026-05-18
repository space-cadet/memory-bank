#!/usr/bin/env node

/**
 * mb db — Database operations for Memory Bank
 *
 * Subcommands:
 *   query <sql>       Run SQL query against memory_bank.db
 *   test              Run integration test suite
 *   workflow          Record session work and regenerate files (interactive)
 *   init              Initialize database schema
 */

import { Command } from 'commander';
import { resolve, dirname, join } from 'path';
import { existsSync, readFileSync } from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Database lib modules — look in project's memory-bank/database/lib first,
// then fall back to mb-cli's own templates (for development/testing)
function resolveDbLibBase() {
  const cwd = process.cwd();
  
  // Priority 1: Project's own memory-bank/database/lib (where mb init --database copies files)
  const projectLib = resolve(cwd, 'memory-bank/database/lib');
  if (existsSync(join(projectLib, 'sqlite.js'))) {
    return projectLib;
  }
  
  // Priority 2: mb-cli's bundled templates (for when running from mb-cli repo itself)
  const cliTemplateLib = resolve(__dirname, '../../templates/memory-bank/database/lib');
  if (existsSync(join(cliTemplateLib, 'sqlite.js'))) {
    return cliTemplateLib;
  }
  
  // Priority 3: Legacy path (mb-core repo structure)
  const legacyLib = resolve(__dirname, '../../../memory-bank/database/lib');
  if (existsSync(join(legacyLib, 'sqlite.js'))) {
    return legacyLib;
  }
  
  // Fallback — will fail later with a clear error
  return projectLib;
}

const DB_LIB_BASE = resolveDbLibBase();

async function loadDbModules() {
  const sqlite = await import(join(DB_LIB_BASE, 'sqlite.js'));
  const inserts = await import(join(DB_LIB_BASE, 'inserts.js'));
  const regenerate = await import(join(DB_LIB_BASE, 'regenerate.js'));
  const workflow = await import(join(DB_LIB_BASE, 'workflow.js'));
  return { sqlite, inserts, regenerate, workflow };
}

// ============================================================================
// FIND DB PATH
// ============================================================================

// ============================================================================
// QUERY COMMAND
// ============================================================================

async function queryCommand(sql, options) {
  if (!sql) {
    console.error('Error: SQL query required');
    console.log('Usage: mb db query "SELECT * FROM task_items"');
    process.exit(1);
  }

  const dbPath = findDbPath(options);
  if (!dbPath) {
    console.error('Error: No memory_bank.db found in current directory');
    console.log('Run `mb db init` first, or specify with --db <path>');
    process.exit(1);
  }

  try {
    const { sqlite } = await loadDbModules();
    await sqlite.openDb(dbPath);

    const rows = await sqlite.queryAll(sql);

    if (rows.length === 0) {
      console.log('No rows returned.');
      await sqlite.closeDb();
      return;
    }

    if (options.json) {
      // JSON output
      console.log(JSON.stringify(rows, null, 2));
    } else {
      // Table output
      console.log(`Database: ${dbPath}`);
      console.log(`Query: ${sql}`);
      console.log('');

      const keys = Object.keys(rows[0]);
      const widths = keys.map(k => Math.max(k.length, ...rows.map(r => String(r[k] ?? '').length)));

      // Header
      console.log(keys.map((k, i) => k.padEnd(widths[i])).join(' | '));
      console.log(widths.map(w => '-'.repeat(w)).join('-+-'));

      // Rows
      for (const row of rows) {
        console.log(keys.map((k, i) => String(row[k] ?? '').padEnd(widths[i])).join(' | '));
      }

      console.log(`\n${rows.length} row(s) returned`);
    }

    await sqlite.closeDb();
  } catch (err) {
    console.error(`Error: ${err.message}`);
    process.exit(1);
  }
}

// ============================================================================
// TEST COMMAND
// ============================================================================

async function testCommand(options) {
  const dbPath = findDbPath(options);

  console.log('Running Memory Bank Integration Tests...\n');

  if (dbPath) {
    console.log(`Using database: ${dbPath}`);
  } else {
    console.log('No existing database found — tests will use in-memory DB');
  }

  try {
    // The test script is in memory-bank/database/test-workflow.js
    const testScript = resolve(DB_LIB_BASE, '../test-workflow.js');

    if (!existsSync(testScript)) {
      console.error(`Error: test-workflow.js not found at ${testScript}`);
      process.exit(1);
    }

    // Run the test script as a child process
    const { spawn } = await import('child_process');

    return new Promise((resolve, reject) => {
      const child = spawn('node', [testScript], {
        cwd: resolve(DB_LIB_BASE, '..'),
        stdio: 'inherit'
      });

      child.on('close', (code) => {
        if (code === 0) {
          console.log('\n✅ All tests passed');
          resolve();
        } else {
          console.error(`\n❌ Tests failed with code ${code}`);
          process.exit(code);
        }
      });

      child.on('error', (err) => {
        console.error(`Failed to run tests: ${err.message}`);
        reject(err);
      });
    });
  } catch (err) {
    console.error(`Error: ${err.message}`);
    process.exit(1);
  }
}

// ============================================================================
// INIT COMMAND
// ============================================================================

async function initCommand(options) {
  const dbPath = options.db ? resolve(options.db) : resolve('memory_bank.db');

  console.log(`Initializing database: ${dbPath}`);

  try {
    const { sqlite } = await loadDbModules();
    await sqlite.createDatabase(dbPath);

    // Load and execute schema
    const schemaPath = resolve(DB_LIB_BASE, '../schema.sql');
    if (existsSync(schemaPath)) {
      const schema = readFileSync(schemaPath, 'utf-8');
      await sqlite.openDb(dbPath);
      await sqlite.exec(schema);
      await sqlite.saveDb();
      await sqlite.closeDb();
      console.log('✅ Schema initialized successfully');
    } else {
      console.warn('⚠️  schema.sql not found — database created but no schema applied');
    }

    console.log(`Database ready: ${dbPath}`);
  } catch (err) {
    console.error(`Error: ${err.message}`);
    process.exit(1);
  }
}

// ============================================================================
// WORKFLOW COMMAND
// Record session work and regenerate markdown files
// ============================================================================

async function workflowCommand(options) {
  const dbPath = findDbPath(options);
  if (!dbPath) {
    console.error('Error: No memory_bank.db found in current directory');
    console.log('Run `mb db init` first, or specify with --db <path>');
    process.exit(1);
  }

  // Validate required arguments
  if (!options.task || !options.description) {
    console.error('Error: --task and --description are required');
    console.log('\nUsage: mb db workflow --task T25 --description "Built CLI utilities" [options]');
    console.log('');
    console.log('Options:');
    console.log('  --task <id>         Task being worked on (e.g., T25)');
    console.log('  --description <txt> Brief description of work done');
    console.log('  --files <list>      Comma-separated file changes: action:path,action:path');
    console.log('                      Example: "Created:src/index.js,Modified:lib/util.js"');
    console.log('  --status <status>   New task status: in_progress, completed, paused');
    console.log('  --period <period>   Session period: morning, afternoon, evening, night (default: morning)');
    console.log('  --output <dir>      Directory to write markdown files (default: memory-bank/)');
    process.exit(1);
  }

  // Parse files
  const files_modified = [];
  if (options.files) {
    const fileEntries = options.files.split(',');
    for (const entry of fileEntries) {
      const [action, ...pathParts] = entry.split(':');
      if (action && pathParts.length > 0) {
        files_modified.push({
          action: action.trim(),
          path: pathParts.join(':').trim(),
          description: `${action.trim()} ${pathParts.join(':').trim()}`
        });
      }
    }
  }

  console.log(`Database: ${dbPath}`);
  console.log(`Task: ${options.task}`);
  console.log(`Description: ${options.description}`);
  if (files_modified.length > 0) {
    console.log(`Files modified: ${files_modified.length}`);
  }
  console.log('');

  try {
    const { workflow, sqlite } = await loadDbModules();

    // Open database before calling workflow
    await sqlite.openDb(dbPath);

    const result = await workflow.recordSessionWork({
      task_id: options.task,
      task_description: options.description,
      files_modified: files_modified.length > 0 ? files_modified : undefined,
      task_status: options.status || null,
      session_notes: '',
      session_period: options.period || 'morning',
      output_dir: options.output || null
    });

    await sqlite.closeDb();

    console.log('✅ Workflow completed successfully');
    console.log(`  Entry ID: ${result.entry_id}`);
    console.log(`  Session ID: ${result.session_id}`);
    console.log(`  Duration: ${result.duration_ms}ms`);
    console.log(`  Files regenerated: ${result.files_regenerated.join(', ')}`);
    return result;
  } catch (err) {
    console.error(`Error: ${err.message}`);
    process.exit(1);
  }
}

// ============================================================================
// WORKFLOW COMMAND (standalone export for top-level `mb workflow`)
// ============================================================================

export async function workflowCommandStandalone(options) {
  // Import findDbPath and loadDbModules locally since this is exported standalone
  const { resolve } = await import('path');
  const { existsSync } = await import('fs');
  
  function findDbPathLocal(opts) {
    if (opts.db) return resolve(opts.db);
    const candidates = [
      'memory_bank.db',
      'memory-bank/database/memory_bank.db',
      'database/memory_bank.db',
    ];
    for (const candidate of candidates) {
      const fullPath = resolve(candidate);
      if (existsSync(fullPath)) return fullPath;
    }
    return null;
  }

  const dbPath = findDbPathLocal(options);
  if (!dbPath) {
    console.error('Error: No memory_bank.db found in current directory');
    console.log('Run `mb db init` first, or specify with --db <path>');
    process.exit(1);
  }

  // Validate required arguments
  if (!options.task || !options.description) {
    console.error('Error: --task and --description are required');
    console.log('\nUsage: mb workflow --task T1 --description "Built CLI utilities" [options]');
    console.log('');
    console.log('Options:');
    console.log('  --task <id>         Task being worked on (e.g., T1)');
    console.log('  --description <txt> Brief description of work done');
    console.log('  --files <list>      Comma-separated file changes: action:path,action:path');
    console.log('                      Example: "Created:src/index.js,Modified:lib/util.js"');
    console.log('  --status <status>   New task status: in_progress, completed, paused');
    console.log('  --period <period>   Session period: morning, afternoon, evening, night (default: morning)');
    console.log('  --output <dir>      Directory to write markdown files (default: memory-bank/)');
    console.log('  --db <path>         Path to memory_bank.db');
    process.exit(1);
  }

  // Parse files
  const files_modified = [];
  if (options.files) {
    const fileEntries = options.files.split(',');
    for (const entry of fileEntries) {
      const [action, ...pathParts] = entry.split(':');
      if (action && pathParts.length > 0) {
        files_modified.push({
          action: action.trim(),
          path: pathParts.join(':').trim(),
          description: `${action.trim()} ${pathParts.join(':').trim()}`
        });
      }
    }
  }

  console.log(`Database: ${dbPath}`);
  console.log(`Task: ${options.task}`);
  console.log(`Description: ${options.description}`);
  if (files_modified.length > 0) {
    console.log(`Files modified: ${files_modified.length}`);
  }
  console.log('');

  try {
    const { workflow, sqlite } = await loadDbModules();

    // Open database before calling workflow
    await sqlite.openDb(dbPath);

    const result = await workflow.recordSessionWork({
      task_id: options.task,
      task_description: options.description,
      files_modified: files_modified.length > 0 ? files_modified : undefined,
      task_status: options.status || null,
      session_notes: '',
      session_period: options.period || 'morning',
      output_dir: options.output || null
    });

    await sqlite.closeDb();

    console.log('✅ Workflow completed successfully');
    console.log(`  Entry ID: ${result.entry_id}`);
    console.log(`  Session ID: ${result.session_id}`);
    console.log(`  Duration: ${result.duration_ms}ms`);
    console.log(`  Files regenerated: ${result.files_regenerated.join(', ')}`);
    return result;
  } catch (err) {
    console.error(`Error: ${err.message}`);
    process.exit(1);
  }
}

// ============================================================================
// DB COMMAND EXPORT
// ============================================================================

export function dbCommand(program) {
  const db = program
    .command('db')
    .description('Database operations for Memory Bank')
    .option('-d, --db <path>', 'Path to SQLite database (default: memory_bank.db)');

  db.command('query <sql>')
    .description('Execute SQL query against the database')
    .option('-j, --json', 'Output as JSON instead of table')
    .action(queryCommand);

  db.command('test')
    .description('Run integration test suite (test-workflow.js)')
    .action(testCommand);

  db.command('init')
    .description('Initialize database schema')
    .action(initCommand);

  db.command('workflow')
    .description('Record session work and regenerate markdown files')
    .requiredOption('--task <id>', 'Task being worked on (e.g., T25)')
    .requiredOption('--description <text>', 'Brief description of work done')
    .option('--files <list>', 'Comma-separated file changes: action:path,action:path')
    .option('--status <status>', 'New task status: in_progress, completed, paused')
    .option('--period <period>', 'Session period: morning, afternoon, evening, night', 'morning')
    .option('--output <dir>', 'Directory to write markdown files')
    .action(workflowCommand);

  return db;
}
