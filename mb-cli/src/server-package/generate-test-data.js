#!/usr/bin/env node

/**
 * Generate Synthetic Test Data for Phase A Schema
 * Creates realistic test data based on actual memory bank structure
 * Output: Returns data object suitable for test-schema.js consumption
 */

/**
 * Generate task items matching actual task registry structure
 */
function generateTasks() {
  return [
    {
      id: 'T1',
      title: 'Multi-task Support',
      status: 'in_progress',
      priority: 'HIGH',
      started: '2025-04-14',
      details: 'Implement multi-task tracking and management across memory bank'
    },
    {
      id: 'T3',
      title: 'Implement DB Migration',
      status: 'paused',
      priority: 'HIGH',
      started: '2025-04-15',
      details: 'Database migration with verification. Superseded by T20 (2025-11-12)'
    },
    {
      id: 'T13',
      title: 'Implement Memory Bank CLI',
      status: 'in_progress',
      priority: 'HIGH',
      started: '2025-05-17',
      details: 'CLI for memory bank with init, task, session commands. 85% complete'
    },
    {
      id: 'T19',
      title: 'Memory Bank Viewer Web Interface',
      status: 'in_progress',
      priority: 'HIGH',
      started: '2025-11-10',
      details: 'Single-file HTML viewer with dual file discovery approaches'
    },
    {
      id: 'T20',
      title: 'Memory Bank Database Parser',
      status: 'in_progress',
      priority: 'MEDIUM',
      started: '2025-11-12',
      details: 'Parser for memory bank markdown files with unified database integration'
    },
    {
      id: 'T21',
      title: 'Database-Native Memory Bank Update Workflow',
      status: 'in_progress',
      priority: 'HIGH',
      started: '2025-11-13',
      details: 'Database-first paradigm shift. DB becomes authoritative, text files generated output'
    },
    {
      id: 'T18',
      title: 'Integrated Rules Redesign',
      status: 'completed',
      priority: 'HIGH',
      started: '2025-07-14',
      details: 'Comprehensive redesign for clarity and conciseness'
    }
  ];
}

/**
 * Generate task dependencies
 */
function generateTaskDependencies() {
  return [
    { task_id: 'T13', depends_on: 'T12' },
    { task_id: 'T20', depends_on: 'T3' },
    { task_id: 'T21', depends_on: 'T20' },
    { task_id: 'T21', depends_on: 'T20a' },
    { task_id: 'T21', depends_on: 'T13' },
    { task_id: 'T18', depends_on: 'T17' }
  ];
}

/**
 * Generate edit entries with timestamps matching IST format
 */
function generateEditEntries() {
  return [
    {
      date: '2025-11-13',
      time: '18:46:25',
      timezone: 'IST',
      timestamp: '2025-11-13T18:46:25+05:30',
      task_id: 'META-1',
      task_description: 'Memory Bank Update and Maintenance - Documentation Refresh'
    },
    {
      date: '2025-11-13',
      time: '18:31:12',
      timezone: 'IST',
      timestamp: '2025-11-13T18:31:12+05:30',
      task_id: 'T21',
      task_description: 'Phase A Schema Expansion Complete - Isolated Workspace Created'
    },
    {
      date: '2025-11-13',
      time: '17:48:20',
      timezone: 'IST',
      timestamp: '2025-11-13T17:48:20+05:30',
      task_id: 'T21',
      task_description: 'Database-Native Memory Bank Update Workflow - Design Phase Complete'
    },
    {
      date: '2025-11-12',
      time: '17:25:21',
      timezone: 'IST',
      timestamp: '2025-11-12T17:25:21+05:30',
      task_id: 'T20a',
      task_description: 'Adaptive LLM-Based Format Parser System - Design Phase Complete'
    },
    {
      date: '2025-11-12',
      time: '16:13:21',
      timezone: 'IST',
      timestamp: '2025-11-12T16:13:21+05:30',
      task_id: 'T20',
      task_description: 'Unified Database Integration and Parser Rename'
    },
    {
      date: '2025-11-11',
      time: '19:43:25',
      timezone: 'IST',
      timestamp: '2025-11-11T19:43:25+05:30',
      task_id: 'T3,T13',
      task_description: 'Real-World Integration Testing and Schema Validation'
    },
    {
      date: '2025-11-11',
      time: '18:24:10',
      timezone: 'IST',
      timestamp: '2025-11-11T18:24:10+05:30',
      task_id: 'T3,T13',
      task_description: 'Selective Initialization System and Updated Memory Bank'
    },
    {
      date: '2025-11-10',
      time: '19:15:38',
      timezone: 'IST',
      timestamp: '2025-11-10T19:15:38+05:30',
      task_id: 'T19',
      task_description: 'Memory Bank Viewer Planning and Documentation'
    }
  ];
}

