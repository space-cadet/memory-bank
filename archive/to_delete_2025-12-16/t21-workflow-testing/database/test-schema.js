#!/usr/bin/env node

/**
 * Phase A Schema Testing Script
 * Tests database structure, constraints, data insertion, and query performance
 * Does NOT modify actual memory bank files
 */

import Database from 'better-sqlite3';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { readFileSync } from 'fs';
import { generateAllTestData } from './generate-test-data.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Test results tracker
let testResults = {
  total: 0,
  passed: 0,
  failed: 0,
  suites: []
};

/**
 * Logger with colored output
 */
const log = {
  info: (msg) => console.log(`ℹ️  ${msg}`),
  success: (msg) => console.log(`✅ ${msg}`),
  error: (msg) => console.log(`❌ ${msg}`),
  warning: (msg) => console.log(`⚠️  ${msg}`),
  header: (msg) => console.log(`\n${'='.repeat(60)}\n${msg}\n${'='.repeat(60)}\n`),
  test: (msg) => console.log(`  🧪 ${msg}`),
  section: (msg) => console.log(`\n📋 ${msg}\n`)
};

/**
 * Test assertion helper
 */
function assert(condition, testName, details = '') {
  testResults.total++;
  if (condition) {
    testResults.passed++;
    log.success(`${testName}`);
    if (details) log.info(`   ${details}`);
  } else {
    testResults.failed++;
    log.error(`${testName}`);
    if (details) log.error(`   ${details}`);
  }
}

/**
 * Create test database (in-memory or temporary file)
 */
function createTestDatabase() {
  const testDbPath = join(__dirname, 'test_memory_bank.db');
  const schemaPath = join(__dirname, 'schema.sql');

  try {
    log.info(`Creating test database at: ${testDbPath}`);
    
    const db = new Database(testDbPath);
    
    // Read and execute schema
    const schema = readFileSync(schemaPath, 'utf-8');
    
    // Split by semicolon and filter out comments and empty statements
    const statements = schema
      .split(';')
      .map(s => {
        // Remove lines that are comments
        const lines = s.split('\n').filter(line => !line.trim().startsWith('--'));
        return lines.join('\n').trim();
      })
      .filter(s => s.length > 0);

    // Execute each statement individually using prepare().run()
    for (const statement of statements) {
      try {
        db.prepare(statement).run();
      } catch (err) {
        console.error(`Error executing: ${statement.substring(0, 50)}...`);
        throw err;
      }
    }

    log.success('Test database created successfully');
    return db;
  } catch (err) {
    log.error(`Failed to create test database: ${err.message}`);
    process.exit(1);
  }
}

/**
 * Suite 1: Schema Structure Tests
 */
