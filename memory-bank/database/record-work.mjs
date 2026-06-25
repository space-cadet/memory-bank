import { recordSessionWork } from './lib/workflow.js';

const result = await recordSessionWork({
  task_id: 'T21',
  task_description: 'Fixed three template-level issues in DB-native workflow: (1) added missing task_subtasks table to schema.sql, (2) changed all parsers from DROP TABLE to DELETE FROM to preserve schema columns, (3) switched init-schema.js from better-sqlite3 to sql.js for VPS compatibility. All verified with full parse→regenerate cycle.',
  files_modified: [
    { action: 'Modified', path: 'database/schema.sql', description: 'Added CREATE TABLE task_subtasks + index (lines 45-55)' },
    { action: 'Modified', path: 'database/parse-tasks.js', description: 'DROP TABLE → DELETE FROM for task tables' },
    { action: 'Modified', path: 'database/parse-edits.js', description: 'DROP TABLE → DELETE FROM for edit tables' },
    { action: 'Modified', path: 'database/parse-sessions.js', description: 'DROP TABLE → DELETE FROM for sessions table' },
    { action: 'Modified', path: 'database/parse-session-cache.js', description: 'DROP TABLE → DELETE FROM for session_cache table' },
    { action: 'Modified', path: 'database/init-schema.js', description: 'Switched from better-sqlite3 to sql.js via lib/sqlite.js' }
  ],
  task_status: 'in_progress',
  session_period: 'morning',
  session_notes: 'These fixes address template-level issues affecting all projects using mb-core DB-native workflow. Commit: 08741cb.',
  output_dir: '../',
  tasks_dir: '../tasks',
  sessions_dir: '../sessions',
  edits_dir: '../edits'
});

console.log('Result:', JSON.stringify(result, null, 2));