/**
 * Generate file modifications linked to edit entries
 */
function generateFileModifications() {
  return [
    // Entry 1 (META-1, 2025-11-13 18:46:25)
    { edit_entry_index: 0, action: 'Updated', file_path: 'memory-bank/progress.md', description: 'Comprehensive November 2025 update with T13-T21 tasks' },
    { edit_entry_index: 0, action: 'Updated', file_path: 'memory-bank/changelog.md', description: 'Added November 2025 entries for T21, T20a, T20, T19' },
    { edit_entry_index: 0, action: 'Updated', file_path: 'memory-bank/.cursorrules', description: 'Added operational implementation section' },
    { edit_entry_index: 0, action: 'Updated', file_path: 'README.md', description: 'Complete rewrite with project structure and current status' },

    // Entry 2 (T21, 2025-11-13 18:31:12)
    { edit_entry_index: 1, action: 'Created', file_path: 'memory-bank/database/schema.sql', description: 'Database schema with table definitions and indexes' },
    { edit_entry_index: 1, action: 'Created', file_path: 'memory-bank/database/init-schema.js', description: 'better-sqlite3 initialization script' },
    { edit_entry_index: 1, action: 'Updated', file_path: 'memory-bank/tasks/T21.md', description: 'Updated timestamps and Phase A completion status' },

    // Entry 3 (T21, 2025-11-13 17:48:20)
    { edit_entry_index: 2, action: 'Created', file_path: 'memory-bank/implementation-details/database-update-workflow-plan.md', description: 'Comprehensive workflow design with 4 phases' },
    { edit_entry_index: 2, action: 'Created', file_path: 'memory-bank/tasks/T21.md', description: 'New task file for database-native workflow' },
    { edit_entry_index: 2, action: 'Updated', file_path: 'memory-bank/tasks.md', description: 'Added T21 to active tasks' },

    // Entry 4 (T20a, 2025-11-12 17:25:21)
    { edit_entry_index: 3, action: 'Created', file_path: 'memory-bank/tasks/T20a.md', description: 'New task file with design phase completion' },
    { edit_entry_index: 3, action: 'Created', file_path: 'memory-bank/implementation-details/adaptive-parser-plan.md', description: 'Three-phase system design' },
    { edit_entry_index: 3, action: 'Updated', file_path: 'memory-bank/tasks.md', description: 'Added T20a to active tasks registry' },

    // Entry 5 (T20, 2025-11-12 16:13:21)
    { edit_entry_index: 4, action: 'Updated', file_path: 'memory-bank/database/parse-edits.js', description: 'Changed database to memory_bank.db' },
    { edit_entry_index: 4, action: 'Updated', file_path: 'memory-bank/database/parse-tasks.js', description: 'Unified database integration' },
    { edit_entry_index: 4, action: 'Updated', file_path: 'memory-bank/tasks/T20.md', description: 'Added Phase 3 progress details' },

    // Entry 6 (T3,T13, 2025-11-11 19:43:25)
    { edit_entry_index: 5, action: 'Updated', file_path: 'tasks/T3.md', description: 'Real-world integration testing results' },
    { edit_entry_index: 5, action: 'Updated', file_path: 'tasks/T13.md', description: 'Real-world testing in production scenario' },

    // Entry 7 (T3,T13, 2025-11-11 18:24:10)
    { edit_entry_index: 6, action: 'Updated', file_path: 'mb-cli/src/commands/init.js', description: 'Selective initialization system' },
    { edit_entry_index: 6, action: 'Updated', file_path: 'tasks/T3.md', description: 'Updated timezone and selective init status' },
    { edit_entry_index: 6, action: 'Updated', file_path: 'tasks/T13.md', description: 'Marked as 85% complete' },

    // Entry 8 (T19, 2025-11-10 19:15:38)
    { edit_entry_index: 7, action: 'Created', file_path: 'viewer/viewer.html', description: 'Single-file HTML application (1158 lines)' },
    { edit_entry_index: 7, action: 'Created', file_path: 'viewer/README.md', description: 'Comprehensive documentation' },
    { edit_entry_index: 7, action: 'Updated', file_path: 'tasks/T19.md', description: 'Marked Phase 1 completion' }
  ];
}