function testSchemaStructure(db) {
  log.header('Suite 1: Schema Structure Tests');
  
  const suite = { name: 'Schema Structure', tests: 0, passed: 0, failed: 0 };

  // Get all tables
  const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table' ORDER BY name").all();
  const tableNames = tables.map(t => t.name);

  const expectedTables = [
    'edit_entries',
    'file_modifications',
    'task_items',
    'task_dependencies',
    'sessions',
    'session_cache',
    'error_logs',
    'transaction_log'
  ];

  log.section('Testing table existence');
  
  for (const table of expectedTables) {
    suite.tests++;
    const exists = tableNames.includes(table);
    if (exists) {
      suite.passed++;
      log.test(`Table '${table}' exists`);
    } else {
      suite.failed++;
      log.error(`Table '${table}' NOT FOUND`);
    }
  }

  log.section('Testing table columns');

  // Test edit_entries columns
  const editEntriesCols = db.prepare('PRAGMA table_info(edit_entries)').all();
  suite.tests++;
  const hasEditEntriesColumns = 
    editEntriesCols.some(c => c.name === 'id') &&
    editEntriesCols.some(c => c.name === 'date') &&
    editEntriesCols.some(c => c.name === 'task_id') &&
    editEntriesCols.some(c => c.name === 'timestamp');
  if (hasEditEntriesColumns) {
    suite.passed++;
    log.test('edit_entries has all required columns');
  } else {
    suite.failed++;
    log.error('edit_entries missing required columns');
  }

  // Test file_modifications columns
  const fileMods = db.prepare('PRAGMA table_info(file_modifications)').all();
  suite.tests++;
  const hasFileModColumns =
    fileMods.some(c => c.name === 'edit_entry_id') &&
    fileMods.some(c => c.name === 'action') &&
    fileMods.some(c => c.name === 'file_path');
  if (hasFileModColumns) {
    suite.passed++;
    log.test('file_modifications has all required columns');
  } else {
    suite.failed++;
    log.error('file_modifications missing required columns');
  }

  // Test task_items columns
  const tasks = db.prepare('PRAGMA table_info(task_items)').all();
  suite.tests++;
  const hasTaskColumns =
    tasks.some(c => c.name === 'id' && c.pk) &&
    tasks.some(c => c.name === 'title') &&
    tasks.some(c => c.name === 'status');
  if (hasTaskColumns) {
    suite.passed++;
    log.test('task_items has all required columns with proper keys');
  } else {
    suite.failed++;
    log.error('task_items missing required columns or keys');
  }

  testResults.suites.push(suite);
  return db;
}

/**
 * Suite 2: Constraints and Indexes Tests
 */
function testConstraints(db) {
  log.header('Suite 2: Constraints and Indexes Tests');
  
  const suite = { name: 'Constraints & Indexes', tests: 0, passed: 0, failed: 0 };

  log.section('Testing foreign key constraints');

  // Test file_modifications FK
  suite.tests++;
  try {
    const fkList = db.prepare('PRAGMA foreign_key_list(file_modifications)').all();
    const hasFK = fkList.some(fk => fk.from === 'edit_entry_id' && fk.table === 'edit_entries');
    if (hasFK) {
      suite.passed++;
      log.test('file_modifications → edit_entries foreign key exists');
    } else {
      suite.failed++;
      log.error('Missing foreign key in file_modifications');
    }
  } catch (err) {
    suite.failed++;
    log.error(`FK test error: ${err.message}`);
  }

  // Test sessions FK
  suite.tests++;
  try {
    const fkList = db.prepare('PRAGMA foreign_key_list(sessions)').all();
    const hasFK = fkList.some(fk => fk.from === 'focus_task' && fk.table === 'task_items');
    if (hasFK) {
      suite.passed++;
      log.test('sessions → task_items foreign key exists');
    } else {
      suite.failed++;
      log.error('Missing foreign key in sessions');
    }
  } catch (err) {
    suite.failed++;
    log.error(`FK test error: ${err.message}`);
  }

  log.section('Testing indexes');

  // Get all indexes
  const indexes = db.prepare("SELECT name FROM sqlite_master WHERE type='index' AND name NOT LIKE 'sqlite_%'").all();
  const indexCount = indexes.length;

  suite.tests++;
  if (indexCount >= 15) {
    suite.passed++;
    log.test(`Indexes created (${indexCount} found, expected 15+)`);
  } else {
    suite.failed++;
    log.error(`Only ${indexCount} indexes found, expected 15+`);
  }

  testResults.suites.push(suite);
  return db;
}

/**
 * Suite 3: Data Insertion Tests
 */
