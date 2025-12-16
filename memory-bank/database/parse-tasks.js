#!/usr/bin/env node

import * as sqlite from './lib/sqlite.js';
import { readFileSync, readdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Initialize tasks schema
function initSchema(db) {
  await sqlite.exec(`
    PRAGMA foreign_keys = OFF;
    
    CREATE TABLE IF NOT EXISTS task_items (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      status TEXT NOT NULL CHECK(status IN ('pending','in_progress','completed','paused')),
      priority TEXT NOT NULL CHECK(priority IN ('low','medium','high')),
      started TEXT NOT NULL,
      updated TEXT,
      details TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS task_subtasks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      task_id TEXT NOT NULL,
      section TEXT,
      position INTEGER NOT NULL,
      text TEXT NOT NULL,
      checked INTEGER NOT NULL CHECK(checked IN (0, 1)),
      FOREIGN KEY(task_id) REFERENCES task_items(id) ON DELETE CASCADE
    );
    
    CREATE TABLE IF NOT EXISTS task_dependencies (
      task_id TEXT NOT NULL,
      depends_on TEXT NOT NULL,
      FOREIGN KEY(task_id) REFERENCES task_items(id) ON DELETE CASCADE,
      FOREIGN KEY(depends_on) REFERENCES task_items(id) ON DELETE CASCADE,
      PRIMARY KEY(task_id, depends_on)
    );
    
    PRAGMA foreign_keys = ON;
  `);
}

function normalizeStatus(statusCell) {
  const emojiMatch = String(statusCell || '').match(/[🔄✅⏸️❌⬜]/);
  const emoji = emojiMatch ? emojiMatch[0] : null;
  const text = String(statusCell || '').toLowerCase();

  if (emoji === '✅') return 'completed';
  if (emoji === '🔄') return 'in_progress';
  if (emoji === '⏸️') return 'paused';
  if (emoji === '⬜') return 'pending';
  if (emoji === '❌') return 'paused';

  if (text.includes('not started')) return 'pending';
  if (text.includes('in progress')) return 'in_progress';
  if (text.includes('complete')) return 'completed';

  return 'in_progress';
}

function normalizePriority(priorityCell) {
  const val = String(priorityCell || '').trim().toLowerCase();
  if (val === 'low' || val === 'medium' || val === 'high') return val;
  return 'medium';
}

function normalizeDate(dateCell) {
  const match = String(dateCell || '').match(/\d{4}-\d{2}-\d{2}/);
  return match ? match[0] : null;
}

function isLikelyTasksRow(cells) {
  if (!cells || cells.length < 3) return false;
  const id = String(cells[0] || '').trim();
  return /^(T\d+[a-z]?|META-\d+[a-z]?)$/i.test(id);
}

// Parse tasks table line
function parseTaskLine(line) {
  if (!line.startsWith('|')) return null;
  if (line.includes('|----')) return null;

  const cells = line
    .split('|')
    .slice(1, -1)
    .map(c => c.trim());

  if (!isLikelyTasksRow(cells)) return null;

  const id = String(cells[0]).trim();
  const title = String(cells[1] || '').trim();
  const status = normalizeStatus(cells[2]);
  const priority = normalizePriority(cells[3]);
  const started = normalizeDate(cells[4]);

  if (!started) return null;

  const col6 = String(cells[5] || '').trim();
  const col7 = String(cells[6] || '').trim();

  const deps = col6 === '-' || col6 === '' ? [] : col6.split(/\s*,\s*/).filter(Boolean);

  const isFilePath = /\.md\]?$/i.test(col6) || /^\[tasks\//i.test(col6);
  const details = isFilePath ? col6 : col7;

  return {
    id,
    title,
    status,
    priority,
    started,
    dependencies: isFilePath ? [] : deps,
    details: (details || '').trim()
  };
}

// Parse entire tasks.md content
function parseTasks(content) {
  return content.split('\n')
    .map(parseTaskLine)
    .filter(Boolean);
}

// Insert tasks into database
function populateDatabase(db, tasks) {
  console.log(`Populating database with ${tasks.length} tasks...\n`);

  const insertTask = sqlite.prepare(`
    INSERT OR IGNORE INTO task_items (id, title, status, priority, started, updated, details)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);
  
  const insertDependency = sqlite.prepare(`
    INSERT OR IGNORE INTO task_dependencies (task_id, depends_on)
    VALUES (?, ?)
  `);

  const insertSubtask = sqlite.prepare(`
    INSERT INTO task_subtasks (task_id, section, position, text, checked)
    VALUES (?, ?, ?, ?, ?)
  `);
  
  // Disable foreign keys temporarily
  db.pragma('foreign_keys = OFF');
  
  let successCount = 0;
  let errorCount = 0;
  
  // Insert all tasks first
  sqlite.transaction(() => {
    tasks.forEach(task => {
      try {
        insertTask.run(
          task.id,
          task.title,
          task.status,
          task.priority,
          task.started,
          task.started, // Default updated to started date
          task.details
        );
        successCount++;
        console.log(`✓ ${task.id} - ${task.status} - ${task.title.substring(0, 50)}${task.title.length > 50 ? '...' : ''}`);
      } catch (error) {
        errorCount++;
        console.error(`✗ Failed to insert task ${task.id}: ${error.message}`);
      }
    });
  })();
  
  // Then insert dependencies
  sqlite.transaction(() => {
    tasks.forEach(task => {
      task.dependencies.forEach(depId => {
        try {
          insertDependency.run(task.id, depId);
        } catch (error) {
          console.warn(`  ⚠️  Could not create dependency ${task.id} -> ${depId}: ${error.message}`);
        }
      });
    });
  })();

  // Then insert subtasks (from task files)
  const subtasks = parseTaskSubtasks();
  sqlite.transaction(() => {
    subtasks.forEach(st => {
      try {
        insertSubtask.run(st.taskId, st.section, st.position, st.text, st.checked);
      } catch (error) {
        // Ignore subtasks referencing tasks that aren't in task_items
      }
    });
  })();
  
  // Re-enable foreign keys
  db.pragma('foreign_keys = ON');
  
  console.log(`\n✓ Successfully inserted ${successCount} tasks`);
  if (errorCount > 0) {
    console.log(`✗ Failed to insert ${errorCount} tasks`);
  }
}

function parseTaskSubtasks() {
  const tasksDir = join(__dirname, '..', 'tasks');
  let files = [];

  try {
    files = readdirSync(tasksDir).filter(f => f.endsWith('.md'));
  } catch (e) {
    return [];
  }

  const results = [];
  for (const file of files) {
    const taskId = file.replace(/\.md$/i, '');
    const filePath = join(tasksDir, file);
    const content = readFileSync(filePath, 'utf-8');
    let section = null;
    let position = 0;

    for (const line of content.split('\n')) {
      const headingMatch = line.match(/^#{1,6}\s+(.+)\s*$/);
      if (headingMatch) {
        section = headingMatch[1].trim();
        continue;
      }

      const checkMatch = line.match(/^\s*-\s*\[( |x|X)\]\s+(.+)\s*$/);
      if (checkMatch) {
        position += 1;
        results.push({
          taskId,
          section,
          position,
          text: checkMatch[2].trim(),
          checked: checkMatch[1].toLowerCase() === 'x' ? 1 : 0
        });
      }
    }
  }

  return results;
}

export function parseTasksFile(content) {
  return parseTasks(content);
}

// Add before main()
function runTests() {
  const testCases = [
    {
      name: "Should parse task line",
      input: "| T20 | Test Task | 🔄 | HIGH | 2025-11-12 | T1,T2 | Details |",
      expected: {
        id: "T20",
        title: "Test Task",
        status: "in_progress",
        priority: "high",
        started: "2025-11-12",
        dependencies: ["T1","T2"],
        details: "Details"
      }
    },
    {
      name: "Should handle empty dependencies",
      input: "| T1 | Another Task | ✅ | LOW | 2025-11-10 | - | More details |",
      expected: {
        dependencies: []
      }
    }
  ];

  let passed = 0;
  testCases.forEach(test => {
    const result = parseTaskLine(test.input);
    const valid = Object.entries(test.expected).every(([key, val]) => 
      JSON.stringify(result[key]) === JSON.stringify(val)
    );
    
    if (valid) passed++;
    else console.error(`✗ ${test.name}`);
  });

  console.log(`Tests: ${passed}/${testCases.length} passed`);
  return passed === testCases.length;
}

// Update main()
async function main() {
  if (process.argv.includes('--test')) {
    process.exit(runTests() ? 0 : 1);
  }

  try {
    console.log('Tasks Parser for Memory Bank\n');
    console.log('=====================================\n');

    const tasksPath = join(__dirname, '..', 'tasks.md');
    console.log(`Reading: ${tasksPath}\n`);

    const content = readFileSync(tasksPath, 'utf-8');
    
    // Clear existing task tables
    console.log('Clearing existing task data...\n');
    const dbPath = join(__dirname, 'memory_bank.db');
    await sqlite.openDb(dbPath);
    
    await sqlite.exec('DROP TABLE IF EXISTS task_dependencies');
    await sqlite.exec('DROP TABLE IF EXISTS task_subtasks');
    await sqlite.exec('DROP TABLE IF EXISTS task_items');
    
    initSchema(db);
    console.log('✓ Database schema initialized\n');

    console.log('Parsing tasks...\n');
    const tasks = parseTasks(content);
    console.log(`Found ${tasks.length} tasks\n`);

    if (tasks.length === 0) {
      console.log('No tasks found to process.');
      await sqlite.closeDb();
      return;
    }

    populateDatabase(db, tasks);
    
    console.log('\n=====================================');
    console.log('Database Statistics:\n');
    
    const totalTasks = sqlite.prepare('SELECT COUNT(*) as count FROM task_items').get().count;
    const totalDeps = sqlite.prepare('SELECT COUNT(*) as count FROM task_dependencies').get().count;
    
    console.log(`Total Tasks: ${totalTasks}`);
    console.log(`Total Dependencies: ${totalDeps}`);
    
    console.log('\n✓ Tasks database updated successfully!');
    console.log('Database file: memory_bank.db\n');
    
    await sqlite.closeDb();
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

main();
