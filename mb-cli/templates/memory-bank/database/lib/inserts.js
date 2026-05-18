/**
 * Memory Bank Insert Functions
 * Atomic database write operations for agent workflow
 * Uses sql.js via lib/sqlite.js (async API)
 */

import * as sqlite from './sqlite.js';

// ============================================================================
// EDIT ENTRIES
// ============================================================================

/**
 * Insert an edit entry with file modifications (atomic transaction)
 *
 * @param {Object} data
 * @param {string} data.date - YYYY-MM-DD
 * @param {string} data.time - HH:MM:SS
 * @param {string} [data.timezone] - IST, UTC, etc.
 * @param {string} [data.task_id] - T1, T2, etc. (comma-separated if multiple)
 * @param {string} data.task_description - Brief description of work
 * @param {Array<{action:string,file_path:string,description:string}>} [data.modifications] - File changes
 * @returns {Promise<{entryId:number,modificationIds:number[]}>}
 */
export async function insertEditEntry({ date, time, timezone = null, task_id = null, task_description, modifications = [] }) {
  return sqlite.withTransaction(async () => {
    // Compute ISO timestamp
    const timestamp = computeTimestamp(date, time, timezone);

    // Insert edit entry
    const { lastInsertRowid: entryId } = await sqlite.execRun(
      `INSERT INTO edit_entries (date, time, timezone, timestamp, task_id, task_description)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [date, time, timezone ?? null, timestamp, task_id ?? null, task_description]
    );

    // Insert file modifications
    const modificationIds = [];
    for (const mod of modifications) {
      const { lastInsertRowid: modId } = await sqlite.execRun(
        `INSERT INTO file_modifications (edit_entry_id, action, file_path, description)
         VALUES (?, ?, ?, ?)`,
        [entryId, mod.action, mod.file_path, mod.description]
      );
      modificationIds.push(modId);
    }

    return { entryId, modificationIds };
  });
}

/**
 * Insert multiple edit entries in a single transaction
 *
 * @param {Array<Object>} entries - Array of edit entry data objects
 * @returns {Promise<Array<{entryId:number,modificationIds:number[]}>>}
 */
export async function insertEditEntries(entries) {
  return sqlite.withTransaction(async () => {
    const results = [];
    for (const entry of entries) {
      const result = await insertEditEntry(entry);
      results.push(result);
    }
    return results;
  });
}

// ============================================================================
// TASK MANAGEMENT
// ============================================================================

/**
 * Create or replace a task item
 *
 * @param {Object} data
 * @param {string} data.id - T1, T2, etc.
 * @param {string} data.title - Task title
 * @param {string} data.status - pending, in_progress, completed, paused
 * @param {string} data.priority - low, medium, high
 * @param {string} data.started - YYYY-MM-DD
 * @param {string} [data.details] - Description and context
 * @returns {Promise<{changes:number}>}
 */
export async function upsertTask({ id, title, status, priority, started, details = '' }) {
  const now = new Date().toISOString();
  const { changes } = await sqlite.execRun(
    `INSERT INTO task_items (id, title, status, priority, started, details, updated)
     VALUES (?, ?, ?, ?, ?, ?, ?)
     ON CONFLICT(id) DO UPDATE SET
       title = excluded.title,
       status = excluded.status,
       priority = excluded.priority,
       started = excluded.started,
       details = excluded.details,
       updated = excluded.updated`,
    [id, title, status, priority, started, details, now]
  );
  return { id, changes };
}

/**
 * Update task status
 *
 * @param {string} taskId - T1, T2, etc.
 * @param {string} newStatus - pending, in_progress, completed, paused
 * @param {string} [detailsUpdate] - Optional details to append
 * @returns {Promise<{changes:number}>}
 */
export async function updateTaskStatus(taskId, newStatus, detailsUpdate = null) {
  const now = new Date().toISOString();

  // Check if task exists
  const existing = await sqlite.queryGet(
    `SELECT id FROM task_items WHERE id = ?`,
    [taskId]
  );

  if (!existing) {
    // Auto-create task if it doesn't exist
    const { lastInsertRowid } = await sqlite.execRun(
      `INSERT INTO task_items (id, title, status, priority, started, updated, details)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [taskId, detailsUpdate || taskId, newStatus, 'medium', now.slice(0, 10), now, detailsUpdate || 'Auto-created task']
    );
    return { taskId, newStatus, changes: 1, created: true };
  }

  if (detailsUpdate) {
    const { changes } = await sqlite.execRun(
      `UPDATE task_items
       SET status = ?, updated = ?, details = COALESCE(details, '') || '\n\n' || ?
       WHERE id = ?`,
      [newStatus, now, detailsUpdate, taskId]
    );
    return { taskId, newStatus, changes };
  } else {
    const { changes } = await sqlite.execRun(
      `UPDATE task_items
       SET status = ?, updated = ?
       WHERE id = ?`,
      [newStatus, now, taskId]
    );
    return { taskId, newStatus, changes };
  }
}

/**
 * Add a task dependency
 *
 * @param {string} taskId - Task that has dependency
 * @param {string} dependsOn - Task it depends on
 * @returns {Promise<{changes:number}>}
 */
export async function addTaskDependency(taskId, dependsOn) {
  const { changes } = await sqlite.execRun(
    `INSERT OR IGNORE INTO task_dependencies (task_id, depends_on)
     VALUES (?, ?)`,
    [taskId, dependsOn]
  );
  return { taskId, dependsOn, changes };
}

/**
 * Add task subtasks (checklist items)
 *
 * @param {string} taskId
 * @param {Array<{section:string|null,text:string,checked:boolean}>} subtasks
 * @returns {Promise<{inserted:number}>}
 */
export async function addTaskSubtasks(taskId, subtasks) {
  return sqlite.withTransaction(async () => {
    // Clear existing subtasks for this task
    await sqlite.execRun(
      `DELETE FROM task_subtasks WHERE task_id = ?`,
      [taskId]
    );

    let inserted = 0;
    for (let i = 0; i < subtasks.length; i++) {
      const st = subtasks[i];
      await sqlite.execRun(
        `INSERT INTO task_subtasks (task_id, section, position, text, checked)
         VALUES (?, ?, ?, ?, ?)`,
        [taskId, st.section || null, i, st.text, st.checked ? 1 : 0]
      );
      inserted++;
    }

    return { taskId, inserted };
  });
}

// ============================================================================
// SESSION MANAGEMENT
// ============================================================================

/**
 * Create a new session
 *
 * @param {Object} data
 * @param {string} data.session_date - YYYY-MM-DD
 * @param {string} data.session_period - morning, afternoon, evening, night
 * @param {string} [data.focus_task] - Task ID being focused on
 * @param {string} data.start_time - ISO timestamp
 * @param {string} [data.end_time] - ISO timestamp
 * @param {string} [data.status] - in_progress (default) or completed
 * @param {string} [data.notes] - Session notes
 * @returns {Promise<{sessionId:number}>}
 */
export async function createSession({ id = null, date, period, focus = null, status = 'active', content = '' }) {
  const sessionId = id || `sess-${date}-${period}-${Date.now()}`;
  await sqlite.execRun(
    `INSERT INTO sessions (id, date, period, focus, status, content)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [sessionId, date, period, focus, status, content]
  );
  return { sessionId };
}

/**
 * Mark a session as completed
 *
 * @param {number} sessionId
 * @param {string} [notes] - Additional notes to append
 * @returns {Promise<{changes:number}>}
 */
export async function completeSession(sessionId, notes = null) {
  if (notes) {
    const { changes } = await sqlite.execRun(
      `UPDATE sessions
       SET status = 'completed', content = COALESCE(content, '') || '\n\n' || ?
       WHERE id = ?`,
      [notes, sessionId]
    );
    return { sessionId, changes };
  } else {
    const { changes } = await sqlite.execRun(
      `UPDATE sessions
       SET status = 'completed'
       WHERE id = ?`,
      [sessionId]
    );
    return { sessionId, changes };
  }
}

/**
 * Update session cache (singleton row, always ID=1)
 *
 * @param {Object} data
 * @param {number} [data.current_session_id]
 * @param {string} [data.current_focus_task]
 * @param {number} [data.active_count]
 * @param {number} [data.paused_count]
 * @param {number} [data.completed_count]
 * @returns {Promise<{changes:number}>}
 */
export async function updateSessionCache({ current_session_id = null, current_focus_task = null, active_tasks_count = 0, paused_tasks_count = 0, completed_tasks_count = 0 }) {
  const now = new Date().toISOString();
  const { changes } = await sqlite.execRun(
    `INSERT INTO session_cache (session_id, status, focus_task, active_tasks_count, paused_tasks_count, completed_tasks_count, raw_content)
     VALUES ('current', 'active', ?, ?, ?, ?, ?)
     ON CONFLICT(session_id) DO UPDATE SET
       focus_task = excluded.focus_task,
       active_tasks_count = excluded.active_tasks_count,
       paused_tasks_count = excluded.paused_tasks_count,
       completed_tasks_count = excluded.completed_tasks_count,
       raw_content = excluded.raw_content`,
    [current_focus_task ?? null, active_tasks_count ?? 0, paused_tasks_count ?? 0, completed_tasks_count ?? 0, `updated ${now}`]
  );
  return { changes };
}

// ============================================================================
// ERROR LOGGING
// ============================================================================

/**
 * Log an error
 *
 * @param {Object} data
 * @param {string} data.timestamp - ISO timestamp
 * @param {string} [data.task_id]
 * @param {string} [data.file_path]
 * @param {string} data.error_message
 * @param {string} [data.cause]
 * @param {string} [data.fix_applied]
 * @returns {Promise<{errorId:number}>}
 */
export async function logError({ timestamp, task_id = null, file_path = null, error_message, cause = null, fix_applied = null }) {
  const { lastInsertRowid: errorId } = await sqlite.execRun(
    `INSERT INTO error_logs (timestamp, task_id, file_path, error_message, cause, fix_applied)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [timestamp, task_id, file_path, error_message, cause, fix_applied]
  );
  return { errorId };
}

// ============================================================================
// TRANSACTION AUDIT
// ============================================================================

/**
 * Log a database operation for audit trail
 *
 * @param {Object} data
 * @param {string} data.transaction_id - Unique ID
 * @param {string} data.operation_type - e.g. 'insert_entries', 'regenerate_text'
 * @param {string} [data.affected_tables]
 * @param {number} [data.row_count]
 * @param {string} data.status - success, failed, rolled_back
 * @param {string} [data.error_message]
 * @param {number} [data.duration_ms]
 * @returns {Promise<{logId:number}>}
 */
export async function logTransaction({ transaction_id, operation_type, affected_tables = null, row_count = null, status, error_message = null, duration_ms = null }) {
  const now = new Date().toISOString();
  const { lastInsertRowid: logId } = await sqlite.execRun(
    `INSERT INTO transaction_log (transaction_id, timestamp, operation_type, affected_tables, row_count, status, error_message, duration_ms)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [transaction_id, now, operation_type, affected_tables, row_count, status, error_message, duration_ms]
  );
  return { logId };
}

// ============================================================================
// HELPERS
// ============================================================================

/**
 * Compute ISO timestamp from date, time, timezone
 */
function computeTimestamp(date, time, timezone) {
  const tz = timezone ? ` ${timezone}` : '';
  const isoString = `${date}T${time}${tz}`;
  try {
    const d = new Date(isoString);
    return d.toISOString();
  } catch {
    return new Date().toISOString();
  }
}

/**
 * Get current task counts by status
 * Used to update session_cache automatically
 */
export async function getTaskCounts() {
  const rows = await sqlite.queryAll(
    `SELECT status, COUNT(*) as cnt FROM task_items GROUP BY status`
  );

  const counts = { active: 0, paused: 0, completed: 0, pending: 0 };
  for (const row of rows) {
    if (row.status === 'in_progress') counts.active = row.cnt;
    else if (row.status === 'paused') counts.paused = row.cnt;
    else if (row.status === 'completed') counts.completed = row.cnt;
    else if (row.status === 'pending') counts.pending = row.cnt;
  }
  return counts;
}

/**
 * Get all tasks with their subtasks
 */
export async function getTasksWithSubtasks() {
  const tasks = await sqlite.queryAll(
    `SELECT * FROM task_items ORDER BY id`
  );

  for (const task of tasks) {
    task.subtasks = await sqlite.queryAll(
      `SELECT section, text, checked FROM task_subtasks
       WHERE task_id = ? ORDER BY position`,
      [task.id]
    );
  }

  return tasks;
}

/**
 * Get all edit entries with modifications for a date range
 */
export async function getEditEntriesWithMods(dateFrom = null, dateTo = null) {
  let where = '';
  const params = [];

  if (dateFrom && dateTo) {
    where = 'WHERE date BETWEEN ? AND ?';
    params.push(dateFrom, dateTo);
  } else if (dateFrom) {
    where = 'WHERE date >= ?';
    params.push(dateFrom);
  } else if (dateTo) {
    where = 'WHERE date <= ?';
    params.push(dateTo);
  }

  const entries = await sqlite.queryAll(
    `SELECT * FROM edit_entries ${where} ORDER BY date DESC, time DESC`,
    params
  );

  for (const entry of entries) {
    entry.modifications = await sqlite.queryAll(
      `SELECT action, file_path, description FROM file_modifications
       WHERE edit_entry_id = ? ORDER BY id`,
      [entry.id]
    );
  }

  return entries;
}
