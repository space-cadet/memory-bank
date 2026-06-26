#!/usr/bin/env node

/**
 * mb db — Database operations for Memory Bank
 *
 * Subcommands:
 *   query <sql>       Run SQL query against memory_bank.db
 *   test              Run integration test suite
 *   workflow          Record session work and/or regenerate files
 *   init              Initialize database schema
 */

import { Command } from 'commander';
import { resolve, dirname, join } from 'path';
import { existsSync, readFileSync } from 'fs';
import { copyFile, mkdir } from 'fs/promises';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const DB_TEMPLATE_ROOT = resolve(__dirname, '../../templates/memory-bank/database');

const SYNC_GROUPS = {
  database: [
    'package.json',
    'pnpm-workspace.yaml',
    'README.md',
    'schema.sql'
  ],
  parsers: [
    'parse-edits.js',
    'parse-tasks.js',
    'parse-sessions.js',
    'parse-session-cache.js',
    'run-all.sh',
    'query.js',
    'query-tasks.js',
    'test-workflow.js'
  ],
  libs: [
    'lib/sqlite.js',
    'lib/inserts.js',
    'lib/regenerate.js',
    'lib/workflow.js'
  ],
  viewer: [
    'server.js',
    'schema.sql',
    'init-schema.js',
    'test-schema.js',
    'generate-test-data.js',
    'public/index.html',
    'public/js/app.js',
    'public/js/router.js',
    'public/js/api.js',
    'public/js/ui.js',
    'public/js/setup.js',
    'public/css/style.css'
  ]
};

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

