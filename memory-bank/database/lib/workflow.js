#!/usr/bin/env node

/**
 * Memory Bank Workflow Wrapper
 * Single function for agents to record session work and regenerate files
 * Replaces the 8-step manual markdown editing workflow
 */

import * as inserts from './inserts.js';
import * as regenerate from './regenerate.js';
import * as sqlite from './sqlite.js';
import { readFileSync } from 'fs';
import { join } from 'path';

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
 * 5. Regenerates edit_history.md, tasks.md, session_cache.md
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
 * @returns {Promise<Object>} Operation result with generated files and timing
 */
export async function recordSessionWork({
  task_id,
  task_description,
  files_modified = [],
  task_status = null,
  session_notes = '',
  session_period = 'morning',
  output_dir = null
}) {
  const startTime = performance.now();
  const transactionId = `tx-${Date.now()}`;
  const now = new Date();
  const dateStr = now.toISOString().slice(0, 10);
  const timeStr = now.toTimeString().slice(0, 8);
  const tzStr = 'IST';

  // Normalize files_modified to {action, file_path, description}
  const modifications = files_modified.map(f => ({
    action: f.action,
    file_path: f.path || f.file_path,
    description: f.description
  }));

  try {
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
    if (task_status) {
      taskUpdate = await inserts.updateTaskStatus(task_id, task_status, task_description);
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
      // Update notes
      if (session_notes) {
        await sqlite.execRun(
          `UPDATE sessions SET content = COALESCE(content, '') || '\n\n' || ? WHERE id = ?`,
          [session_notes, sessionId]
        );
      }
    } else {
      const sessionIdStr = `${dateStr}-${session_period}`;
      const sessionResult = await inserts.createSession({
        id: sessionIdStr,
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
      current_focus_task: task_id,
      active_count: counts.active || 0,
      paused_count: counts.paused || 0,
      completed_count: counts.completed || 0
    });

    // Step 5: Regenerate markdown files
    const baseDir = output_dir || 'memory-bank';
    const paths = {
      edit_history: join(baseDir, 'edit_history.md'),
      tasks: join(baseDir, 'tasks.md'),
      session_cache: join(baseDir, 'session_cache.md')
    };

    const regenerated = await regenerate.regenerateAll(paths);

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
  }
}

// ============================================================================
// BATCH OPERATIONS
// ============================================================================

/**
 * Complete a session and regenerate files
 * Call this when finishing work on a task
 */
export async function completeSessionWork(sessionId, notes = null) {
  const startTime = performance.now();
  const transactionId = `tx-${Date.now()}`;

  try {
    // Update session status
    await inserts.completeSession(sessionId, notes);

    // Update counts
    const counts = await inserts.getTaskCounts();
    await inserts.updateSessionCache({
      active_count: counts.active || 0,
      paused_count: counts.paused || 0,
      completed_count: counts.completed || 0
    });

    // Regenerate files
    const regenerated = await regenerate.regenerateAll({
      edit_history: 'memory-bank/edit_history.md',
      tasks: 'memory-bank/tasks.md',
      session_cache: 'memory-bank/session_cache.md'
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
