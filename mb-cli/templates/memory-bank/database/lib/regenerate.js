/**
 * Memory Bank Markdown Regeneration
 * Reads from SQLite database and writes canonical markdown files
 * Matches the exact format expected by parsers and agents
 */

import { join } from 'path';
import { writeFileSync, mkdirSync, existsSync } from 'fs';
import * as sqlite from './sqlite.js';

// ============================================================================
// EDIT HISTORY
// ============================================================================

/**
 * Regenerate edit_history.md from database
 *
 * @param {string} outputPath - Path to write markdown file
 * @returns {Promise<string>} Generated markdown content
 */
export async function regenerateEditHistory(outputPath) {
  const entries = await sqlite.queryAll(
    `SELECT id, date, time, timezone, task_id, task_description
     FROM edit_entries
     ORDER BY date DESC, time DESC`
  );

  const now = new Date().toISOString().replace('T', ' ').slice(0, 19) + ' IST';

  let md = '# Edit History\n\n';
  md += `*Last Updated: ${now}*\n\n`;
  md += '---\n';

  let currentDate = null;

  for (const entry of entries) {
    if (entry.date !== currentDate) {
      currentDate = entry.date;
      md += `\n## ${currentDate}\n\n`;
    }

    const tz = entry.timezone ? ` ${entry.timezone}` : '';
    const taskPart = entry.task_id ? `${entry.task_id}: ` : '';
    md += `#### ${entry.time}${tz} - ${taskPart}${entry.task_description}\n`;

    const mods = await sqlite.queryAll(
      `SELECT action, file_path, description FROM file_modifications
       WHERE edit_entry_id = ? ORDER BY id`,
      [entry.id]
    );

    for (const mod of mods) {
      md += `- ${mod.action} \`${mod.file_path}\` - ${mod.description}\n`;
    }

    md += '\n';
  }

  if (outputPath) {
    ensureDir(outputPath);
    writeFileSync(outputPath, md, 'utf-8');
  }

  return md;
}

// ============================================================================
// TASKS REGISTRY
// ============================================================================

/**
 * Regenerate tasks.md from database
 *
 * @param {string} outputPath - Path to write markdown file
 * @returns {Promise<string>} Generated markdown content
 */