function findDbPath(options = {}) {
  if (options.db) return resolve(options.db);

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

function getMemoryBankRoot(options = {}) {
  if (options.root) return resolve(options.root);

  const dbPath = findDbPath(options);
  if (dbPath) {
    const dbDir = dirname(dbPath);
    if (dbDir.endsWith('/memory-bank/database') || dbDir.endsWith('\\memory-bank\\database')) {
      return dirname(dbDir);
    }
    if (dbDir.endsWith('/database') || dbDir.endsWith('\\database')) {
      return dirname(dbDir);
    }
  }

  return resolve('memory-bank');
}

function selectedSyncGroups(options = {}) {
  if (options.all) return ['database', 'parsers', 'libs', 'viewer'];

  const groups = [];
  if (options.databaseFiles) groups.push('database');
  if (options.parsers) groups.push('parsers');
  if (options.libs) groups.push('libs');
  if (options.viewer) groups.push('viewer');

  return groups.length > 0 ? groups : ['libs'];
}

async function syncGeneratedDatabaseFiles(options) {
  const mbRoot = getMemoryBankRoot(options);
  const dbRoot = join(mbRoot, 'database');
  const groups = selectedSyncGroups(options);

  if (!existsSync(dbRoot)) {
    console.error(`Error: Database directory not found at ${dbRoot}`);
    console.log('Run `mb init --database` first, or specify --root <memory-bank-dir>.');
    process.exit(1);
  }

  console.log(`Syncing generated database files in: ${dbRoot}`);
  console.log(`Groups: ${groups.join(', ')}`);

  let copied = 0;
  for (const group of groups) {
    console.log(`\n${group}:`);
    for (const relativePath of SYNC_GROUPS[group]) {
      const sourcePath = join(DB_TEMPLATE_ROOT, relativePath);
      const targetPath = join(dbRoot, relativePath);

      if (!existsSync(sourcePath)) {
        console.warn(`  ⚠️  Missing template source: ${relativePath}`);
        continue;
      }

      console.log(`  ↻ ${relativePath}`);
      if (!options.dryRun) {
        await mkdir(dirname(targetPath), { recursive: true });
        await copyFile(sourcePath, targetPath);
      }
      copied += 1;
    }
  }

  if (options.dryRun) {
    console.log(`\nDRY RUN: ${copied} file(s) would be synced.`);
  } else {
    console.log(`\n✅ Synced ${copied} file(s).`);
  }
}

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

async function syncCommand(options) {
  try {
    await syncGeneratedDatabaseFiles(options);
  } catch (err) {
    console.error(`Error: ${err.message}`);
    process.exit(1);
  }
}

// ============================================================================
// WORKFLOW COMMAND
// Record session work and/or regenerate markdown files
// ============================================================================

async function workflowCommand(options) {
  const dbPath = findDbPath(options);
  if (!dbPath) {
    console.error('Error: No memory_bank.db found in current directory');
    console.log('Run `mb db init` first, or specify with --db <path>');
    process.exit(1);
  }

  const shouldRecord = options.record || (!options.record && !options.regenerate);
  const shouldRegenerate = Boolean(options.regenerate);

  if (!shouldRecord && !shouldRegenerate) {
    console.error('Error: choose at least one action with --record or --regenerate');
    process.exit(1);
  }

  // Validate required arguments for recording
  if (shouldRecord && (!options.task || !options.description)) {
    console.error('Error: --task and --description are required when using --record');
    console.log('\nUsage: mb db workflow --record --task T25 --description "Built CLI utilities" [options]');
    console.log('');
    console.log('Options:');
    console.log('  --record            Record work into the database (default if no action flag is given)');
    console.log('  --regenerate        Rewrite markdown files from the current database state');
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
  console.log(`Actions: ${[shouldRecord ? 'record' : null, shouldRegenerate ? 'regenerate' : null].filter(Boolean).join(', ')}`);
  if (shouldRecord) {
    console.log(`Task: ${options.task}`);
    console.log(`Description: ${options.description}`);
  }
  if (shouldRecord && files_modified.length > 0) {
    console.log(`Files modified: ${files_modified.length}`);
  }
  console.log('');

  try {
    const { workflow, sqlite } = await loadDbModules();

    // Open database before calling workflow
    await sqlite.openDb(dbPath);

    let result = {
      entry_id: null,
      session_id: null,
      duration_ms: 0,
      transaction_id: null,
      files_regenerated: []
    };

    if (shouldRecord) {
      result = await workflow.recordSessionWork({
        task_id: options.task,
        task_description: options.description,
        files_modified: files_modified.length > 0 ? files_modified : undefined,
        task_status: options.status || null,
        session_notes: '',
        period: options.period || 'morning',
        output_dir: options.output || null,
        regenerate_markdown: shouldRegenerate
      });
    } else {
      const regenerated = await workflow.regenerateMarkdownState({
        output_dir: options.output || 'memory-bank'
      });
      result.files_regenerated = Object.keys(regenerated).filter(k => regenerated[k]);
    }

    await sqlite.closeDb();

    console.log('✅ Workflow completed successfully');
    if (result.entry_id !== null) console.log(`  Entry ID: ${result.entry_id}`);
    if (result.session_id !== null) console.log(`  Session ID: ${result.session_id}`);
    if (result.duration_ms) console.log(`  Duration: ${result.duration_ms}ms`);
    console.log(`  Files regenerated: ${result.files_regenerated.length > 0 ? result.files_regenerated.join(', ') : '(none)'}`);
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

  const shouldRecord = options.record || (!options.record && !options.regenerate);
  const shouldRegenerate = Boolean(options.regenerate);

  if (!shouldRecord && !shouldRegenerate) {
    console.error('Error: choose at least one action with --record or --regenerate');
    process.exit(1);
  }

  // Validate required arguments
  if (shouldRecord && (!options.task || !options.description)) {
    console.error('Error: --task and --description are required when using --record');
    console.log('\nUsage: mb workflow --record --task T1 --description "Built CLI utilities" [options]');
    console.log('');
    console.log('Options:');
    console.log('  --record            Record work into the database (default if no action flag is given)');
    console.log('  --regenerate        Rewrite markdown files from the current database state');
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
  console.log(`Actions: ${[shouldRecord ? 'record' : null, shouldRegenerate ? 'regenerate' : null].filter(Boolean).join(', ')}`);
  if (shouldRecord) {
    console.log(`Task: ${options.task}`);
    console.log(`Description: ${options.description}`);
  }
  if (shouldRecord && files_modified.length > 0) {
    console.log(`Files modified: ${files_modified.length}`);
  }
  console.log('');

  try {
    const { workflow, sqlite } = await loadDbModules();

    // Open database before calling workflow
    await sqlite.openDb(dbPath);

    let result = {
      entry_id: null,
      session_id: null,
      duration_ms: 0,
      transaction_id: null,
      files_regenerated: []
    };

    if (shouldRecord) {
      result = await workflow.recordSessionWork({
        task_id: options.task,
        task_description: options.description,
        files_modified: files_modified.length > 0 ? files_modified : undefined,
        task_status: options.status || null,
        session_notes: '',
        period: options.period || 'morning',
        output_dir: options.output || null,
        regenerate_markdown: shouldRegenerate
      });
    } else {
      const regenerated = await workflow.regenerateMarkdownState({
        output_dir: options.output || 'memory-bank'
      });
      result.files_regenerated = Object.keys(regenerated).filter(k => regenerated[k]);
    }

    await sqlite.closeDb();

    console.log('✅ Workflow completed successfully');
    if (result.entry_id !== null) console.log(`  Entry ID: ${result.entry_id}`);
    if (result.session_id !== null) console.log(`  Session ID: ${result.session_id}`);
    if (result.duration_ms) console.log(`  Duration: ${result.duration_ms}ms`);
    console.log(`  Files regenerated: ${result.files_regenerated.length > 0 ? result.files_regenerated.join(', ') : '(none)'}`);
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

  db.command('sync')
    .description('Sync generated database/template files into an existing project')
    .option('--root <path>', 'Path to the memory-bank directory (defaults to inferred project memory-bank/)')
    .option('--libs', 'Sync workflow/runtime library files')
    .option('--parsers', 'Sync parser scripts and query tools')
    .option('--database-files', 'Sync database root files such as schema.sql and package metadata')
    .option('--viewer', 'Sync viewer server and UI files')
    .option('--all', 'Sync all generated database-related files')
    .option('--dry-run', 'Preview files that would be synced')
    .action(syncCommand);

  db.command('workflow')
    .description('Record session work and/or regenerate markdown files')
    .option('--record', 'Record work into the database (default if no action flag is given)')
    .option('--regenerate', 'Rewrite markdown files from the current database state')
    .option('--task <id>', 'Task being worked on (required with --record)')
    .option('--description <text>', 'Brief description of work done (required with --record)')
    .option('--files <list>', 'Comma-separated file changes: action:path,action:path')
    .option('--status <status>', 'New task status: in_progress, completed, paused')
    .option('--period <period>', 'Session period: morning, afternoon, evening, night', 'morning')
    .option('--output <dir>', 'Directory to write markdown files')
    .action(workflowCommand);

  return db;
}