/**
 * Generate sessions matching your session structure
 */
function generateSessions() {
  return [
    {
      session_date: '2025-11-13',
      session_period: 'evening',
      focus_task: 'T21',
      start_time: '2025-11-13T17:29:35Z',
      end_time: null,
      status: 'in_progress',
      notes: 'T21: Database-native memory bank update workflow, paradigm shift to DB-authoritative, schema design'
    },
    {
      session_date: '2025-11-12',
      session_period: 'afternoon',
      focus_task: 'T20',
      start_time: '2025-11-12T14:00:00Z',
      end_time: '2025-11-12T17:00:00Z',
      status: 'completed',
      notes: 'T20: Memory Bank Database Parser implementation (Phase 1 complete)'
    },
    {
      session_date: '2025-11-11',
      session_period: 'evening',
      focus_task: 'T3',
      start_time: '2025-11-11T17:00:00Z',
      end_time: '2025-11-11T19:45:00Z',
      status: 'completed',
      notes: 'T3 Database Migration Verification & Documentation'
    },
    {
      session_date: '2025-11-10',
      session_period: 'evening',
      focus_task: 'T19',
      start_time: '2025-11-10T18:00:00Z',
      end_time: '2025-11-10T19:30:00Z',
      status: 'completed',
      notes: 'T19: Memory Bank Viewer Planning and Documentation'
    }
  ];
}

/**
 * Generate session cache snapshot
 */
function generateSessionCache() {
  return {
    current_session_id: 1,
    current_focus_task: 'T21',
    active_count: 11,
    paused_count: 0,
    completed_count: 7,
    last_updated: '2025-11-13T18:46:25Z'
  };
}

/**
 * Generate error logs
 */
function generateErrorLogs() {
  return [
    {
      timestamp: '2025-11-11T18:00:00Z',
      task_id: 'T3',
      file_path: 'memory-bank/database/migration-scripts/convert.js',
      error_message: 'Timezone abbreviation parsing failed for IST format',
      cause: 'extractDate() function did not handle timezone abbreviations',
      fix_applied: 'Modified extractDate() to strip timezone abbreviations before parsing'
    },
    {
      timestamp: '2025-11-11T17:30:00Z',
      task_id: 'T13',
      file_path: 'mb-cli/src/commands/init.js',
      error_message: 'Schema field mismatch: rootPath vs path',
      cause: 'Prisma model field names inconsistent with convert.js',
      fix_applied: 'Updated schema field references to use consistent naming'
    },
    {
      timestamp: '2025-11-12T16:00:00Z',
      task_id: 'T20',
      file_path: 'memory-bank/database/parse-tasks.js',
      error_message: 'Foreign key constraint on task_items table',
      cause: 'Attempted to insert task with non-existent dependency',
      fix_applied: 'Implemented dependency validation before insert'
    }
  ];
}

/**
 * Main export: all test data as single object
 */
export function generateAllTestData() {
  const tasks = generateTasks();
  const dependencies = generateTaskDependencies();
  const editEntries = generateEditEntries();
  const fileModifications = generateFileModifications();
  const sessions = generateSessions();
  const sessionCache = generateSessionCache();
  const errorLogs = generateErrorLogs();

  return {
    tasks,
    dependencies,
    editEntries,
    fileModifications,
    sessions,
    sessionCache,
    errorLogs,
    metadata: {
      generated_at: new Date().toISOString(),
      total_tasks: tasks.length,
      total_edit_entries: editEntries.length,
      total_file_modifications: fileModifications.length,
      total_sessions: sessions.length,
      total_errors: errorLogs.length
    }
  };
}

/**
 * Export individual generators for flexibility
 */
export {
  generateTasks,
  generateTaskDependencies,
  generateEditEntries,
  generateFileModifications,
  generateSessions,
  generateSessionCache,
  generateErrorLogs
};

// If run directly (not imported), display summary
if (import.meta.url === `file://${process.argv[1]}`) {
  const data = generateAllTestData();
  console.log('\n📊 Test Data Generation Summary\n');
  console.log(`Generated: ${data.metadata.generated_at}`);
  console.log(`Tasks: ${data.metadata.total_tasks}`);
  console.log(`Edit Entries: ${data.metadata.total_edit_entries}`);
  console.log(`File Modifications: ${data.metadata.total_file_modifications}`);
  console.log(`Sessions: ${data.metadata.total_sessions}`);
  console.log(`Error Logs: ${data.metadata.total_errors}`);
  console.log('\n✅ Data generation complete. Import into test-schema.js\n');
}
