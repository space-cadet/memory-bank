import { openDb } from './lib/sqlite.js';
import { regenerateAll } from './lib/regenerate.js';

await openDb('./memory_bank.db');

await regenerateAll({
  editHistory: '../edit_history.md',
  tasks: '../tasks.md',
  sessionCache: '../session_cache.md',
  tasksDir: '../tasks',
  sessionsDir: '../sessions',
  editsDir: '../edits'
});
console.log('Regeneration complete');
