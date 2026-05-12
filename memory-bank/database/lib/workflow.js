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
       WHERE session_date = ? AND session_period = ? AND status = 'in_progress'
       ORDER BY id DESC LIMIT 1`,
      [dateStr, session_period]
    );

    let sessionId;
    if (existingSession) {
      sessionId = existingSession.id;
      // Update notes
      if (session_notes) {
        await sqlite.execRun(
          `UPDATE sessions SET notes = COALESCE(notes, '') || '\n\n' || ? WHERE id = ?`,
          [session_notes, sessionId]
        );
      }
    } else {
      const sessionResult = await inserts.createSession({
        session_date: dateStr,
        session_period,
        focus_task: task_id,
        start_time: now.toISOString(),
        status: 'in_progress',
        notes: session_notes
      });
      sessionId = sessionResult.sessionId;
    }

    // Step 4: Update session cache with current counts
    const counts = await inserts.getTaskCounts();
    await inserts.updateSessionCache({
      current_session_id: sessionId,
      current_focus_task: task_id,
      active_count: counts.active,
      paused_count: counts.paused,
      completed_count: counts.completed
    });

    // Step 5: Regenerate all markdown files
    const outDir = output_dir || 'memory-bank';
    const regenerated = await regenerate.regenerateAll({
      editHistory: join(outDir, 'edit_history.md'),
      tasks: join(outDir, 'tasks.md'),
      sessionCache: join(outDir, 'session_cache.md')
    });

    // Step 6: Log transaction
    const durationMs = Math.round(performance.now() - startTime);
    await inserts.logTransaction({
      transaction_id: transactionId,
      operation_type: 'record_session_work',
      affected_tables: 'edit_entries,file_modifications,task_items,sessions,session_cache',
      row_count: 1 + modificationIds.length + (taskUpdate ? 1 : 0),
      status: 'success',
      duration_ms: durationMs
    });

    return {
      success: true,
      transactionId,
      entryId,
      sessionId,
      durationMs,
      filesWritten: [
        join(outDir, 'edit_history.md'),
        join(outDir, 'tasks.md'),
        join(outDir, 'session_cache.md')
      ],
      taskUpdate: taskUpdate || null,
      counts
    };

  } catch (error) {
    // Log failed transaction
    const durationMs = Math.round(performance.now() - startTime);
    await inserts.logTransaction({
      transaction_id: transactionId,
      operation_type: 'record_session_work',
      status: 'failed',
      error_message: error.message,
      duration_ms: durationMs
    });

    throw error;
  }
}

// ============================================================================
// INIT / SETUP
// ============================================================================

/**
 * Initialize a fresh database with Phase A schema
 * Reads schema.sql from same directory and executes it
 *
 * @param {string} [dbPath] - Path for database file (default: memory_bank.db)
 * @returns {Promise<void>}
 */
export async function initDatabase(dbPath = 'memory_bank.db') {
  const schemaPath = new URL('./schema.sql', import.meta.url).pathname;
  const schema = readFileSync(schemaPath, 'utf-8');
  await sqlite.exec(schema);
}

// ============================================================================
// PARSE EXISTING → DB
// ============================================================================

/**
 * Import existing markdown files into the database
 * One-time migration from text-first to database-first
 *
 * @param {Object} paths
 * @param {string} paths.editHistory - Path to edit_history.md
 * @param {string} paths.tasks - Path to tasks.md
 * @param {string} paths.sessionCache - Path to session_cache.md
 * @returns {Promise<Object>} Import statistics
 */
export async function importExistingMarkdown(paths) {
  // This is a thin wrapper around the existing parse-* scripts
  // They handle the actual parsing and insertion
  const stats = {
    editEntries: 0,
    tasks: 0,
    sessions: 0,
    errors: []
  };

  // TODO: Dynamically import parse scripts and run them
  // For now, this is a placeholder showing the intended API

  return stats;
}

// ============================================================================
// QUERY HELPERS
// ============================================================================

/**
 * Get current workspace status snapshot
 * Fast query for agent startup sequence
 */
export async function getWorkspaceSnapshot() {
  const cache = await sqlite.queryGet(`SELECT * FROM session_cache WHERE id = 1`);
  const activeTasks = await sqlite.queryAll(
    `SELECT id, title, status, priority FROM task_items WHERE status = 'in_progress' ORDER BY id`
  );
  const lastSession = await sqlite.queryGet(
    `SELECT * FROM sessions ORDER BY id DESC LIMIT 1`
  );

  return {
    cache,
    activeTasks,
    lastSession,
    timestamp: new Date().toISOString()
  };
}
