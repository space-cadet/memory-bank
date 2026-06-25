#!/usr/bin/env node

/**
 * mb session — Session management for Memory Bank
 *
 * Subcommands:
 *   start               Start a new session
 *   list                List all sessions
 *   show <id>           Show session details
 *   complete            Complete the current session
 *   cache               Show or update session cache
 */

import { resolve, dirname, join } from 'path';
import { existsSync, writeFileSync, mkdirSync, readFileSync, renameSync } from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const DB_LIB_BASE = resolve(__dirname, '../../../memory-bank/database/lib');

async function loadDbModules() {
  const sqlite = await import(join(DB_LIB_BASE, 'sqlite.js'));
  const inserts = await import(join(DB_LIB_BASE, 'inserts.js'));
  const regenerate = await import(join(DB_LIB_BASE, 'regenerate.js'));
  return { sqlite, inserts, regenerate };
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

function ensureDir(path) {
  if (!existsSync(path)) mkdirSync(path, { recursive: true });
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

function statusEmoji(status) {
  switch (status) {
    case 'active': case 'in_progress': return '🔄';
    case 'completed': return '✅';
    case 'paused': return '⏸️';
    default: return '⬜';
  }
}

// ============================================================================
// SESSION FILE GENERATION
// ============================================================================

function generateSessionMarkdown(session, taskTitle = null) {
  const now = getISTTimestamp();
  const session_date = session.session_date || todayDate();
  const session_period = session.session_period || 'morning';
  const focusTask = session.focus_task || 'None';
  const focusLine = focusTask !== 'None' && taskTitle
    ? `**${focusTask}**: ${taskTitle}`
    : `**${focusTask}**`;

  let md = `# Session ${session_date} ${session_period.charAt(0).toUpperCase() + session_period.slice(1)}\n\n`;
  md += `*Created: ${now}*\n`;
  md += `*Last Updated: ${now}*\n\n`;
  md += `## Focus Task\n${focusLine}\n\n`;
  md += `## Work Summary\n\n`;
  md += `_Add work summary here._\n\n`;
  md += `## Task Status Updates\n\n`;
  md += `| Task | Status | Notes |\n`;
  md += `|------|--------|-------|\n`;
  md += `| ${focusTask} | 🔄 In Progress | Session started |\n\n`;
  md += `## Decisions Made\n\n`;
  md += `- None yet\n\n`;
  md += `## Next Steps\n\n`;
  md += `- Continue work on ${focusTask}\n\n`;
  md += `## Notes\n\n`;
  md += `_Add session notes here._\n`;
  return md;
}

// ============================================================================
// START COMMAND
// ============================================================================

async function startCommand(options) {
  const dbPath = findDbPath(options);
  if (!dbPath) {
    console.error('Error: No memory_bank.db found. Run `mb db init` first.');
    process.exit(1);
  }

  const today = todayDate();
  const period = options.period || 'morning';
  const focus = options.focus || null;
  const sessionId = `${today}-${period}`;

  console.log(`Starting session ${sessionId}`);
  if (focus) console.log(`  Focus: ${focus}`);

  try {
    const { sqlite, inserts, regenerate } = await loadDbModules();
    await sqlite.openDb(dbPath);

    // Check for existing session with same ID
    const existing = await sqlite.queryGet(
      `SELECT * FROM sessions WHERE id = ?`,
      [sessionId]
    );

    if (existing && !options.force) {
      await sqlite.closeDb();
      console.error(`Error: Session ${sessionId} already exists. Use --force to override.`);
      process.exit(1);
    }

    if (existing && options.force) {
      // Delete existing session
      await sqlite.execRun(`DELETE FROM sessions WHERE id = ?`, [sessionId]);
    }

    // Create session in DB
    await inserts.createSession({
      id: sessionId,
      session_date: today,
      session_period: period,
      focus_task,
      status: 'active',
      content: ''
    });

    // Get task title if focus specified
    let taskTitle = null;
    if (focus_task) {
      const task = await sqlite.queryGet(
        `SELECT title FROM task_items WHERE id = ?`, [focus_task]
      );
      taskTitle = task?.title || null;
    }

    // Generate session file
    const mbDir = getMbDir(dbPath);
    const sessionsDir = resolve(mbDir, 'sessions');
    ensureDir(sessionsDir);
    const sessionPath = resolve(sessionsDir, `${sessionId}.md`);

    const sessionData = { session_date: today, session_period: period, focus_task };
    const md = generateSessionMarkdown(sessionData, taskTitle);
    writeFileSync(sessionPath, md, 'utf-8');

    // Update session cache
    const taskCounts = await sqlite.queryGet(
      `SELECT
        SUM(CASE WHEN status = 'in_progress' THEN 1 ELSE 0 END) as active,
        SUM(CASE WHEN status = 'paused' THEN 1 ELSE 0 END) as paused,
        SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed
      FROM task_items`
    );

    await inserts.updateSessionCache({
      current_session_id: sessionId,
      current_focus_task: focus_task,
      active_count: taskCounts?.active || 0,
      paused_count: taskCounts?.paused || 0,
      completed_count: taskCounts?.completed || 0
    });

    // Regenerate session_cache.md
    await regenerate.regenerateSessionCache(resolve(mbDir, 'session_cache.md'));

    await sqlite.saveDb();
    await sqlite.closeDb();

    console.log(`✅ Session ${sessionId} started`);
    console.log(`   File: ${sessionPath}`);
  } catch (err) {
    console.error(`Error: ${err.message}`);
    process.exit(1);
  }
}

// ============================================================================
// LIST COMMAND
// ============================================================================

async function listCommand(options) {
  const dbPath = findDbPath(options);
  if (!dbPath) {
    console.error('Error: No memory_bank.db found.');
    process.exit(1);
  }

  try {
    const { sqlite } = await loadDbModules();
    await sqlite.openDb(dbPath);

    let sql = `SELECT id, session_date, session_period, status, focus_task FROM sessions`;
    const params = [];

    if (options.status) {
      sql += ` WHERE status = ?`;
      params.push(options.status);
    }

    sql += ` ORDER BY session_date DESC, session_period DESC`;

    const sessions = await sqlite.queryAll(sql, params);
    await sqlite.closeDb();

    if (sessions.length === 0) {
      console.log('No sessions found.');
      return;
    }

    if (options.json) {
      console.log(JSON.stringify(sessions, null, 2));
      return;
    }

    const headers = ['ID', 'Date', 'Period', 'Status', 'Focus'];
    const rows = sessions.map(s => [
      s.id,
      s.session_date,
      s.session_period,
      statusEmoji(s.status),
      s.focus_task || '-'
    ]);

    const widths = headers.map((h, i) =>
      Math.max(h.length, ...rows.map(r => String(r[i]).length))
    );

    console.log(headers.map((h, i) => h.padEnd(widths[i])).join(' | '));
    console.log(widths.map(w => '-'.repeat(w)).join('-+-'));
    for (const row of rows) {
      console.log(row.map((cell, i) => String(cell).padEnd(widths[i])).join(' | '));
    }

    console.log(`\n${sessions.length} session(s)`);
  } catch (err) {
    console.error(`Error: ${err.message}`);
    process.exit(1);
  }
}

// ============================================================================
// SHOW COMMAND
// ============================================================================

async function showCommand(sessionId, options) {
  if (!sessionId) {
    console.error('Error: Session ID required (e.g., 2026-05-12-morning)');
    process.exit(1);
  }

  const dbPath = findDbPath(options);
  if (!dbPath) {
    console.error('Error: No memory_bank.db found.');
    process.exit(1);
  }

  try {
    const { sqlite } = await loadDbModules();
    await sqlite.openDb(dbPath);

    const session = await sqlite.queryGet(
      `SELECT * FROM sessions WHERE id = ?`,
      [sessionId]
    );

    if (!session) {
      await sqlite.closeDb();
      console.error(`Error: Session ${sessionId} not found`);
      process.exit(1);
    }

    await sqlite.closeDb();

    // Try to read session file
    const mbDir = getMbDir(dbPath);
    const sessionFilePath = resolve(mbDir, 'sessions', `${sessionId}.md`);
    let fileContent = null;
    if (existsSync(sessionFilePath)) {
      fileContent = readFileSync(sessionFilePath, 'utf-8');
    }

    if (options.json) {
      console.log(JSON.stringify({ session, fileExists: !!fileContent }, null, 2));
      return;
    }

    console.log(`Session ${sessionId}`);
    console.log('='.repeat(50));
    console.log(`Date:    ${session.session_date}`);
    console.log(`Period:  ${session.session_period}`);
    console.log(`Status:  ${statusEmoji(session.status)} ${session.status}`);
    console.log(`Focus:   ${session.focus_task || 'None'}`);
    if (session.content) {
      console.log(`\nContent preview:`);
      console.log(session.content.slice(0, 200) + (session.content.length > 200 ? '...' : ''));
    }

    if (fileContent) {
      console.log(`\nSession file: ${sessionFilePath}`);
    } else {
      console.log(`\n⚠️  No session file at ${sessionFilePath}`);
    }
  } catch (err) {
    console.error(`Error: ${err.message}`);
    process.exit(1);
  }
}

// ============================================================================
// COMPLETE COMMAND
// ============================================================================

async function completeCommand(options) {
  const dbPath = findDbPath(options);
  if (!dbPath) {
    console.error('Error: No memory_bank.db found.');
    process.exit(1);
  }

  try {
    const { sqlite, inserts, regenerate } = await loadDbModules();
    await sqlite.openDb(dbPath);

    // Find most recent active session
    const session = await sqlite.queryGet(
      `SELECT * FROM sessions WHERE status = 'active' ORDER BY date DESC, period DESC LIMIT 1`
    );

    if (!session) {
      await sqlite.closeDb();
      console.error('Error: No active session found. Start one with `mb session start`.');
      process.exit(1);
    }

    // Complete the session
    await inserts.completeSession(session.id, options.notes);

    // Update session cache to clear current session
    await inserts.updateSessionCache({
      current_session_id: null,
      current_focus_task: null,
      active_tasks_count: 0,
      paused_tasks_count: 0,
      completed_tasks_count: 0
    });

    // Regenerate session_cache.md
    const mbDir = getMbDir(dbPath);
    await regenerate.regenerateSessionCache(resolve(mbDir, 'session_cache.md'));

    await sqlite.saveDb();
    await sqlite.closeDb();

    console.log(`✅ Session ${session.id} completed`);
    if (options.notes) console.log(`   Notes: ${options.notes}`);
  } catch (err) {
    console.error(`Error: ${err.message}`);
    process.exit(1);
  }
}

// ============================================================================
// CACHE COMMAND
// ============================================================================

async function cacheCommand(options) {
  const dbPath = findDbPath(options);
  if (!dbPath) {
    console.error('Error: No memory_bank.db found.');
    process.exit(1);
  }

  try {
    const { sqlite, inserts, regenerate } = await loadDbModules();
    await sqlite.openDb(dbPath);

    const mbDir = getMbDir(dbPath);

    // If setting values
    if (options.focus || options.status) {
      const cache = await sqlite.queryGet(
        `SELECT * FROM session_cache WHERE session_id = 'current'`
      );

      const updates = {
        current_session_id: cache?.current_session_id || null,
        current_focus_task: options.focus || cache?.focus_task || null,
        active_tasks_count: cache?.active_tasks_count || 0,
        paused_tasks_count: cache?.paused_tasks_count || 0,
        completed_tasks_count: cache?.completed_tasks_count || 0
      };

      await inserts.updateSessionCache(updates);
      await regenerate.regenerateSessionCache(resolve(mbDir, 'session_cache.md'));

      await sqlite.saveDb();
      await sqlite.closeDb();

      console.log('✅ Session cache updated');
      if (options.focus) console.log(`   Focus: ${options.focus}`);
      return;
    }

    // Show cache
    const cache = await sqlite.queryGet(
      `SELECT * FROM session_cache WHERE session_id = 'current'`
    );

    await sqlite.closeDb();

    if (!cache) {
      console.log('No session cache found. Run `mb session start` to initialize.');
      return;
    }

    if (options.json) {
      console.log(JSON.stringify(cache, null, 2));
      return;
    }

    console.log('Session Cache');
    console.log('='.repeat(40));
    console.log(`Status:        ${cache.status || 'unknown'}`);
    console.log(`Focus Task:    ${cache.focus_task || 'None'}`);
    console.log(`Active:        ${cache.active_tasks_count || 0}`);
    console.log(`Paused:        ${cache.paused_tasks_count || 0}`);
    console.log(`Completed:     ${cache.completed_tasks_count || 0}`);
    if (cache.raw_content) {
      console.log(`\nRaw: ${cache.raw_content.slice(0, 100)}`);
    }
  } catch (err) {
    console.error(`Error: ${err.message}`);
    process.exit(1);
  }
}

// ============================================================================
// SESSION COMMAND EXPORT
// ============================================================================

export function sessionCommand(program) {
  const session = program
    .command('session')
    .description('Session management for Memory Bank');

  session.command('start')
    .description('Start a new work session')
    .option('-d, --db <path>', 'Path to SQLite database')
    .option('-f, --focus <task>', 'Focus task ID (e.g., T25)')
    .option('-p, --period <period>', 'Session period: morning, afternoon, evening, night', 'morning')
    .option('--force', 'Override existing session with same ID')
    .action(startCommand);

  session.command('list')
    .description('List all sessions')
    .option('-d, --db <path>', 'Path to SQLite database')
    .option('--status <status>', 'Filter by status')
    .option('-j, --json', 'Output as JSON')
    .action(listCommand);

  session.command('show <id>')
    .description('Show session details')
    .option('-d, --db <path>', 'Path to SQLite database')
    .option('-j, --json', 'Output as JSON')
    .action(showCommand);

  session.command('complete')
    .description('Complete the current active session')
    .option('-d, --db <path>', 'Path to SQLite database')
    .option('--notes <text>', 'Completion notes')
    .action(completeCommand);

  session.command('cache')
    .description('Show or update session cache')
    .option('-d, --db <path>', 'Path to SQLite database')
    .option('--focus <task>', 'Set focus task')
    .option('--status <status>', 'Set status')
    .option('-j, --json', 'Output as JSON')
    .action(cacheCommand);

  return session;
}
