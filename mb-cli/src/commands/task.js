#!/usr/bin/env node

/**
 * mb task — Task management for Memory Bank
 *
 * Subcommands:
 *   create <title>      Create a new task
 *   list                List all tasks
 *   show <id>           Show task details
 *   update <id>         Update task properties
 *   delete <id>         Delete a task
 */

import { Command } from 'commander';
import { resolve, dirname, join } from 'path';
import { existsSync, writeFileSync, mkdirSync, readFileSync, renameSync } from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Database lib modules (relative from mb-cli/src/commands/ to repo root)
const DB_LIB_BASE = resolve(__dirname, '../../../memory-bank/database/lib');
function getMbDir(dbPath) {
  if (!dbPath) return resolve('memory-bank');
  // If DB is at memory-bank/database/memory_bank.db, MB dir is the parent of database/
  const dbDir = dirname(dbPath);
  if (dbDir.endsWith('/database') || dbDir.endsWith('\\database')) {
    return dirname(dbDir);
  }
  // Otherwise assume DB is directly in memory-bank/
  return dbDir;
}

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

function statusEmoji(status) {
  switch (status) {
    case 'in_progress': return '🔄';
    case 'completed': return '✅';
    case 'paused': return '⏸️';
    case 'pending': return '⬜';
    default: return '⬜';
  }
}

function ensureDir(path) {
  if (!existsSync(path)) {
    mkdirSync(path, { recursive: true });
  }
}

function getISTTimestamp() {
  const now = new Date();
  const ist = now.toLocaleString('en-GB', { timeZone: 'Asia/Kolkata', hour12: false });
  const [datePart, timePart] = ist.split(', ');
  const [day, month, year] = datePart.split('/');
  return `${year}-${month}-${day} ${timePart} IST`;
}

// ============================================================================
// TASK FILE GENERATION
// ============================================================================

function generateTaskMarkdown(task, subtasks = [], deps = []) {
  const now = getISTTimestamp();
  const statusText = task.status === 'in_progress' ? '🔄 In Progress' :
                     task.status === 'completed' ? '✅ Completed' :
                     task.status === 'paused' ? '⏸️ Paused' : '⬜ Pending';

  let md = `# ${task.id}: ${task.title}\n\n`;
  md += `*Created: ${now}*\n`;
  md += `*Last Updated: ${now}*\n\n`;
  md += `**Description**: ${task.details || task.title}\n\n`;
  md += `**Status**: ${statusText}\n`;
  md += `**Priority**: ${task.priority.toUpperCase()}\n`;
  md += `**Started**: ${task.started || now.split(' ')[0]}\n`;
  if (task.status === 'completed' && task.last_updated) {
    md += `**Completed**: ${task.last_updated.slice(0, 10)}\n`;
  }
  md += `**Dependencies**: ${deps.length > 0 ? deps.join(', ') : 'None'}\n\n`;

  md += `## Completion Criteria\n\n`;
  md += `- [ ] Define completion criteria\n\n`;

  if (subtasks.length > 0) {
    md += `## Progress\n\n`;
    for (const st of subtasks) {
      const check = st.checked ? 'x' : ' ';
      md += `- [${check}] ${st.text}\n`;
    }
    md += `\n`;
  }

  md += `## Related Files\n\n`;
  md += `- tasks/${task.id}.md\n\n`;

  md += `## Context\n\n`;
  md += `Task created via \`mb task create\`.\n\n`;

  md += `## Notes\n\n`;
  md += `_Add session notes here as work progresses._\n`;

  return md;
}

// ============================================================================
// CREATE COMMAND
// ============================================================================

