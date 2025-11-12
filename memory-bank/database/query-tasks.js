#!/usr/bin/env node

import Database from 'better-sqlite3';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const db = new Database(join(__dirname, 'memory_bank.db'));

console.log('Tasks in database:');
const tasks = db.prepare('SELECT * FROM tasks ORDER BY started DESC').all();

tasks.forEach(task => {
  console.log(`
${task.id}: ${task.title}`);
  console.log(`Status: ${task.status} | Priority: ${task.priority}`);
  
  const deps = db.prepare(
    'SELECT depends_on FROM task_dependencies WHERE task_id = ?'
  ).all(task.id);
  
  if (deps.length > 0) {
    console.log(`Depends on: ${deps.map(d => d.depends_on).join(', ')}`);
  }
});

db.close();