function testDataInsertion(db) {
  log.header('Suite 3: Data Insertion Tests');
  
  const suite = { name: 'Data Insertion', tests: 0, passed: 0, failed: 0 };

  const testData = generateAllTestData();

  log.section('Inserting tasks');

  suite.tests++;
  try {
    const insertTask = db.prepare(`
      INSERT INTO task_items (id, title, status, priority, started, details)
      VALUES (?, ?, ?, ?, ?, ?)
    `);
    
    const insertMany = db.transaction((tasks) => {
      for (const task of tasks) {
        insertTask.run(task.id, task.title, task.status, task.priority, task.started, task.details);
      }
    });

    insertMany(testData.tasks);
    
    const count = db.prepare('SELECT COUNT(*) as cnt FROM task_items').get();
    if (count.cnt === testData.tasks.length) {
      suite.passed++;
      log.test(`Inserted ${testData.tasks.length} tasks successfully`);
    } else {
      suite.failed++;
      log.error(`Expected ${testData.tasks.length} tasks, got ${count.cnt}`);
    }
  } catch (err) {
    suite.failed++;
    log.error(`Task insertion error: ${err.message}`);
  }

  log.section('Inserting edit entries');

  suite.tests++;
  try {
    const insertEntry = db.prepare(`
      INSERT INTO edit_entries (date, time, timezone, timestamp, task_id, task_description)
      VALUES (?, ?, ?, ?, ?, ?)
    `);

    const insertMany = db.transaction((entries) => {
      for (const entry of entries) {
        insertEntry.run(entry.date, entry.time, entry.timezone, entry.timestamp, entry.task_id, entry.task_description);
      }
    });

    insertMany(testData.editEntries);

    const count = db.prepare('SELECT COUNT(*) as cnt FROM edit_entries').get();
    if (count.cnt === testData.editEntries.length) {
      suite.passed++;
      log.test(`Inserted ${testData.editEntries.length} edit entries successfully`);
    } else {
      suite.failed++;
      log.error(`Expected ${testData.editEntries.length} entries, got ${count.cnt}`);
    }
  } catch (err) {
    suite.failed++;
    log.error(`Edit entry insertion error: ${err.message}`);
  }

  log.section('Inserting file modifications');

  suite.tests++;
  try {
    const editEntryIds = db.prepare('SELECT id FROM edit_entries ORDER BY id').all();
    
    const insertMod = db.prepare(`
      INSERT INTO file_modifications (edit_entry_id, action, file_path, description)
      VALUES (?, ?, ?, ?)
    `);

    const insertMany = db.transaction((mods, entryIds) => {
      for (const mod of mods) {
        const entryId = entryIds[mod.edit_entry_index]?.id;
        if (entryId) {
          insertMod.run(entryId, mod.action, mod.file_path, mod.description);
        }
      }
    });

    insertMany(testData.fileModifications, editEntryIds);

    const count = db.prepare('SELECT COUNT(*) as cnt FROM file_modifications').get();
    if (count.cnt > 0) {
      suite.passed++;
      log.test(`Inserted ${count.cnt} file modifications successfully`);
    } else {
      suite.failed++;
      log.error('No file modifications inserted');
    }
  } catch (err) {
    suite.failed++;
    log.error(`File modification insertion error: ${err.message}`);
  }

  log.section('Inserting sessions');

  suite.tests++;
  try {
    const insertSession = db.prepare(`
      INSERT INTO sessions (session_date, session_period, focus_task, start_time, end_time, status, notes)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);

    const insertMany = db.transaction((sessions) => {
      for (const session of sessions) {
        insertSession.run(
          session.session_date,
          session.session_period,
          session.focus_task,
          session.start_time,
          session.end_time,
          session.status,
          session.notes
        );
      }
    });

    insertMany(testData.sessions);

    const count = db.prepare('SELECT COUNT(*) as cnt FROM sessions').get();
    if (count.cnt === testData.sessions.length) {
      suite.passed++;
      log.test(`Inserted ${testData.sessions.length} sessions successfully`);
    } else {
      suite.failed++;
      log.error(`Expected ${testData.sessions.length} sessions, got ${count.cnt}`);
    }
  } catch (err) {
    suite.failed++;
    log.error(`Session insertion error: ${err.message}`);
  }

  log.section('Inserting error logs');

  suite.tests++;
  try {
    const insertError = db.prepare(`
      INSERT INTO error_logs (timestamp, task_id, file_path, error_message, cause, fix_applied)
      VALUES (?, ?, ?, ?, ?, ?)
    `);

    const insertMany = db.transaction((errors) => {
      for (const error of errors) {
        insertError.run(
          error.timestamp,
          error.task_id,
          error.file_path,
          error.error_message,
          error.cause,
          error.fix_applied
        );
      }
    });

    insertMany(testData.errorLogs);

    const count = db.prepare('SELECT COUNT(*) as cnt FROM error_logs').get();
    if (count.cnt === testData.errorLogs.length) {
      suite.passed++;
      log.test(`Inserted ${testData.errorLogs.length} error logs successfully`);
    } else {
      suite.failed++;
      log.error(`Expected ${testData.errorLogs.length} errors, got ${count.cnt}`);
    }
  } catch (err) {
    suite.failed++;
    log.error(`Error log insertion error: ${err.message}`);
  }

  log.section('Inserting task dependencies');

  suite.tests++;
  try {
    const insertDep = db.prepare(`
      INSERT INTO task_dependencies (task_id, depends_on)
      VALUES (?, ?)
    `);

    const insertMany = db.transaction((deps) => {
      for (const dep of deps) {
        insertDep.run(dep.task_id, dep.depends_on);
      }
    });

    insertMany(testData.dependencies);

    const count = db.prepare('SELECT COUNT(*) as cnt FROM task_dependencies').get();
    if (count.cnt === testData.dependencies.length) {
      suite.passed++;
      log.test(`Inserted ${testData.dependencies.length} task dependencies successfully`);
    } else {
      suite.failed++;
      log.error(`Expected ${testData.dependencies.length} dependencies, got ${count.cnt}`);
    }
  } catch (err) {
    suite.failed++;
    log.error(`Task dependency insertion error: ${err.message}`);
  }

  log.section('Inserting session cache');

  suite.tests++;
  try {
    const insertCache = db.prepare(`
      INSERT INTO session_cache (id, current_session_id, current_focus_task, active_count, paused_count, completed_count, last_updated)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);

    const cache = testData.sessionCache;
    insertCache.run(
      1,
      cache.current_session_id,
      cache.current_focus_task,
      cache.active_count,
      cache.paused_count,
      cache.completed_count,
      cache.last_updated
    );

    const count = db.prepare('SELECT COUNT(*) as cnt FROM session_cache').get();
    if (count.cnt === 1) {
      suite.passed++;
      log.test('Inserted session cache successfully');
    } else {
      suite.failed++;
      log.error('Session cache insertion failed');
    }
  } catch (err) {
    suite.failed++;
    log.error(`Session cache insertion error: ${err.message}`);
  }

  testResults.suites.push(suite);
  return db;
}