export async function regenerateTasks(outputPath) {
  const allTasks = await sqlite.queryAll(
    `SELECT id, title, status, priority, started, last_updated, details
     FROM task_items
     ORDER BY id`
  );

  const deps = await sqlite.queryAll(
    `SELECT task_id, depends_on FROM task_dependencies ORDER BY task_id`
  );

  const now = new Date().toISOString().replace('T', ' ').slice(0, 19) + ' IST';

  // Separate by status
  const active = allTasks.filter(t => t.status === 'in_progress' || t.status === 'paused');
  const completed = allTasks.filter(t => t.status === 'completed');
  const pending = allTasks.filter(t => t.status === 'pending');

  let md = '# Memory Bank - Sage Workspace\n\n';
  md += `*Created: ${now}*\n`;
  md += `*Last Updated: ${now}*\n\n`;
  md += '## Overview\n\n';
  md += 'This is the Memory Bank for the Sage (灵剑) OpenClaw workspace.\n\n';

  // Active Tasks
  if (active.length > 0) {
    md += '## Active Tasks\n\n';
    md += '| ID | Title | Status | Priority | Started | Dependencies | Details |\n';
    md += '|----|-------|--------|----------|---------|--------------|---------|\n';
    for (const t of active) {
      const emoji = statusEmoji(t.status);
      const depList = deps.filter(d => d.task_id === t.id).map(d => d.depends_on).join(', ') || '-';
      md += `| ${t.id} | ${t.title} | ${emoji} | ${t.priority.toUpperCase()} | ${t.started} | ${depList} | [Details](tasks/${t.id}.md) |\n`;
    }
    md += '\n';
  }

  // Completed Tasks
  if (completed.length > 0) {
    md += '## Completed Tasks\n\n';
    md += '| ID | Title | Status | Priority | Started | Completed | Dependencies | Details |\n';
    md += '|----|-------|--------|----------|---------|-----------|--------------|---------|\n';
    for (const t of completed) {
      const depList = deps.filter(d => d.task_id === t.id).map(d => d.depends_on).join(', ') || '-';
      const completedDate = t.last_updated ? t.last_updated.slice(0, 10) : '-';
      md += `| ${t.id} | ${t.title} | ✅ | ${t.priority.toUpperCase()} | ${t.started} | ${completedDate} | ${depList} | [Details](tasks/${t.id}.md) |\n`;
    }
    md += '\n';
  }

  // Pending Tasks
  if (pending.length > 0) {
    md += '## Pending Tasks\n\n';
    md += '| ID | Title | Status | Priority | Started | Dependencies | Details |\n';
    md += '|----|-------|--------|----------|---------|--------------|---------|\n';
    for (const t of pending) {
      const depList = deps.filter(d => d.task_id === t.id).map(d => d.depends_on).join(', ') || '-';
      md += `| ${t.id} | ${t.title} | ⬜ | ${t.priority.toUpperCase()} | ${t.started} | ${depList} | [Details](tasks/${t.id}.md) |\n`;
    }
    md += '\n';
  }

  // Task Relationships tree
  md += '## Task Relationships\n\n';
  md += '```\n';
  for (const t of allTasks) {
    const tDeps = deps.filter(d => d.task_id === t.id);
    if (tDeps.length === 0) {
      md += `${t.id}: ${t.title}\n`;
    } else {
      md += `${t.id}: ${t.title}\n`;
      for (const d of tDeps) {
        md += `  └── ${d.depends_on}\n`;
      }
    }
  }
  md += '```\n\n';

  // Status Summary
  md += '## Status Summary\n\n';
  md += `- **Active**: ${active.length}\n`;
  md += `- **Completed**: ${completed.length}\n`;
  md += `- **Paused**: ${allTasks.filter(t => t.status === 'paused').length}\n`;
  md += `- **Total**: ${allTasks.length}\n`;

  if (outputPath) {
    ensureDir(outputPath);
    writeFileSync(outputPath, md, 'utf-8');
  }

  return md;
}

// ============================================================================
// SESSION CACHE
// ============================================================================

/**
 * Regenerate session_cache.md from database
 *
 * @param {string} outputPath - Path to write markdown file
 * @returns {Promise<string>} Generated markdown content
 */