async function createCommand(title, options) {
  if (!title) {
    console.error('Error: Task title required');
    console.log('Usage: mb task create "Build quantum simulator" --id T26 --priority high');
    process.exit(1);
  }

  const dbPath = findDbPath(options);
  if (!dbPath) {
    console.error('Error: No memory_bank.db found. Run `mb db init` first.');
    process.exit(1);
  }

  // Auto-generate ID if not provided
  let taskId = options.id;
  if (!taskId) {
    // Query for highest task number (extract numeric part, sort numerically)
    const { sqlite } = await loadDbModules();
    await sqlite.openDb(dbPath);
    const rows = await sqlite.queryAll(
      `SELECT id FROM task_items WHERE id GLOB 'T[0-9]*' ORDER BY CAST(substr(id, 2) AS INTEGER) DESC LIMIT 1`
    );
    await sqlite.closeDb();

    let nextNum = 1;
    if (rows.length > 0) {
      const match = rows[0].id.match(/T(\d+)/);
      if (match) nextNum = parseInt(match[1]) + 1;
    }
    taskId = `T${nextNum}`;
  }

  const today = new Date().toISOString().slice(0, 10);
  const priority = options.priority || 'medium';
  const status = options.status || 'pending';
  const details = options.description || title;

  console.log(`Creating task ${taskId}: ${title}`);
  console.log(`  Priority: ${priority}`);
  console.log(`  Status: ${status}`);

  try {
    const { sqlite, inserts, regenerate } = await loadDbModules();
    await sqlite.openDb(dbPath);

    const mbDir = getMbDir(dbPath);
    const tasksDir = resolve(mbDir, 'tasks');

    // Insert into DB
    await inserts.upsertTask({
      id: taskId,
      title,
      status,
      priority,
      started: today,
      details
    });

    // Handle subtasks if provided
    if (options.subtasks) {
      const subtaskList = options.subtasks.split(',').map((s, i) => ({
        section: null,
        text: s.trim(),
        checked: false
      }));
      await inserts.addTaskSubtasks(taskId, subtaskList);
    }

    // Handle dependencies
    if (options.depends) {
      const depList = options.depends.split(',').map(d => d.trim());
      for (const dep of depList) {
        await inserts.addTaskDependency(taskId, dep);
      }
    }

    // Generate task markdown file
    ensureDir(tasksDir);
    const taskPath = resolve(tasksDir, `${taskId}.md`);

    const subtasks = options.subtasks
      ? options.subtasks.split(',').map(s => ({ text: s.trim(), checked: false }))
      : [];
    const deps = options.depends ? options.depends.split(',').map(d => d.trim()) : [];

    const taskData = {
      id: taskId,
      title,
      status,
      priority,
      started: today,
      last_updated: new Date().toISOString(),
      details
    };

    const md = generateTaskMarkdown(taskData, subtasks, deps);
    writeFileSync(taskPath, md, 'utf-8');

    // Regenerate tasks.md
    await regenerate.regenerateTasks(resolve(mbDir, 'tasks.md'));

    // Save DB
    await sqlite.saveDb();
    await sqlite.closeDb();

    console.log(`✅ Task ${taskId} created`);
    console.log(`   File: ${taskPath}`);
    console.log(`   Registry: memory-bank/tasks.md`);
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
    console.error('Error: No memory_bank.db found. Run `mb db init` first.');
    process.exit(1);
  }

  try {
    const { sqlite } = await loadDbModules();
    await sqlite.openDb(dbPath);

    let sql = `SELECT id, title, status, priority, started, last_updated FROM task_items`;
    const params = [];

    if (options.status) {
      sql += ` WHERE status = ?`;
      params.push(options.status);
    }

    sql += ` ORDER BY id`;

    const tasks = await sqlite.queryAll(sql, params);
    await sqlite.closeDb();

    if (tasks.length === 0) {
      console.log('No tasks found.');
      return;
    }

    if (options.json) {
      console.log(JSON.stringify(tasks, null, 2));
      return;
    }

    // Table output
    const headers = ['ID', 'Title', 'Status', 'Priority', 'Started'];
    const rows = tasks.map(t => [
      t.id,
      t.title.length > 40 ? t.title.slice(0, 37) + '...' : t.title,
      statusEmoji(t.status),
      t.priority.toUpperCase(),
      t.started
    ]);

    const widths = headers.map((h, i) =>
      Math.max(h.length, ...rows.map(r => String(r[i]).length))
    );

    console.log(headers.map((h, i) => h.padEnd(widths[i])).join(' | '));
    console.log(widths.map(w => '-'.repeat(w)).join('-+-'));
    for (const row of rows) {
      console.log(row.map((cell, i) => String(cell).padEnd(widths[i])).join(' | '));
    }

    console.log(`\n${tasks.length} task(s)`);

    // Summary
    const counts = { in_progress: 0, completed: 0, paused: 0, pending: 0 };
    for (const t of tasks) {
      if (counts[t.status] !== undefined) counts[t.status]++;
    }
    console.log(`  🔄 ${counts.in_progress}  ✅ ${counts.completed}  ⏸️ ${counts.paused}  ⬜ ${counts.pending}`);
  } catch (err) {
    console.error(`Error: ${err.message}`);
    process.exit(1);
  }
}

// ============================================================================
// SHOW COMMAND
// ============================================================================