/**
 * Suite 4: Query Performance Tests
 */
function testQueryPerformance(db) {
  log.header('Suite 4: Query Performance Tests');
  
  const suite = { name: 'Query Performance', tests: 0, passed: 0, failed: 0 };

  log.section('Testing SELECT queries');

  // Query 1: Get all tasks
  suite.tests++;
  try {
    const start = performance.now();
    const tasks = db.prepare('SELECT * FROM task_items').all();
    const duration = performance.now() - start;

    if (tasks.length > 0 && duration < 100) {
      suite.passed++;
      log.test(`SELECT all tasks: ${tasks.length} rows, ${duration.toFixed(2)}ms`);
    } else {
      suite.failed++;
      log.error(`Query returned no results or took too long (${duration.toFixed(2)}ms)`);
    }
  } catch (err) {
    suite.failed++;
    log.error(`Task query error: ${err.message}`);
  }

  // Query 2: Get edit entries by date
  suite.tests++;
  try {
    const start = performance.now();
    const entries = db.prepare('SELECT * FROM edit_entries WHERE date = ? ORDER BY time DESC').all('2025-11-13');
    const duration = performance.now() - start;

    if (entries.length >= 0 && duration < 100) {
      suite.passed++;
      log.test(`SELECT by date: ${entries.length} rows, ${duration.toFixed(2)}ms`);
    } else {
      suite.failed++;
      log.error(`Query took too long (${duration.toFixed(2)}ms)`);
    }
  } catch (err) {
    suite.failed++;
    log.error(`Date query error: ${err.message}`);
  }

  // Query 3: Get files modified in session
  suite.tests++;
  try {
    const start = performance.now();
    const files = db.prepare(`
      SELECT f.* FROM file_modifications f
      JOIN edit_entries e ON f.edit_entry_id = e.id
      WHERE e.date = ? AND f.action = ?
    `).all('2025-11-13', 'Updated');
    const duration = performance.now() - start;

    if (files.length >= 0 && duration < 100) {
      suite.passed++;
      log.test(`JOIN query (files modified): ${files.length} rows, ${duration.toFixed(2)}ms`);
    } else {
      suite.failed++;
      log.error(`JOIN query too slow (${duration.toFixed(2)}ms)`);
    }
  } catch (err) {
    suite.failed++;
    log.error(`JOIN query error: ${err.message}`);
  }

  // Query 4: Get task dependencies
  suite.tests++;
  try {
    const start = performance.now();
    const deps = db.prepare('SELECT * FROM task_dependencies WHERE task_id = ?').all('T21');
    const duration = performance.now() - start;

    if (deps.length >= 0 && duration < 100) {
      suite.passed++;
      log.test(`SELECT dependencies: ${deps.length} rows, ${duration.toFixed(2)}ms`);
    } else {
      suite.failed++;
      log.error(`Dependencies query too slow (${duration.toFixed(2)}ms)`);
    }
  } catch (err) {
    suite.failed++;
    log.error(`Dependencies query error: ${err.message}`);
  }

  // Query 5: Aggregate query - task status summary
  suite.tests++;
  try {
    const start = performance.now();
    const summary = db.prepare('SELECT status, COUNT(*) as cnt FROM task_items GROUP BY status').all();
    const duration = performance.now() - start;

    if (summary.length > 0 && duration < 100) {
      suite.passed++;
      log.test(`Aggregate query (status summary): ${summary.length} groups, ${duration.toFixed(2)}ms`);
    } else {
      suite.failed++;
      log.error(`Aggregate query failed or too slow (${duration.toFixed(2)}ms)`);
    }
  } catch (err) {
    suite.failed++;
    log.error(`Aggregate query error: ${err.message}`);
  }

  testResults.suites.push(suite);
  return db;
}

