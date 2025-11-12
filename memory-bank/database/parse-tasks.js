#!/usr/bin/env node

import Database from 'better-sqlite3';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Initialize tasks schema
function initSchema(db) {
  db.exec(`
    PRAGMA foreign_keys = OFF;
    
    CREATE TABLE IF NOT EXISTS task_items (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      status TEXT NOT NULL CHECK(status IN ('pending','in_progress','completed','paused')),
      priority TEXT NOT NULL CHECK(priority IN ('low','medium','high')),
      started TEXT NOT NULL,
      details TEXT NOT NULL
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

// Parse tasks table line
function parseTaskLine(line) {
  // Regex matches task rows with flexible column count (6-8 columns)
  // Handles rows with or without extra details column
  const match = line.match(/^\|\s+(T\d+)\s+\|\s+(.+?)\s+\|\s+(🔄|✅|⏸️|\(.*?\))\s+\|\s+(LOW|MEDIUM|HIGH)\s+\|\s+(\d{4}-\d{2}-\d{2})\s+\|\s+([^|]*?)(?:\s+\|\s+(.+?))?\s*\|$/);
  if (!match) return null;
  
  // Extract status, handling cases like "🔄 (70%)" or "🔄"
  let statusStr = match[3].trim();
  const statusMatch = statusStr.match(/(🔄|✅|⏸️)/);
  const status = statusMatch ? statusMatch[1] : '🔄';
  
  // Handle empty dependencies
  const deps = match[6].trim() === '-' || !match[6] ? [] : 
    match[6].trim().split(/\s*,\s*/).filter(Boolean);
  
  return {
    id: match[1],
    title: match[2].trim(),
    status: status === '🔄' ? 'in_progress' : 
           status === '✅' ? 'completed' : 'paused',
    priority: match[4].toLowerCase(),
    started: match[5],
    dependencies: deps,
    details: (match[7] || '').trim()
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

  const insertTask = db.prepare(`
    INSERT OR IGNORE INTO task_items (id, title, status, priority, started, details)
    VALUES (?, ?, ?, ?, ?, ?)
  `);
  
  const insertDependency = db.prepare(`
    INSERT OR IGNORE INTO task_dependencies (task_id, depends_on)
    VALUES (?, ?)
  `);
  
  // Disable foreign keys temporarily
  db.pragma('foreign_keys = OFF');
  
  let successCount = 0;
  let errorCount = 0;
  
  // Insert all tasks first
  db.transaction(() => {
    tasks.forEach(task => {
      try {
        insertTask.run(
          task.id,
          task.title,
          task.status,
          task.priority,
          task.started,
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
  db.transaction(() => {
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
  
  // Re-enable foreign keys
  db.pragma('foreign_keys = ON');
  
  console.log(`\n✓ Successfully inserted ${successCount} tasks`);
  if (errorCount > 0) {
    console.log(`✗ Failed to insert ${errorCount} tasks`);
  }
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
function main() {
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
    const db = new Database(dbPath);
    
    db.exec('DROP TABLE IF EXISTS task_dependencies');
    db.exec('DROP TABLE IF EXISTS task_items');
    
    initSchema(db);
    console.log('✓ Database schema initialized\n');

    console.log('Parsing tasks...\n');
    const tasks = parseTasks(content);
    console.log(`Found ${tasks.length} tasks\n`);

    if (tasks.length === 0) {
      console.log('No tasks found to process.');
      db.close();
      return;
    }

    populateDatabase(db, tasks);
    
    console.log('\n=====================================');
    console.log('Database Statistics:\n');
    
    const totalTasks = db.prepare('SELECT COUNT(*) as count FROM task_items').get().count;
    const totalDeps = db.prepare('SELECT COUNT(*) as count FROM task_dependencies').get().count;
    
    console.log(`Total Tasks: ${totalTasks}`);
    console.log(`Total Dependencies: ${totalDeps}`);
    
    console.log('\n✓ Tasks database updated successfully!');
    console.log('Database file: memory_bank.db\n');
    
    db.close();
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

main();