async function showCommand(taskId, options) {
  if (!taskId) {
    console.error('Error: Task ID required');
    console.log('Usage: mb task show T25');
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

    const task = await sqlite.queryGet(
      `SELECT * FROM task_items WHERE id = ?`,
      [taskId]
    );

    if (!task) {
      await sqlite.closeDb();
      console.error(`Error: Task ${taskId} not found`);
      process.exit(1);
    }

    const subtasks = await sqlite.queryAll(
      `SELECT section, text, checked FROM task_subtasks
       WHERE task_id = ? ORDER BY position`,
      [taskId]
    );

    const deps = await sqlite.queryAll(
      `SELECT depends_on FROM task_dependencies WHERE task_id = ?`,
      [taskId]
    );

    await sqlite.closeDb();

    const mbDir = getMbDir(dbPath);
    const tasksDir = resolve(mbDir, 'tasks');

    // Try to read task file if it exists
    const taskFilePath = resolve(tasksDir, `${taskId}.md`);
    let fileContent = null;
    if (existsSync(taskFilePath)) {
      fileContent = readFileSync(taskFilePath, 'utf-8');
    }

    if (options.json) {
      console.log(JSON.stringify({ task, subtasks, dependencies: deps.map(d => d.depends_on), fileExists: !!fileContent }, null, 2));
      return;
    }

    console.log(`${task.id}: ${task.title}`);
    console.log('='.repeat(50));
    console.log(`Status:    ${statusEmoji(task.status)} ${task.status}`);
    console.log(`Priority:  ${task.priority.toUpperCase()}`);
    console.log(`Started:   ${task.started}`);
    if (task.last_updated) console.log(`Updated:   ${task.last_updated.slice(0, 19)}`);
    console.log(`Details:   ${task.details || 'None'}`);

    if (deps.length > 0) {
      console.log(`\nDependencies:`);
      for (const d of deps) {
        console.log(`  └─ ${d.depends_on}`);
      }
    }

    if (subtasks.length > 0) {
      console.log(`\nSubtasks (${subtasks.filter(s => s.checked).length}/${subtasks.length}):`);
      for (const st of subtasks) {
        const check = st.checked ? '[x]' : '[ ]';
        console.log(`  ${check} ${st.text}`);
      }
    }

    if (fileContent) {
      console.log(`\nTask file: ${taskFilePath}`);
    } else {
      console.log(`\n⚠️  No task file at ${taskFilePath}`);
    }
  } catch (err) {
    console.error(`Error: ${err.message}`);
    process.exit(1);
  }
}

// ============================================================================
// UPDATE COMMAND
// ============================================================================

async function updateCommand(taskId, options) {
  if (!taskId) {
    console.error('Error: Task ID required');
    console.log('Usage: mb task update T25 --status completed');
    process.exit(1);
  }

  const dbPath = findDbPath(options);
  if (!dbPath) {
    console.error('Error: No memory_bank.db found.');
    process.exit(1);
  }

  // Validate at least one update field
  if (!options.status && !options.priority && !options.title && !options.description) {
    console.error('Error: Nothing to update. Use --status, --priority, --title, or --description');
    process.exit(1);
  }

  try {
    const { sqlite, inserts, regenerate } = await loadDbModules();
    await sqlite.openDb(dbPath);

    // Check task exists
    const existing = await sqlite.queryGet(
      `SELECT * FROM task_items WHERE id = ?`, [taskId]
    );
    if (!existing) {
      await sqlite.closeDb();
      console.error(`Error: Task ${taskId} not found`);
      process.exit(1);
    }

    let changes = 0;

    // Update status
    if (options.status) {
      const result = await inserts.updateTaskStatus(taskId, options.status, options.note);
      changes += result.changes;
      console.log(`  Status → ${options.status}`);
    }

    // Update other fields via direct SQL
    if (options.priority || options.title || options.description) {
      const updates = [];
      const params = [];

      if (options.priority) {
        updates.push('priority = ?');
        params.push(options.priority);
      }
      if (options.title) {
        updates.push('title = ?');
        params.push(options.title);
      }
      if (options.description) {
        updates.push('details = ?');
        params.push(options.description);
      }
      updates.push('last_updated = ?');
      params.push(new Date().toISOString());
      params.push(taskId);

      const sql = `UPDATE task_items SET ${updates.join(', ')} WHERE id = ?`;
      const { changes: c } = await sqlite.execRun(sql, params);
      changes += c;

      if (options.priority) console.log(`  Priority → ${options.priority}`);
      if (options.title) console.log(`  Title → ${options.title}`);
      if (options.description) console.log(`  Description updated`);
    }

    const mbDir = getMbDir(dbPath);
    const tasksDir = resolve(mbDir, 'tasks');

    // Regenerate tasks.md
    await regenerate.regenerateTasks(resolve(mbDir, 'tasks.md'));

    // Update task file if it exists
    const taskFilePath = resolve(tasksDir, `${taskId}.md`);
    if (existsSync(taskFilePath)) {
      // Regenerate the task file from DB state
      const task = await sqlite.queryGet(`SELECT * FROM task_items WHERE id = ?`, [taskId]);
      const subtasks = await sqlite.queryAll(
        `SELECT text, checked FROM task_subtasks WHERE task_id = ? ORDER BY position`, [taskId]
      );
      const deps = await sqlite.queryAll(
        `SELECT depends_on FROM task_dependencies WHERE task_id = ?`, [taskId]
      );

      const md = generateTaskMarkdown(task, subtasks, deps.map(d => d.depends_on));
      writeFileSync(taskFilePath, md, 'utf-8');
      console.log(`  Task file updated`);
    }

    await sqlite.saveDb();
    await sqlite.closeDb();

    console.log(`✅ Task ${taskId} updated (${changes} change${changes === 1 ? '' : 's'})`);
  } catch (err) {
    console.error(`Error: ${err.message}`);
    process.exit(1);
  }
}