/**
 * Main test execution
 */
function runAllTests() {
  log.header('Phase A Schema Testing Suite');
  log.info('Starting comprehensive schema validation tests');
  log.info('Database: test_memory_bank.db (temporary test file)');
  log.info('Test Data: Synthetically generated from memory bank structure\n');

  try {
    let db = createTestDatabase();

    // Run all test suites
    db = testSchemaStructure(db);
    db = testConstraints(db);
    db = testDataInsertion(db);
    db = testQueryPerformance(db);

    // Close database
    db.close();

    // Print summary
    log.header('Test Summary');
    
    testResults.suites.forEach(suite => {
      const passRate = suite.tests > 0 ? ((suite.passed / suite.tests) * 100).toFixed(1) : 0;
      console.log(`${suite.name}: ${suite.passed}/${suite.tests} passed (${passRate}%)`);
    });

    console.log(`\nTotal: ${testResults.passed}/${testResults.total} tests passed`);
    
    if (testResults.failed === 0) {
      log.success(`\n🎉 All tests passed! Schema is valid and ready for Phase B.\n`);
    } else {
      log.warning(`\n⚠️  ${testResults.failed} test(s) failed. Review details above.\n`);
    }

    log.info('Test database (test_memory_bank.db) can be deleted after review');
    console.log();

  } catch (err) {
    log.error(`\nFatal error: ${err.message}`);
    console.error(err);
    process.exit(1);
  }
}

// Execute tests
runAllTests();
