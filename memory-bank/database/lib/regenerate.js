/**
 * Memory Bank Markdown Regeneration
 * Reads from SQLite database and writes canonical markdown files
 * Matches the exact format expected by parsers and agents
 */

import * as sqlite from './sqlite.js';
import { writeFileSync, mkdirSync, existsSync } from 'fs';

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
    `SELECT * FROM session_cache WHERE id = 1`
  );

  const currentSession = cache?.current_session_id
    ? await sqlite.queryGet(`SELECT * FROM sessions WHERE id = ?`, [cache.current_session_id])
    : null;

  const focusTask = cache?.current_focus_task
    ? await sqlite.queryGet(`SELECT * FROM task_items WHERE id = ?`, [cache.current_focus_task])
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

  const started = currentSession?.start_time
    ? new Date(currentSession.start_time).toISOString().replace('T', ' ').slice(0, 19) + ' IST'
    : now;

  const focusName = focusTask
    ? `${focusTask.id}: ${focusTask.title}`
    : (activeTasks[0] ? `${activeTasks[0].id}: ${activeTasks[0].title}` : 'None');

  const sessionFile = currentSession
    ? `sessions/${currentSession.session_date}-${currentSession.session_period}.md`
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
  md += `- Last Session: ${currentSession?.session_date || '-'}\n`;
  md += `- Current Period: ${currentSession?.session_period || 'morning'}\n\n`;

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
 * @returns {Promise<{editHistory:string,tasks:string,sessionCache:string}>}
 */
export async function regenerateAll(paths) {
  const [editHistory, tasks, sessionCache] = await Promise.all([
    regenerateEditHistory(paths.editHistory),
    regenerateTasks(paths.tasks),
    regenerateSessionCache(paths.sessionCache)
  ]);

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
