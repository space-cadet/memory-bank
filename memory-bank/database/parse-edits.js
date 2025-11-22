#!/usr/bin/env node

/**
 * Edit History Parser - SQLite Version
 * Parses memory-bank/edit_history.md and populates a SQLite database
 * Can be viewed using any SQLite viewer or via the included query script
 */

import Database from 'better-sqlite3';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * Initialize the database schema
 */
function initDatabase(db) {
  // Create tables
  db.exec(`
    CREATE TABLE IF NOT EXISTS edit_entries (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      date TEXT NOT NULL,
      time TEXT NOT NULL,
      timezone TEXT NOT NULL,
      timestamp TEXT NOT NULL,
      task_id TEXT,
      task_description TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS file_modifications (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      edit_entry_id INTEGER NOT NULL,
      date TEXT NOT NULL, -- Denormalized for easier sorting/querying
      action TEXT NOT NULL,
      file_path TEXT NOT NULL,
      description TEXT NOT NULL,
      FOREIGN KEY (edit_entry_id) REFERENCES edit_entries(id) ON DELETE CASCADE
    );

    CREATE INDEX IF NOT EXISTS idx_edit_entries_date ON edit_entries(date);
    CREATE INDEX IF NOT EXISTS idx_edit_entries_task_id ON edit_entries(task_id);
    CREATE INDEX IF NOT EXISTS idx_file_modifications_file_path ON file_modifications(file_path);
    CREATE INDEX IF NOT EXISTS idx_file_modifications_edit_entry_id ON file_modifications(edit_entry_id);
  `);

  // Create view that joins entries with modifications
  db.exec(`
    CREATE VIEW IF NOT EXISTS edit_entry_modifications AS
    SELECT 
        e.id AS entry_id,
        e.timestamp,
        e.task_id,
        e.task_description,
        f.id AS modification_id,
        f.action,
        f.file_path,
        f.description
    FROM edit_entries e
    JOIN file_modifications f ON e.id = f.edit_entry_id
  `);

  console.log('✓ Database schema initialized\n');
}

/**
 * Parse a date string with timezone (e.g., "2025-11-11 19:43:25 IST")
 * Returns an ISO string
 */
function parseDateTime(dateStr, timeStr, timezone) {
  // Remove timezone abbreviations if present in timeStr
  const cleanTime = timeStr.replace(/\s+(IST|UTC|EST|PST|GMT)$/i, '');

  // Create ISO string
  const isoString = `${dateStr}T${cleanTime}`;

  try {
    const date = new Date(isoString);
    return date.toISOString();
  } catch (error) {
    console.error(`Failed to parse date: ${dateStr} ${timeStr} ${timezone}`);
    return new Date().toISOString(); // fallback to current date
  }
}

/**
 * Parse a single edit entry section
 */