export async function regenerateSessionCache(outputPath) {
  const cache = await sqlite.queryGet(
    `SELECT * FROM session_cache WHERE session_id = 'current'`
  );

  const cacheMeta = parseSessionCacheMetadata(cache?.raw_content);
  const currentSession = cacheMeta.current_session_id
    ? await sqlite.queryGet(`SELECT * FROM sessions WHERE id = ?`, [cacheMeta.current_session_id])
    : await getCurrentSession(cache?.focus_task || null);

  const latestSession = currentSession || await getLatestSession();
  const focusTaskId = cache?.focus_task || activeFocusTaskId(cache?.focus_task, currentSession);
  const focusTask = focusTaskId
    ? await sqlite.queryGet(`SELECT * FROM task_items WHERE id = ?`, [focusTaskId])
    : null;

  const activeTasks = await sqlite.queryAll(
    `SELECT * FROM task_items WHERE status = 'in_progress' ORDER BY id`
  );

  const completedTasks = await sqlite.queryAll(
    `SELECT * FROM task_items WHERE status = 'completed' ORDER BY id`
  );

  const pausedTasks = await sqlite.queryAll(
    `SELECT * FROM task_items WHERE status = 'paused' ORDER BY id`
  );

  const now = new Date().toISOString().replace('T', ' ').slice(0, 19) + ' IST';

  let md = '# Session Cache\n\n';
  md += `*Created: ${now}*\n`;
  md += `*Last Updated: ${now}*\n\n`;

  const started = latestSession?.created_at
    ? `${latestSession.created_at} IST`
    : now;

  const focusName = focusTask
    ? `${focusTask.id}: ${focusTask.title}`
    : (activeTasks[0] ? `${activeTasks[0].id}: ${activeTasks[0].title}` : 'None');

  const sessionFile = latestSession
    ? `sessions/${latestSession.date}-${latestSession.period}.md`
    : 'sessions/latest.md';

  const statusText = cache
    ? `${activeTasks.length > 0 ? '🔄' : '✅'} Active: ${activeTasks.length}, Paused: ${pausedTasks.length}, Completed: ${completedTasks.length}`
    : '✅ Session cache initializing';

  md += `**Started**: ${started}\n`;
  md += `**Focus Task**: ${focusName}\n`;
  md += `**Session File**: \`${sessionFile}\`\n`;
  md += `**Status**: ${statusText}\n\n`;

  // Overview
  md += '## Overview\n\n';
  md += `- Active: ${activeTasks.length} | Paused: ${pausedTasks.length} | Completed: ${completedTasks.length}\n`;
  md += `- Last Session: ${latestSession?.date || '-'}\n`;
  md += `- Current Period: ${latestSession?.period || 'morning'}\n\n`;

  // Active Tasks
  if (activeTasks.length > 0) {
    md += '## Active Tasks\n\n';
    for (const t of activeTasks) {
      md += `### ${t.id}: ${t.title}\n`;
      md += `**Status:** 🔄 **IN PROGRESS**\n`;
      md += `**Started:** ${t.started}\n`;
      md += `**Context**: ${t.details?.split('\n')[0] || 'No context'}\n`;
      if (t.details) {
        md += `**Progress**:\n`;
        const lines = t.details.split('\n').filter(l => l.trim());
        for (const line of lines.slice(0, 10)) {
          md += `${line}\n`;
        }
      }
      md += '\n';
    }
  }

  // Completed Tasks
  if (completedTasks.length > 0) {
    md += '## Completed Tasks\n\n';
    for (const t of completedTasks) {
      md += `### ${t.id}: ${t.title}\n`;
      md += `**Status:** ✅ **COMPLETED**\n`;
      md += `**Started:** ${t.started}\n`;
      md += `**Completed:** ${t.last_updated?.slice(0, 10) || '-'}\n\n`;
    }
  }

  // Next Session Focus
  md += '## Next Session Focus\n\n';
  if (activeTasks.length > 0) {
    for (const t of activeTasks.slice(0, 3)) {
      md += `1. ${t.id}: ${t.title}\n`;
    }
  } else {
    md += '1. No active tasks — review pending or create new tasks\n';
  }
  md += '\n';

  // System Status
  md += '## System Status\n\n';
  md += `- **Memory Bank**: ${activeTasks.length > 0 ? '🔄 Active' : '✅ Idle'}\n`;
  md += `- **OpenClaw**: ✅ Operational\n`;

  if (outputPath) {
    ensureDir(outputPath);
    writeFileSync(outputPath, md, 'utf-8');
  }

  return md;
}

// ============================================================================
// BATCH REGENERATION
// ============================================================================

/**
 * Regenerate all three core markdown files in one call
 *
 * @param {Object} paths
 * @param {string} paths.editHistory - Path for edit_history.md
 * @param {string} paths.tasks - Path for tasks.md
 * @param {string} paths.sessionCache - Path for session_cache.md
 * @param {string} [paths.tasksDir] - Directory for individual task files
 * @param {string} [paths.sessionsDir] - Directory for session files
 * @param {string} [paths.editsDir] - Directory for edit chunks
 * @returns {Promise<{editHistory:string,tasks:string,sessionCache:string}>}
 */
