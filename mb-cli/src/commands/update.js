#!/usr/bin/env node

/**
 * mb update — Memory Bank Update Protocol
 *
 * High-level command that records work, updates tasks, and regenerates
 * all canonical markdown files from the database.
 *
 * This is the CLI equivalent of the $mem-update workflow.
 */

import { resolve, dirname, join } from 'path';
import { existsSync, writeFileSync, mkdirSync } from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const DB_LIB_BASE = resolve(__dirname, '../../../memory-bank/database/lib');

async function loadDbModules() {
  const sqlite = await import(join(DB_LIB_BASE, 'sqlite.js'));
  const inserts = await import(join(DB_LIB_BASE, 'inserts.js'));
  const regenerate = await import(join(DB_LIB_BASE, 'regenerate.js'));
  const workflow = await import(join(DB_LIB_BASE, 'workflow.js'));
  return { sqlite, inserts, regenerate, workflow };
}

function findDbPath(options) {
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

function getMbDir(dbPath) {
  if (!dbPath) return resolve('memory-bank');
  const dbDir = dirname(dbPath);
  if (dbDir.endsWith('/database') || dbDir.endsWith('\\database')) {
    return dirname(dbDir);
  }
  return dbDir;
}

function getISTTimestamp() {
  const now = new Date();
  const ist = now.toLocaleString('en-GB', { timeZone: 'Asia/Kolkata', hour12: false });
  const [datePart, timePart] = ist.split(', ');
  const [day, month, year] = datePart.split('/');
  return `${year}-${month}-${day} ${timePart} IST`;
}

function todayDate() {
  return new Date().toISOString().slice(0, 10);
}

// ============================================================================
// UPDATE COMMAND
// ============================================================================

async function updateCommand(options) {
  const dbPath = findDbPath(options);
  if (!dbPath) {
    console.error('Error: No memory_bank.db found. Run `mb db init` first.');
    process.exit(1);
  }

  console.log('Memory Bank Update Protocol');
  console.log('='.repeat(40));

  const taskId = options.task || null;
  const description = options.description || 'Memory bank update';
  const files = options.files || null;
  const completeSession = options.complete || false;

  if (taskId) console.log(`Task: ${taskId}`);
  console.log(`Description: ${description}`);

  try {
    const { sqlite, inserts, regenerate, workflow } = await loadDbModules();
    await sqlite.openDb(dbPath);

    const mbDir = getMbDir(dbPath);

    // 1. Record edit entry if task/description provided
    if (taskId || files) {
      const files_modified = [];
      if (files) {
        const fileEntries = files.split(',');
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

      console.log('  Recording edit entry...');
      const result = await workflow.recordSessionWork({
        task_id: taskId,
        task_description: description,
        files_modified,
        task_status: options.status || null,
        session_notes: options.note || null,
        output_dir: mbDir
      });
      console.log(`  ✅ Edit entry recorded (tx: ${result.transaction_id})`);
    } else {
      console.log('ℹ️  No task or files specified — skipping edit entry');
    }

    // 2. Update task status if requested (and not already done by workflow)
    if (taskId && options.status && !files) {
      await inserts.updateTaskStatus(taskId, options.status, options.note || null);
      console.log(`✅ Task ${taskId} → ${options.status}`);
    }

    // 3. Regenerate all markdown files
    console.log('Regenerating markdown files...');

    await regenerate.regenerateEditHistory(resolve(mbDir, 'edit_history.md'));
    console.log('  edit_history.md');

    await regenerate.regenerateTasks(resolve(mbDir, 'tasks.md'));
    console.log('  tasks.md');

    await regenerate.regenerateSessionCache(resolve(mbDir, 'session_cache.md'));
    console.log('  session_cache.md');

    // 4. Complete session if requested
    if (completeSession) {
      const activeSession = await sqlite.queryGet(
        `SELECT * FROM sessions WHERE status = 'active' ORDER BY date DESC, period DESC LIMIT 1`
      );
      if (activeSession) {
        await inserts.completeSession(activeSession.id, options.note || description);
        console.log(`✅ Session ${activeSession.id} completed`);
      } else {
        console.log('ℹ️  No active session to complete');
      }
    }

    await sqlite.saveDb();
    await sqlite.closeDb();

    console.log('\n✅ Memory Bank update complete');
    console.log(`   Location: ${mbDir}`);
  } catch (err) {
    console.error(`Error: ${err.message}`);
    console.error(err.stack);
    process.exit(1);
  }
}

// ============================================================================
// UPDATE COMMAND EXPORT
// ============================================================================

export function updateCommandExport(program) {
  program
    .command('update')
    .description('Memory Bank Update Protocol — record work and regenerate files')
    .option('-d, --db <path>', 'Path to SQLite database')
    .option('-t, --task <taskId>', 'Task being worked on (e.g., T13)')
    .option('--description <text>', 'Description of work done', 'Memory bank update')
    .option('-f, --files <list>', 'File modifications: "Created:path,Modified:path2"')
    .option('-s, --status <status>', 'Update task status: pending|in_progress|paused|completed')
    .option('--note <text>', 'Note to append (for status update or session completion)')
    .option('--complete', 'Complete the current active session after update')
    .action(updateCommand);
}
