#!/usr/bin/env node

/**
 * Memory Bank Workflow Wrapper
 * Single function for agents to record session work, with optional regeneration
 * Replaces the 8-step manual markdown editing workflow
 */

import * as inserts from './inserts.js';
import * as regenerate from './regenerate.js';
import * as sqlite from './sqlite.js';
import { existsSync, readFileSync } from 'fs';
import { join, resolve } from 'path';

// ============================================================================
// AGENT WORKFLOW
// ============================================================================

/**
 * Record a session's work in one atomic operation
 *
 * This single call replaces the entire 8-step manual workflow:
 * 1. Inserts edit entry + file modifications into DB
 * 2. Updates task status if changed
 * 3. Creates/completes session record
 * 4. Updates session cache with current counts
 * 5. Optionally regenerates edit_history.md, tasks.md, session_cache.md
 * 6. Logs the transaction for audit
 *
 * @param {Object} data
 * @param {string} data.task_id - Primary task being worked on (T1, T2, etc.)
 * @param {string} data.task_description - Brief description of work done
 * @param {Array<{action:string,path:string,description:string}>} [data.files_modified] - Files changed
 * @param {string} [data.task_status] - New status if changed: in_progress, completed, paused
 * @param {string} [data.session_notes] - Notes about the session
 * @param {string} [data.session_period] - morning, afternoon, evening, night
 * @param {string} [data.output_dir] - Directory to write markdown files (default: memory-bank/)
 * @param {string} [data.tasks_dir] - Directory for individual task files (e.g., memory-bank/tasks/)
 * @param {string} [data.sessions_dir] - Directory for session files (e.g., memory-bank/sessions/)
 * @param {string} [data.edits_dir] - Directory for edit chunks (e.g., memory-bank/edits/)
 * @param {boolean} [data.regenerate_markdown] - Whether to rewrite markdown files after recording
 * @returns {Promise<Object>} Operation result with generated files and timing
 */
export async function recordSessionWork({
  task_id,
  task_description,
  files_modified = [],
  task_status = null,
  session_notes = '',
  session_period = 'morning',
  output_dir = null,
  tasks_dir = null,
  sessions_dir = null,
  edits_dir = null,
  regenerate_markdown = false
}) {
  const startTime = performance.now();
  const transactionId = `tx-${Date.now()}`;
  const now = new Date();
  const { dateStr, timeStr } = getLocalDateTimeParts(now);
  const tzStr = 'IST';
  let openedHere = false;

  // Normalize files_modified to {action, file_path, description}
  const modifications = files_modified.map(f => ({
    action: f.action,
    file_path: f.path || f.file_path,
    description: f.description
  }));

  try {
    // Open database if not already open
    if (!sqlite.isDbOpen()) {
      const dbPath = sqlite.getDbPath() || resolveDefaultDbPath();
      await sqlite.openDb(dbPath);
      openedHere = true;
    }

    // Step 1: Insert edit entry with modifications (atomic transaction)
    const { entryId, modificationIds } = await inserts.insertEditEntry({
      date: dateStr,
      time: timeStr,
      timezone: tzStr,
      task_id,
      task_description,
      modifications
    });

    // Step 2: Update task status if provided
    let taskUpdate = null;
    const existingTask = await sqlite.queryGet(
      `SELECT id FROM task_items WHERE id = ?`,
      [task_id]
    );
    if (task_status) {
      taskUpdate = await inserts.updateTaskStatus(task_id, task_status, task_description);
    } else if (!existingTask) {
      taskUpdate = await inserts.upsertTask({
        id: task_id,
        title: task_description,
        status: 'in_progress',
        priority: 'medium',
        started: dateStr,
        details: task_description
      });
    }

    // Step 3: Create or update session
    const existingSession = await sqlite.queryGet(
      `SELECT id FROM sessions
       WHERE date = ? AND period = ? AND status = 'active'
       ORDER BY id DESC LIMIT 1`,
      [dateStr, session_period]
    );

    let sessionId;
    if (existingSession) {
      sessionId = existingSession.id;
      const sessionContent = session_notes || `Working on ${task_id}: ${task_description}`;
      await sqlite.execRun(
        `UPDATE sessions
         SET focus = ?, content = COALESCE(content, '') || '\n\n' || ?
         WHERE id = ?`,
        [task_id, sessionContent, sessionId]
      );
    } else {
      const sessionResult = await inserts.createSession({
        date: dateStr,
        period: session_period,
        focus: task_id,
        status: 'active',
        content: session_notes || `Working on ${task_id}: ${task_description}`
      });
      sessionId = sessionResult.sessionId;
    }

    // Step 4: Update session cache
    const counts = await inserts.getTaskCounts();
    await inserts.updateSessionCache({
      current_session_id: sessionId,
      current_focus_task: task_id,
      active_tasks_count: counts.active || 0,
      paused_tasks_count: counts.paused || 0,
      completed_tasks_count: counts.completed || 0
    });

    // Step 5: Optionally regenerate markdown files
    const regenerated = regenerate_markdown
      ? await regenerateMarkdownState({
          output_dir: output_dir || 'memory-bank',
          tasks_dir,
          sessions_dir,
          edits_dir
        })
      : {};

    // Step 6: Log transaction
    await inserts.logTransaction({
      transaction_id: transactionId,
      operation_type: 'workflow_record',
      affected_tables: 'edit_entries,file_modifications,task_items,sessions,session_cache',
      row_count: 1 + modificationIds.length + (taskUpdate ? 1 : 0) + 1,
      status: 'success',
      duration_ms: Math.round(performance.now() - startTime)
    });

    const duration = Math.round(performance.now() - startTime);

    return {
      entry_id: entryId,
      session_id: sessionId,
      files_regenerated: Object.keys(regenerated).filter(k => regenerated[k]),
      duration_ms: duration,
      transaction_id: transactionId
    };

  } catch (err) {
    // Log failure
    try {
      await inserts.logTransaction({
        transaction_id: transactionId,
        operation_type: 'workflow_record',
        status: 'failed',
        error_message: err.message,
        duration_ms: Math.round(performance.now() - startTime)
      });
    } catch (logErr) {
      // Ignore logging errors during failure
    }
    throw err;
  } finally {
    if (openedHere) {
      await sqlite.closeDb();
    }
  }
}