export async function regenerateAll(paths) {
  const [editHistory, tasks, sessionCache] = await Promise.all([
    regenerateEditHistory(paths.editHistory),
    regenerateTasks(paths.tasks),
    regenerateSessionCache(paths.sessionCache)
  ]);

  // Generate individual task files
  if (paths.tasksDir) {
    await regenerateTaskFiles(paths.tasksDir);
  }

  // Generate session file
  if (paths.sessionsDir) {
    await regenerateSessionFile(paths.sessionsDir);
  }

  // Generate edit chunk
  if (paths.editsDir) {
    await regenerateEditChunk(paths.editsDir);
  }

  return { editHistory, tasks, sessionCache };
}

// ============================================================================
// HELPERS
// ============================================================================

function statusEmoji(status) {
  switch (status) {
    case 'in_progress': return '🔄';
    case 'completed': return '✅';
    case 'paused': return '⏸️';
    case 'pending': return '⬜';
    default: return '⬜';
  }
}

/**
 * Ensure parent directory exists before writing file
 */
function ensureDir(filePath) {
  const parentDir = filePath.replace(/\/[^/]+$/, '');
  if (parentDir && !existsSync(parentDir)) {
    mkdirSync(parentDir, { recursive: true });
  }
}

async function getCurrentSession(focusTaskId = null) {
  if (focusTaskId) {
    const focused = await sqlite.queryGet(
      `SELECT * FROM sessions
       WHERE status = 'active' AND focus = ?
       ORDER BY date DESC, created_at DESC, id DESC
       LIMIT 1`,
      [focusTaskId]
    );
    if (focused) return focused;
  }

  const active = await sqlite.queryGet(
    `SELECT * FROM sessions
     WHERE status = 'active'
     ORDER BY date DESC, created_at DESC, id DESC
     LIMIT 1`
  );
  if (active) return active;

  return null;
}

function parseSessionCacheMetadata(rawContent) {
  if (!rawContent) {
    return { current_session_id: null };
  }

  try {
    const parsed = JSON.parse(rawContent);
    return {
      current_session_id: parsed?.current_session_id || null
    };
  } catch {
    return { current_session_id: null };
  }
}

async function getLatestSession() {
  return sqlite.queryGet(
    `SELECT * FROM sessions
     ORDER BY date DESC, created_at DESC, id DESC
     LIMIT 1`
  );
}

function activeFocusTaskId(cacheFocusTask, currentSession) {
  if (cacheFocusTask) {
    return cacheFocusTask;
  }
  if (currentSession?.status === 'active') {
    return currentSession.focus || null;
  }
  return null;
}

// ============================================================================
// EXTENDED REGENERATION (Task Files, Session Files, Edit Chunks)
// ============================================================================

/**
 * Generate individual task files from database
 * @param {string} tasksDir - Directory to write task files (e.g., memory-bank/tasks/)
 */
export async function regenerateTaskFiles(tasksDir) {
  const tasks = await sqlite.queryAll(
    `SELECT id, title, status, priority, started, last_updated, details FROM task_items ORDER BY id`
  );

  for (const task of tasks) {
    const filePath = join(tasksDir, `${task.id}.md`);

    let md = `# ${task.id}: ${task.title}\n\n`;
    md += `*Created: ${task.started || '-'}*\n`;
    md += `*Last Updated: ${task.last_updated || '-'}*\n\n`;
    md += `**Status**: ${statusEmoji(task.status)} **${task.status.toUpperCase()}**\n`;
    md += `**Priority**: ${task.priority || 'MEDIUM'}\n\n`;

    if (task.details) {
      md += `## Details\n\n${task.details}\n\n`;
    }

    // Get subtasks (gracefully handle missing table)
    let subtasks = [];
    try {
      subtasks = await sqlite.queryAll(
        `SELECT section, text, checked FROM task_subtasks WHERE task_id = ? ORDER BY position`,
        [task.id]
      );
    } catch (err) {
      if (!err.message.includes('no such table')) throw err;
      // Table doesn't exist — skip subtasks
    }

    if (subtasks.length > 0) {
      md += `## Subtasks\n\n`;
      for (const st of subtasks) {
        const checkbox = st.checked ? '[x]' : '[ ]';
        md += `- ${checkbox} ${st.text}\n`;
      }
      md += '\n';
    }

    // Get dependencies
    const deps = await sqlite.queryAll(
      `SELECT depends_on FROM task_dependencies WHERE task_id = ?`,
      [task.id]
    );

    if (deps.length > 0) {
      md += `## Dependencies\n\n`;
      for (const d of deps) {
        md += `- ${d.depends_on}\n`;
      }
      md += '\n';
    }

    ensureDir(filePath);
    writeFileSync(filePath, md, 'utf-8');
  }

  return tasks.length;
}

