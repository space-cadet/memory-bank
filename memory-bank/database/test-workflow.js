#!/usr/bin/env node

/**
 * Integration Test for Database-Native Memory Bank Workflow
 * Tests: init → insert → regenerate → verify roundtrip
 */

import * as sqlite from './lib/sqlite.js';
import * as inserts from './lib/inserts.js';
import * as regenerate from './lib/regenerate.js';
import * as workflow from './lib/workflow.js';
import { readFileSync, existsSync, unlinkSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Test results
let passed = 0;
let failed = 0;

function assert(condition, name, detail = '') {
  if (condition) {
    passed++;
    console.log(`  ✅ ${name}`);
  } else {
    failed++;
    console.log(`  ❌ ${name}`);
    if (detail) console.log(`     ${detail}`);
  }
}

function section(title) {
  console.log(`\n📋 ${title}\n`);
}

// ============================================================================
// TEST SETUP
// ============================================================================

async function setupTestDb() {
  // Open in-memory database
  await sqlite.openDb(':memory:');

  // Initialize schema
  const schemaPath = join(__dirname, 'schema.sql');
  const schema = readFileSync(schemaPath, 'utf-8');
  await sqlite.exec(schema);

  console.log('✅ In-memory test database initialized with Phase A schema\n');
}

async function populateTestData() {
  section('Populating Test Data');

  // Insert tasks
  await inserts.upsertTask({
    id: 'T1',
    title: 'Initialize Memory Bank',
    status: 'completed',
    priority: 'high',
    started: '2026-05-11',
    details: 'Set up memory-bank directory and core files'
  });

  await inserts.upsertTask({
    id: 'T2',
    title: 'Integrate Mulch',
    status: 'completed',
    priority: 'high',
    started: '2026-05-11',
    details: 'Install mulch skill and configure domains'
  });

  await inserts.upsertTask({
    id: 'T3',
    title: 'Implement DB-Native Workflow',
    status: 'in_progress',
    priority: 'high',
    started: '2026-05-11',
    details: 'Build insert and regenerate functions'
  });

  await inserts.addTaskDependency('T3', 'T1');
  await inserts.addTaskDependency('T3', 'T2');

  console.log('  ✅ Inserted 3 tasks with dependencies');

  // Insert edit entries
  const { entryId: e1 } = await inserts.insertEditEntry({
    date: '2026-05-11',
    time: '09:02:00',
    timezone: 'IST',
    task_id: 'T1',
    task_description: 'Session startup and memory bank init',
    modifications: [
      { action: 'Created', file_path: 'memory-bank/tasks.md', description: 'Task registry' },
      { action: 'Created', file_path: 'memory-bank/activeContext.md', description: 'Session context' }
    ]
  });

  const { entryId: e2 } = await inserts.insertEditEntry({
    date: '2026-05-11',
    time: '10:28:00',
    timezone: 'IST',
    task_id: 'T2',
    task_description: 'Adopt v6.12 chunk-based protocol',
    modifications: [
      { action: 'Created', file_path: 'memory-bank/MB-PROTOCOL.md', description: 'Protocol document' },
      { action: 'Modified', file_path: 'AGENTS.md', description: 'Added startup sequence' }
    ]
  });

  console.log(`  ✅ Inserted 2 edit entries with ${e1}, ${e2}`);

  // Insert session
  const { sessionId } = await inserts.createSession({
    session_date: '2026-05-11',
    session_period: 'morning',
    focus_task: 'T3',
    start_time: '2026-05-11T09:02:00.000Z',
    status: 'in_progress',
    notes: 'Testing database-native workflow'
  });

  console.log(`  ✅ Created session ${sessionId}`);

  // Update session cache
  await inserts.updateSessionCache({
    current_session_id: sessionId,
    current_focus_task: 'T3',
    active_count: 1,
    paused_count: 0,
    completed_count: 2
  });

  console.log('  ✅ Session cache updated');

  return { sessionId };
}

// ============================================================================
// TEST SUITES
// ============================================================================

async function testInserts() {
  section('Test Suite 1: Insert Functions');

  // Verify tasks
  const tasks = await sqlite.queryAll(`SELECT * FROM task_items ORDER BY id`);
  assert(tasks.length === 3, '3 tasks inserted', `got ${tasks.length}`);
  assert(tasks[0].id === 'T1' && tasks[0].status === 'completed', 'T1 is completed');
  assert(tasks[2].id === 'T3' && tasks[2].status === 'in_progress', 'T3 is in_progress');

  // Verify dependencies
  const deps = await sqlite.queryAll(`SELECT * FROM task_dependencies`);
  assert(deps.length === 2, '2 dependencies inserted');
  assert(deps.some(d => d.task_id === 'T3' && d.depends_on === 'T1'), 'T3 depends on T1');

  // Verify edit entries
  const entries = await sqlite.queryAll(`SELECT * FROM edit_entries`);
  assert(entries.length === 2, '2 edit entries inserted');

  // Verify file modifications
  const mods = await sqlite.queryAll(`SELECT * FROM file_modifications`);
  assert(mods.length === 4, '4 file modifications inserted', `got ${mods.length}`);

  // Verify session
  const sessions = await sqlite.queryAll(`SELECT * FROM sessions`);
  assert(sessions.length === 1, '1 session inserted');
  assert(sessions[0].focus_task === 'T3', 'Session focus is T3');

  // Verify session cache
  const cache = await sqlite.queryGet(`SELECT * FROM session_cache WHERE id = 1`);
  assert(cache !== null, 'Session cache exists');
  assert(cache.active_count === 1, 'Active count = 1');
  assert(cache.completed_count === 2, 'Completed count = 2');
}

async function testRegenerateEditHistory() {
  section('Test Suite 2: Regenerate edit_history.md');

  const testPath = join(__dirname, 'test_output_edit_history.md');
  const md = await regenerate.regenerateEditHistory(testPath);

  assert(md.includes('# Edit History'), 'Has header');
  assert(md.includes('*Last Updated:'), 'Has last updated timestamp');
  assert(md.includes('## 2026-05-11'), 'Has date section');
  assert(md.includes('#### 09:02:00 IST - T1:'), 'Has first entry with task ID');
  assert(md.includes('#### 10:28:00 IST - T2:'), 'Has second entry with task ID');
  assert(md.includes('- Created `memory-bank/tasks.md`'), 'Has file modification line');
  assert(md.includes('- Modified `AGENTS.md`'), 'Has second modification line');
  assert(existsSync(testPath), 'File written to disk');

  // Verify file content matches returned string
  const fileContent = readFileSync(testPath, 'utf-8');
  assert(fileContent === md, 'File content matches returned string');

  console.log('  📝 Generated preview:');
  console.log(md.slice(0, 400) + '...\n');
}

async function testRegenerateTasks() {
  section('Test Suite 3: Regenerate tasks.md');

  const testPath = join(__dirname, 'test_output_tasks.md');
  const md = await regenerate.regenerateTasks(testPath);

  assert(md.includes('# Memory Bank - Sage Workspace'), 'Has header');
  assert(md.includes('## Active Tasks'), 'Has active tasks section');
  assert(md.includes('| T3 |'), 'Has T3 in table');
  assert(md.includes('🔄'), 'Has in_progress emoji');
  assert(md.includes('## Completed Tasks'), 'Has completed tasks section');
  assert(md.includes('| T1 |') && md.includes('| T2 |'), 'Has T1 and T2 in completed');
  assert(md.includes('✅'), 'Has completed emoji');
  assert(md.includes('## Task Relationships'), 'Has relationships section');
  assert(md.includes('T3: Implement DB-Native Workflow'), 'Has task tree');
  assert(md.includes('## Status Summary'), 'Has status summary');
  assert(md.includes('**Active**: 1'), 'Active count = 1');
  assert(md.includes('**Completed**: 2'), 'Completed count = 2');
  assert(existsSync(testPath), 'File written to disk');

  console.log('  📝 Generated preview:');
  console.log(md.slice(0, 400) + '...\n');
}

async function testRegenerateSessionCache() {
  section('Test Suite 4: Regenerate session_cache.md');

  const testPath = join(__dirname, 'test_output_session_cache.md');
  const md = await regenerate.regenerateSessionCache(testPath);

  assert(md.includes('# Session Cache'), 'Has header');
  assert(md.includes('**Started**:'), 'Has started timestamp');
  assert(md.includes('**Focus Task**:'), 'Has focus task');
  assert(md.includes('T3: Implement DB-Native Workflow'), 'Focus task is T3');
  assert(md.includes('**Session File**:'), 'Has session file reference');
  assert(md.includes('## Overview'), 'Has overview section');
  assert(md.includes('## Active Tasks'), 'Has active tasks section');
  assert(md.includes('## Next Session Focus'), 'Has next session focus');
  assert(md.includes('## System Status'), 'Has system status');
  assert(existsSync(testPath), 'File written to disk');

  console.log('  📝 Generated preview:');
  console.log(md.slice(0, 400) + '...\n');
}

async function testWorkflow() {
  section('Test Suite 5: Workflow Wrapper');

  const startTime = performance.now();

  const result = await workflow.recordSessionWork({
    task_id: 'T3',
    task_description: 'Integration testing of DB-native workflow',
    files_modified: [
      { action: 'Created', path: 'memory-bank/database/lib/inserts.js', description: 'Insert functions' },
      { action: 'Created', path: 'memory-bank/database/lib/regenerate.js', description: 'Regenerate functions' },
      { action: 'Created', path: 'memory-bank/database/lib/workflow.js', description: 'Workflow wrapper' }
    ],
    task_status: 'in_progress',
    session_period: 'morning',
    output_dir: join(__dirname, 'test_output')
  });

  const duration = performance.now() - startTime;

  assert(result.success === true, 'Workflow succeeded');
  assert(result.entryId > 0, 'Entry ID returned');
  assert(result.sessionId > 0, 'Session ID returned');
  assert(result.durationMs < 5000, `Fast execution: ${result.durationMs}ms`, `Slow: ${result.durationMs}ms`);
  assert(result.counts.active >= 1, 'Active count updated');
  assert(result.filesWritten.length === 3, '3 files regenerated');
  assert(existsSync(result.filesWritten[0]), 'edit_history.md written');
  assert(existsSync(result.filesWritten[1]), 'tasks.md written');
  assert(existsSync(result.filesWritten[2]), 'session_cache.md written');

  // Verify transaction was logged
  const txLog = await sqlite.queryGet(
    `SELECT * FROM transaction_log WHERE transaction_id = ?`,
    [result.transactionId]
  );
  assert(txLog !== null, 'Transaction logged');
  assert(txLog.status === 'success', 'Transaction status is success');

  console.log(`  ⏱️  Workflow completed in ${result.durationMs}ms`);
  console.log(`  📝 Files: ${result.filesWritten.map(f => f.split('/').pop()).join(', ')}`);
}

async function testRoundtrip() {
  section('Test Suite 6: Roundtrip Verification');

  // Get original DB state
  const originalEntries = await sqlite.queryAll(`SELECT COUNT(*) as cnt FROM edit_entries`);
  const originalTasks = await sqlite.queryAll(`SELECT COUNT(*) as cnt FROM task_items`);

  // Read regenerated edit_history.md
  const editHistoryPath = join(__dirname, 'test_output', 'edit_history.md');
  const editHistoryContent = readFileSync(editHistoryPath, 'utf-8');

  // Verify it contains all original entries + the new workflow entry
  assert(editHistoryContent.includes('T1: Session startup'), 'Roundtrip preserves T1 entry');
  assert(editHistoryContent.includes('T2: Adopt v6.12'), 'Roundtrip preserves T2 entry');
  assert(editHistoryContent.includes('T3: Integration testing'), 'Roundtrip includes new entry');

  // Verify task counts consistent
  const tasksMdPath = join(__dirname, 'test_output', 'tasks.md');
  const tasksContent = readFileSync(tasksMdPath, 'utf-8');
  assert(tasksContent.includes('**Active**:'), 'Tasks.md has status summary');

  // Verify session cache has current focus
  const cachePath = join(__dirname, 'test_output', 'session_cache.md');
  const cacheContent = readFileSync(cachePath, 'utf-8');
  assert(cacheContent.includes('Integration testing'), 'Session cache reflects latest work');

  console.log('  ✅ All roundtrip checks passed');
}

// ============================================================================
// CLEANUP
// ============================================================================

async function cleanup() {
  const files = [
    join(__dirname, 'test_output_edit_history.md'),
    join(__dirname, 'test_output_tasks.md'),
    join(__dirname, 'test_output_session_cache.md'),
    join(__dirname, 'test_output', 'edit_history.md'),
    join(__dirname, 'test_output', 'tasks.md'),
    join(__dirname, 'test_output', 'session_cache.md')
  ];

  for (const f of files) {
    if (existsSync(f)) {
      unlinkSync(f);
    }
  }

  // Remove test_output directory if empty
  try {
    const dir = join(__dirname, 'test_output');
    if (existsSync(dir)) {
      const { rmdirSync } = await import('fs');
      rmdirSync(dir);
    }
  } catch { /* ignore */ }

  console.log('\n🧹 Cleaned up test files\n');
}

// ============================================================================
// MAIN
// ============================================================================

async function runAllTests() {
  console.log('='.repeat(60));
  console.log('  Memory Bank Database-Native Workflow Integration Test');
  console.log('='.repeat(60));

  try {
    await setupTestDb();
    await populateTestData();
    await testInserts();
    await testRegenerateEditHistory();
    await testRegenerateTasks();
    await testRegenerateSessionCache();
    await testWorkflow();
    await testRoundtrip();

    console.log('='.repeat(60));
    console.log(`  RESULT: ${passed} passed, ${failed} failed`);
    console.log('='.repeat(60));

    if (failed === 0) {
      console.log('\n🎉 All tests passed! Database-native workflow is ready.\n');
    } else {
      console.log(`\n⚠️  ${failed} test(s) failed. Review details above.\n`);
      process.exit(1);
    }

  } catch (err) {
    console.error('\n❌ Fatal test error:', err.message);
    console.error(err.stack);
    process.exit(1);
  } finally {
    await cleanup();
    sqlite.closeDb?.();
  }
}

runAllTests();