export async function regenerateMarkdownState({
  output_dir = 'memory-bank',
  tasks_dir = null,
  sessions_dir = null,
  edits_dir = null
} = {}) {
  return regenerate.regenerateAll({
    editHistory: join(output_dir, 'edit_history.md'),
    tasks: join(output_dir, 'tasks.md'),
    sessionCache: join(output_dir, 'session_cache.md'),
    tasksDir: tasks_dir || join(output_dir, 'tasks'),
    sessionsDir: sessions_dir || join(output_dir, 'sessions'),
    editsDir: edits_dir || join(output_dir, 'edits')
  });
}

function getLocalDateTimeParts(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');

  return {
    dateStr: `${year}-${month}-${day}`,
    timeStr: `${hours}:${minutes}:${seconds}`
  };
}

function resolveDefaultDbPath() {
  const candidates = [
    'memory_bank.db',
    'memory-bank/database/memory_bank.db',
    'database/memory_bank.db'
  ];

  for (const candidate of candidates) {
    const fullPath = resolve(candidate);
    if (existsSync(fullPath)) {
      return fullPath;
    }
  }

  return ':memory:';
}

// ============================================================================
// BATCH OPERATIONS
// ============================================================================

/**
 * Complete a session and regenerate files
 * Call this when finishing work on a task
 */
export async function completeSessionWork(sessionId, notes = null, {
  output_dir = 'memory-bank',
  tasks_dir = null,
  sessions_dir = null,
  edits_dir = null,
  task_status = 'completed'
} = {}) {
  const startTime = performance.now();
  const transactionId = `tx-${Date.now()}`;
  let openedHere = false;

  try {
    if (!sqlite.isDbOpen()) {
      const dbPath = sqlite.getDbPath() || resolveDefaultDbPath();
      await sqlite.openDb(dbPath);
      openedHere = true;
    }

    const session = await sqlite.queryGet(
      `SELECT id, focus FROM sessions WHERE id = ?`,
      [sessionId]
    );

    // Update session status
    await inserts.completeSession(sessionId, notes);

    if (session?.focus && task_status) {
      await inserts.updateTaskStatus(session.focus, task_status, notes || null);
    }

    // Update counts
    const counts = await inserts.getTaskCounts();
    const nextActiveSession = await sqlite.queryGet(
      `SELECT id, focus
       FROM sessions
       WHERE status = 'active'
       ORDER BY created_at DESC, id DESC
       LIMIT 1`
    );
    await inserts.updateSessionCache({
      current_session_id: nextActiveSession?.id || null,
      current_focus_task: nextActiveSession?.focus || null,
      active_tasks_count: counts.active || 0,
      paused_tasks_count: counts.paused || 0,
      completed_tasks_count: counts.completed || 0
    });

    // Regenerate files
    const regenerated = await regenerate.regenerateAll({
      editHistory: join(output_dir, 'edit_history.md'),
      tasks: join(output_dir, 'tasks.md'),
      sessionCache: join(output_dir, 'session_cache.md'),
      tasksDir: tasks_dir || join(output_dir, 'tasks'),
      sessionsDir: sessions_dir || join(output_dir, 'sessions'),
      editsDir: edits_dir || join(output_dir, 'edits')
    });

    // Log transaction
    await inserts.logTransaction({
      transaction_id: transactionId,
      operation_type: 'workflow_complete',
      affected_tables: 'sessions,session_cache',
      row_count: 2,
      status: 'success',
      duration_ms: Math.round(performance.now() - startTime)
    });

    return {
      session_id: sessionId,
      files_regenerated: Object.keys(regenerated).filter(k => regenerated[k]),
      duration_ms: Math.round(performance.now() - startTime),
      transaction_id: transactionId
    };

  } catch (err) {
    try {
      await inserts.logTransaction({
        transaction_id: transactionId,
        operation_type: 'workflow_complete',
        status: 'failed',
        error_message: err.message,
        duration_ms: Math.round(performance.now() - startTime)
      });
    } catch (logErr) {
      // Ignore
    }
    throw err;
  } finally {
    if (openedHere) {
      await sqlite.closeDb();
    }
  }
}

// ============================================================================
// QUICK LOGGING
// ============================================================================

/**
 * Quick log of a single file change without full workflow
 * Useful for quick edits or small changes
 */
export async function quickLog({ task_id, description, file_path, action = 'Modified' }) {
  const now = new Date();
  const dateStr = now.toISOString().slice(0, 10);
  const timeStr = now.toTimeString().slice(0, 8);

  return await inserts.insertEditEntry({
    date: dateStr,
    time: timeStr,
    timezone: 'IST',
    task_id,
    task_description: description,
    modifications: [{
      action,
      file_path,
      description: `${action} ${file_path}`
    }]
  });
}