/**
 * Generate session file from database
 * @param {string} sessionsDir - Directory to write session files (e.g., memory-bank/sessions/)
 */
export async function regenerateSessionFile(sessionsDir) {
  let sessions;
  try {
    sessions = await sqlite.queryAll(
      `SELECT id, date, period, focus, status, content, start_time, end_time
       FROM sessions
       ORDER BY date DESC, created_at DESC, id DESC`
    );
  } catch (err) {
    if (!err.message.includes('no such column')) throw err;
    sessions = await sqlite.queryAll(
      `SELECT id, date, period, focus, status, content
       FROM sessions
       ORDER BY date DESC, id DESC`
    );
  }

  for (const session of sessions) {
    const fileName = `${session.date}-${session.period}.md`;
    const filePath = join(sessionsDir, fileName);

    let md = `# Session: ${session.date} ${session.period.charAt(0).toUpperCase() + session.period.slice(1)}\n\n`;
    md += `**Started**: ${session.start_time || session.created_at || '-'}\n`;
    md += `**Focus Task**: ${session.focus || 'None'}\n`;
    md += `**Status**: ${session.status === 'active' || session.status === 'in_progress' ? '🔄' : '✅'} ${session.status.toUpperCase()}\n\n`;

    if (session.content) {
      md += `## Work Done\n\n${session.content}\n\n`;
    }

    ensureDir(filePath);
    writeFileSync(filePath, md, 'utf-8');
  }

  return sessions.length;
}

/**
 * Generate edit chunk file from most recent edit entry
 * @param {string} editsDir - Directory to write edit chunks (e.g., memory-bank/edits/)
 */
export async function regenerateEditChunk(editsDir) {
  const entry = await sqlite.queryGet(
    `SELECT id, date, time, timezone, task_id, task_description
     FROM edit_entries
     ORDER BY id DESC LIMIT 1`
  );

  if (!entry) return 0;

  const dateDir = join(editsDir, entry.date);
  const timeStr = entry.time.replace(/:/g, '');
  const fileName = `${timeStr}-${entry.task_id || 'general'}-edit-chunk.md`;
  const filePath = join(dateDir, fileName);

  // Get file modifications
  const mods = await sqlite.queryAll(
    `SELECT action, file_path, description FROM file_modifications WHERE edit_entry_id = ? ORDER BY id`,
    [entry.id]
  );

  let md = `# Edit Chunk: ${entry.date} ${entry.time} ${entry.timezone || ''}\n\n`;
  md += `## Task: ${entry.task_id || 'General'}\n\n`;
  md += `### Work Done\n\n${entry.task_description}\n\n`;

  if (mods.length > 0) {
    md += `### Files Modified\n\n`;
    for (const mod of mods) {
      md += `- ${mod.action} \`${mod.file_path}\` — ${mod.description}\n`;
    }
    md += '\n';
  }

  ensureDir(filePath);
  writeFileSync(filePath, md, 'utf-8');

  return 1;
}