// ============================================================================
// DELETE COMMAND
// ============================================================================

async function deleteCommand(taskId, options) {
  if (!taskId) {
    console.error('Error: Task ID required');
    console.log('Usage: mb task delete T25');
    process.exit(1);
  }

  const dbPath = findDbPath(options);
  if (!dbPath) {
    console.error('Error: No memory_bank.db found.');
    process.exit(1);
  }

  try {
    const { sqlite, regenerate } = await loadDbModules();
    await sqlite.openDb(dbPath);

    // Check task exists
    const task = await sqlite.queryGet(
      `SELECT * FROM task_items WHERE id = ?`, [taskId]
    );
    if (!task) {
      await sqlite.closeDb();
      console.error(`Error: Task ${taskId} not found`);
      process.exit(1);
    }

    if (!options.yes) {
      console.log(`Delete task ${taskId}: ${task.title}?`);
      console.log('Run with --yes to confirm');
      await sqlite.closeDb();
      process.exit(0);
    }

    // Delete from DB (cascade deletes subtasks/deps via FK)
    await sqlite.execRun(`DELETE FROM task_items WHERE id = ?`, [taskId]);

    const mbDir = getMbDir(dbPath);
    const tasksDir = resolve(mbDir, 'tasks');

    // Move task file to archive if it exists
    const taskFilePath = resolve(tasksDir, `${taskId}.md`);
    if (existsSync(taskFilePath)) {
      const archiveDir = resolve(mbDir, 'archive');
      ensureDir(archiveDir);
      const archivedPath = resolve(archiveDir, `${taskId}.md`);
      renameSync(taskFilePath, archivedPath);
      console.log(`  Archived to: ${archivedPath}`);
    }

    // Regenerate tasks.md
    await regenerate.regenerateTasks(resolve(mbDir, 'tasks.md'));

    await sqlite.saveDb();
    await sqlite.closeDb();

    console.log(`✅ Task ${taskId} deleted`);
  } catch (err) {
    console.error(`Error: ${err.message}`);
    process.exit(1);
  }
}

// ============================================================================
// TASK COMMAND EXPORT
// ============================================================================

export function taskCommand(program) {
  const task = program
    .command('task')
    .description('Task management for Memory Bank');

  task.command('create <title>')
    .description('Create a new task')
    .option('-d, --db <path>', 'Path to SQLite database')
    .option('-i, --id <id>', 'Task ID (e.g., T26). Auto-generated if omitted.')
    .option('-p, --priority <level>', 'Priority: low, medium, high', 'medium')
    .option('-s, --status <status>', 'Status: pending, in_progress, paused, completed', 'pending')
    .option('--description <text>', 'Detailed description')
    .option('--subtasks <list>', 'Comma-separated subtasks: "Design schema,Implement API,Write tests"')
    .option('--depends <ids>', 'Comma-separated dependency task IDs: "T1,T2"')
    .action(createCommand);

  task.command('list')
    .description('List all tasks')
    .option('-d, --db <path>', 'Path to SQLite database')
    .option('--status <status>', 'Filter by status')
    .option('-j, --json', 'Output as JSON')
    .action(listCommand);

  task.command('show <id>')
    .description('Show task details')
    .option('-d, --db <path>', 'Path to SQLite database')
    .option('-j, --json', 'Output as JSON')
    .action(showCommand);

  task.command('update <id>')
    .description('Update task properties')
    .option('-d, --db <path>', 'Path to SQLite database')
    .option('-s, --status <status>', 'New status')
    .option('-p, --priority <level>', 'New priority')
    .option('-t, --title <text>', 'New title')
    .option('--description <text>', 'New description')
    .option('--note <text>', 'Note to append when updating status')
    .action(updateCommand);

  task.command('delete <id>')
    .description('Delete a task (archives the task file)')
    .option('-d, --db <path>', 'Path to SQLite database')
    .option('-y, --yes', 'Confirm deletion without prompt')
    .action(deleteCommand);

  return task;
}