function parseEditEntry(lines, index) {
  const headerLine = lines[index];

  // Parse header: #### 19:43:25 IST - T3, T13: Real-World Integration Testing
  // or: #### 03:37 - T13 & T1: Virtual servers
  // Timezone is optional
  const headerMatch = headerLine.match(/####\s+(\d{1,2}:\d{2}(?::\d{2})?)\s+(?:([A-Z]{3,4})\s+)?-\s+(.+)/);

  if (!headerMatch) {
    return null;
  }

  let [, time, timezone, remainder] = headerMatch;
  
  // If timezone not provided, default to UTC
  if (!timezone) {
    timezone = 'UTC';
  }

  // Normalize time format (add :00 if missing seconds)
  if (!time.includes(':00') && time.split(':').length === 2) {
    time = time + ':00';
  }

  // Extract task ID(s) and description
  let taskId = null;
  let taskDescription = remainder;

  // Check for task ID pattern
  const taskMatch = remainder.match(/^(T\d+(?:,\s*T\d+)*)\s*:\s*(.+)/);
  if (taskMatch) {
    taskId = taskMatch[1];
    taskDescription = taskMatch[2];
  }

  // Parse file modifications
  const modifications = [];
  let i = index + 1;

  while (i < lines.length && lines[i].startsWith('-')) {
    const modLine = lines[i].trim();

    // Parse: - Created/Modified/Updated `path` - description
    const modMatch = modLine.match(/^-\s+(Created|Modified|Updated)\s+`([^`]+)`\s+-\s+(.+)/);

    if (modMatch) {
      const [, action, filePath, description] = modMatch;
      modifications.push({
        action,
        filePath,
        description
      });
    }

    i++;
  }

  return {
    time,
    timezone,
    taskId,
    taskDescription,
    modifications,
    nextIndex: i
  };
}

/**
 * Parse the entire edit_history.md file
 */
function parseEditHistory(content) {
  const lines = content.split('\n');
  const entries = [];
  let currentDate = null;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();

    // Detect date headers: ### 2025-11-11
    if (line.match(/^###\s+\d{4}-\d{2}-\d{2}$/)) {
      currentDate = line.replace(/^###\s+/, '');
      continue;
    }

    // Detect edit entry headers
    if (line.startsWith('####') && currentDate) {
      const entry = parseEditEntry(lines, i);

      if (entry) {
        entries.push({
          date: currentDate,
          ...entry
        });
        i = entry.nextIndex - 1;
      }
    }
  }

  return entries;
}

/**
 * Populate the database with parsed entries
 */
function populateDatabase(db, entries) {
  console.log(`Populating database with ${entries.length} entries...\n`);

  // Prepare statements
  const insertEntry = db.prepare(`
    INSERT INTO edit_entries (date, time, timezone, timestamp, task_id, task_description)
    VALUES (?, ?, ?, ?, ?, ?)
  `);

  const insertModification = db.prepare(`
    INSERT INTO file_modifications (edit_entry_id, date, action, file_path, description)
    VALUES (?, ?, ?, ?, ?)
  `);

  let successCount = 0;
  let errorCount = 0;

  // Use transaction for better performance
  const insertAll = db.transaction((entries) => {
    for (const entry of entries) {
      try {
        const timestamp = parseDateTime(entry.date, entry.time, entry.timezone);

        const result = insertEntry.run(
          entry.date,
          entry.time,
          entry.timezone,
          timestamp,
          entry.taskId,
          entry.taskDescription
        );

        const entryId = result.lastInsertRowid;

        // Insert modifications
        for (const mod of entry.modifications) {
          insertModification.run(
            entryId,
            entry.date,
            mod.action,
            mod.filePath,
            mod.description
          );
        }

        successCount++;
        console.log(`✓ ${entry.date} ${entry.time} - ${entry.taskId || 'No task'}: ${entry.taskDescription.substring(0, 60)}...`);
      } catch (error) {
        errorCount++;
        console.error(`✗ Failed to insert entry: ${entry.date} ${entry.time}`);
        console.error(`  Error: ${error.message}`);
      }
    }
  });

  insertAll(entries);

  console.log(`\n✓ Successfully inserted ${successCount} entries`);
  if (errorCount > 0) {
    console.log(`✗ Failed to insert ${errorCount} entries`);
  }
}

/**
 * Display database statistics
 */
function displayStats(db) {
  console.log('\n=====================================');
  console.log('Database Statistics:\n');

  const totalEntries = db.prepare('SELECT COUNT(*) as count FROM edit_entries').get().count;
  const totalModifications = db.prepare('SELECT COUNT(*) as count FROM file_modifications').get().count;
  const uniqueTasks = db.prepare('SELECT DISTINCT task_id FROM edit_entries WHERE task_id IS NOT NULL').all();

  console.log(`Total Edit Entries: ${totalEntries}`);
  console.log(`Total File Modifications: ${totalModifications}`);
  console.log(`Unique Tasks: ${uniqueTasks.length}`);
  console.log(`Unique Task IDs: ${uniqueTasks.map(t => t.task_id).join(', ')}`);

  console.log('\n✓ Database populated successfully!');
  console.log('\nDatabase file: memory_bank.db');
  console.log('\nTo query the database, run:');
  console.log('  node query.js\n');
  console.log('Or use any SQLite viewer like:');
  console.log('  - DB Browser for SQLite (https://sqlitebrowser.org/)');
  console.log('  - sqlite3 command-line tool');
  console.log('  - VS Code SQLite extensions\n');
}

/**
 * Main function
 */
function main() {
  try {
    console.log('Edit History Parser for Memory Bank\n');
    console.log('=====================================\n');

    // Read the edit history file
    const editHistoryPath = join(__dirname, '..', 'edit_history.md');
    console.log(`Reading: ${editHistoryPath}\n`);

    const content = readFileSync(editHistoryPath, 'utf-8');

    // Initialize database
    const dbPath = join(__dirname, 'memory_bank.db');
    const db = new Database(dbPath);

    // Clear existing tables
    console.log('Clearing existing database data...\n');
    db.exec('DROP TABLE IF EXISTS file_modifications');
    db.exec('DROP TABLE IF EXISTS edit_entries');

    // Initialize schema
    initDatabase(db);

    // Parse the content
    console.log('Parsing edit history...\n');
    const entries = parseEditHistory(content);

    console.log(`Found ${entries.length} edit entries\n`);

    if (entries.length === 0) {
      console.log('No entries found to process.');
      return;
    }

    // Populate database
    populateDatabase(db, entries);

    // Display statistics
    displayStats(db);

    if(process.argv.includes('--test')) {
      if(runTests()) {
        console.log('✓ All validation tests passed');
        process.exit(0);
      } else {
        process.exit(1);
      }
    }

    // Close database
    db.close();

  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

// Validation Tests
function runTests() {
  const testCases = [
    {
      name: "Should parse date headers",
      input: "### 2025-11-12\n#### 12:00:00 IST - T20: Test",
      expectedDates: 1,
      expectedEntries: 1
    },
    {
      name: "Should handle multiple timezones",
      input: "### 2025-11-12\n#### 12:00:00 UTC - Test\n#### 13:00:00 PST - Test",
      expectedEntries: 2
    },
    {
      name: "Should extract file modifications",
      input: "### 2025-11-12\n#### 12:00:00 IST - T20: Test\n- Modified `test.js` - testing",
      expectedMods: 1
    }
  ];

  let passed = 0;
  testCases.forEach(test => {
    const entries = parseEditHistory(test.input);
    let valid = true;
    
    if(test.expectedDates && !test.input.match(/^###/gm)?.length === test.expectedDates) {
      console.error(`✗ ${test.name}: Date count mismatch`);
      valid = false;
    }
    
    if(test.expectedEntries && entries.length !== test.expectedEntries) {
      console.error(`✗ ${test.name}: Entry count mismatch`);
      valid = false;
    }
    
    if(test.expectedMods && entries.some(e => e.modifications.length !== test.expectedMods)) {
      console.error(`✗ ${test.name}: Modification count mismatch`);
      valid = false;
    }
    
    if(valid) passed++;
  });
  
  console.log(`\nTests: ${passed}/${testCases.length} passed`);
  return passed === testCases.length;
}

main();
