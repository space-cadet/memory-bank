#!/usr/bin/env node

/**
 * Query Script for Edit History Database
 * Provides interactive queries and views for the SQLite database
 */

import Database from 'better-sqlite3';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * Display all entries
 */
function showAllEntries(db, limit = 20) {
  const entries = db.prepare(`
    SELECT id, date, time, timezone, task_id, task_description
    FROM edit_entries
    ORDER BY date DESC, time DESC
    LIMIT ?
  `).all(limit);

  console.log(`\n📋 Last ${limit} Edit Entries:\n`);
  console.log('─'.repeat(100));

  for (const entry of entries) {
    console.log(`ID: ${entry.id}`);
    console.log(`Date: ${entry.date} ${entry.time} ${entry.timezone}`);
    console.log(`Task: ${entry.task_id || 'N/A'}`);
    console.log(`Description: ${entry.task_description}`);
    console.log('─'.repeat(100));
  }
}

/**
 * Show entries by task ID
 */
function showEntriesByTask(db, taskId) {
  const entries = db.prepare(`
    SELECT id, date, time, timezone, task_description
    FROM edit_entries
    WHERE task_id LIKE ?
    ORDER BY date DESC, time DESC
  `).all(`%${taskId}%`);

  console.log(`\n📋 Entries for Task "${taskId}":\n`);
  console.log('─'.repeat(100));

  for (const entry of entries) {
    console.log(`ID: ${entry.id}`);
    console.log(`Date: ${entry.date} ${entry.time} ${entry.timezone}`);
    console.log(`Description: ${entry.task_description}`);

    // Show modifications for this entry
    const mods = db.prepare(`
      SELECT action, file_path, description
      FROM edit_modifications
      WHERE edit_entry_id = ?
    `).all(entry.id);

    if (mods.length > 0) {
      console.log('Files:');
      for (const mod of mods) {
        console.log(`  - ${mod.action} \`${mod.file_path}\``);
      }
    }

    console.log('─'.repeat(100));
  }

  console.log(`\nTotal entries: ${entries.length}\n`);
}

/**
 * Show file modifications
 */
function showFileModifications(db, searchTerm = null, limit = 30) {
  let query = `
    SELECT fm.id, fm.action, fm.file_path, fm.description,
           ee.date, ee.time, ee.task_id
    FROM edit_modifications fm
    JOIN edit_entries ee ON fm.edit_entry_id = ee.id
  `;

  let params = [];

  if (searchTerm) {
    query += ` WHERE fm.file_path LIKE ?`;
    params.push(`%${searchTerm}%`);
  }

  query += ` ORDER BY ee.date DESC, ee.time DESC LIMIT ?`;
  params.push(limit);

  const mods = db.prepare(query).all(...params);

  const title = searchTerm
    ? `📁 File Modifications matching "${searchTerm}"`
    : `📁 Recent File Modifications (${limit})`;

  console.log(`\n${title}:\n`);
  console.log('─'.repeat(100));

  for (const mod of mods) {
    console.log(`Date: ${mod.date} ${mod.time} | Task: ${mod.task_id || 'N/A'}`);
    console.log(`Action: ${mod.action}`);
    console.log(`File: ${mod.file_path}`);
    console.log(`Description: ${mod.description}`);
    console.log('─'.repeat(100));
  }

  console.log(`\nTotal modifications: ${mods.length}\n`);
}

/**
 * Show statistics
 */
function showStatistics(db) {
  console.log('\n📊 Database Statistics:\n');
  console.log('─'.repeat(100));

  // Total counts
  const totalEntries = db.prepare('SELECT COUNT(*) as count FROM edit_entries').get().count;
  const totalMods = db.prepare('SELECT COUNT(*) as count FROM edit_modifications').get().count;
  
  let totalTasks = 0;
  try {
    totalTasks = db.prepare('SELECT COUNT(*) as count FROM task_items').get().count;
  } catch (e) {
    // task_items table may not exist yet
  }

  console.log(`Total Edit Entries: ${totalEntries}`);
  console.log(`Total File Modifications: ${totalMods}`);
  if (totalTasks > 0) {
    console.log(`Total Tasks: ${totalTasks}`);
  }
  console.log('');

  // Entries by task
  const taskCounts = db.prepare(`
    SELECT task_id, COUNT(*) as count
    FROM edit_entries
    WHERE task_id IS NOT NULL
    GROUP BY task_id
    ORDER BY count DESC
  `).all();

  console.log('Entries by Task:');
  for (const tc of taskCounts) {
    console.log(`  ${tc.task_id}: ${tc.count} entries`);
  }
  console.log('');

  // Action types
  const actionCounts = db.prepare(`
    SELECT action, COUNT(*) as count
    FROM edit_modifications
    GROUP BY action
    ORDER BY count DESC
  `).all();

  console.log('File Actions:');
  for (const ac of actionCounts) {
    console.log(`  ${ac.action}: ${ac.count} files`);
  }
  console.log('');

  // Most modified files
  const topFiles = db.prepare(`
    SELECT file_path, COUNT(*) as count
    FROM edit_modifications
    GROUP BY file_path
    ORDER BY count DESC
    LIMIT 10
  `).all();

  console.log('Top 10 Most Modified Files:');
  for (const tf of topFiles) {
    console.log(`  ${tf.count}x - ${tf.file_path}`);
  }

  console.log('─'.repeat(100));
  console.log('');
}

/**
 * Show entries by date range
 */
function showEntriesByDate(db, startDate, endDate = null) {
  let query = `
    SELECT id, date, time, timezone, task_id, task_description
    FROM edit_entries
    WHERE date >= ?
  `;

  const params = [startDate];

  if (endDate) {
    query += ` AND date <= ?`;
    params.push(endDate);
  }

  query += ` ORDER BY date DESC, time DESC`;

  const entries = db.prepare(query).all(...params);

  const title = endDate
    ? `📅 Entries from ${startDate} to ${endDate}`
    : `📅 Entries since ${startDate}`;

  console.log(`\n${title}:\n`);
  console.log('─'.repeat(100));

  for (const entry of entries) {
    console.log(`${entry.date} ${entry.time} - ${entry.task_id || 'N/A'}: ${entry.task_description}`);
  }

  console.log('─'.repeat(100));
  console.log(`\nTotal entries: ${entries.length}\n`);
}

/**
 * Main menu
 */
function showMenu() {
  console.log('\n╔════════════════════════════════════════╗');
  console.log('║   Edit History Database Query Tool    ║');
  console.log('╚════════════════════════════════════════╝\n');
  console.log('Available commands:');
  console.log('  node query.js stats              - Show database statistics');
  console.log('  node query.js all [limit]        - Show all entries (default limit: 20)');
  console.log('  node query.js task <task_id>     - Show entries for specific task');
  console.log('  node query.js files [search]     - Show file modifications (optionally search)');
  console.log('  node query.js date <YYYY-MM-DD>  - Show entries since date');
  console.log('');
  console.log('Examples:');
  console.log('  node query.js stats');
  console.log('  node query.js all 50');
  console.log('  node query.js task T3');
  console.log('  node query.js files schema.prisma');
  console.log('  node query.js date 2025-11-01');
  console.log('');
}

/**
 * Main function
 */
function main() {
  const args = process.argv.slice(2);
  const command = args[0];

  const dbPath = join(__dirname, 'memory_bank.db');

  try {
    const db = new Database(dbPath, { readonly: true });

    if (!command || command === 'help') {
      showMenu();
    } else if (command === 'stats') {
      showStatistics(db);
    } else if (command === 'all') {
      const limit = parseInt(args[1]) || 20;
      showAllEntries(db, limit);
    } else if (command === 'task') {
      const taskId = args[1];
      if (!taskId) {
        console.error('Error: Please specify a task ID');
        console.log('Usage: node query.js task <task_id>');
        process.exit(1);
      }
      showEntriesByTask(db, taskId);
    } else if (command === 'files') {
      const searchTerm = args[1] || null;
      const limit = parseInt(args[2]) || 30;
      showFileModifications(db, searchTerm, limit);
    } else if (command === 'date') {
      const startDate = args[1];
      const endDate = args[2] || null;
      if (!startDate) {
        console.error('Error: Please specify a start date');
        console.log('Usage: node query.js date <YYYY-MM-DD> [end-date]');
        process.exit(1);
      }
      showEntriesByDate(db, startDate, endDate);
    } else {
      console.error(`Unknown command: ${command}`);
      showMenu();
    }

    db.close();

  } catch (error) {
    if (error.code === 'SQLITE_CANTOPEN') {
      console.error('\n❌ Database file not found!');
      console.error('Please run the parsers first:');
      console.error('  node parse-sqlite.js');
      console.error('  node parse-tasks.js\n');
    } else {
      console.error('Error:', error.message);
    }
    process.exit(1);
  }
}

main();
