#!/usr/bin/env node

/**
 * Session Cache Parser for Memory Bank
 * Parses session_cache.md and populates the session_cache table
 */

import Database from 'better-sqlite3';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * Initialize session_cache schema
 */
function initSchema(db) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS session_cache (
      session_id TEXT PRIMARY KEY,  -- Derived from implicit session file or 'current'
      status TEXT,                  -- Current status line
      focus_task TEXT,              -- Focus Task ID (e.g. T19)
      active_tasks_count INTEGER,
      paused_tasks_count INTEGER,
      completed_tasks_count INTEGER,
      cancelled_tasks_count INTEGER,
      raw_content TEXT              -- Full content
    );
  `);
  console.log('✓ Database schema initialized\n');
}

/**
 * Parse session_cache.md content
 */
function parseSessionCache(content) {
  // Extract Session File (Implicit)
  // **Session File**: `sessions/2025-11-22-evening.md` (Implicit)
  const sessionMatch = content.match(/\*\*Session File\*\*:\s*`sessions\/(.+?)`/);
  const sessionId = sessionMatch ? sessionMatch[1] : 'current_session';

  // Extract Status
  // **Status**: 🔄 In Progress: T19 Phase 2 Refactor Complete. T22 Cancelled.
  const statusMatch = content.match(/\*\*Status\*\*:\s*(.+?)(\n|$)/);
  const status = statusMatch ? statusMatch[1].trim() : '';

  // Extract Focus Task
  // **Focus Task**: T19 (Viewer), T22 (AdminJS POC) 🔄
  const focusMatch = content.match(/\*\*Focus Task\*\*:\s*(.+?)(\n|$)/);
  let focusTask = focusMatch ? focusMatch[1].trim() : '';
  // Try to extract just the T-number if possible, or keep the whole string
  const tMatch = focusTask.match(/(T\d+)/);
  if (tMatch) {
    // We keep the whole string for context in the DB, or we could normalize
    // focusTask = tMatch[1]; 
  }

  // Extract Counts
  // - Active: 11 | Paused: 0 | Completed: 7 | Cancelled: 1
  const countsMatch = content.match(/Active:\s*(\d+)\s*\|\s*Paused:\s*(\d+)\s*\|\s*Completed:\s*(\d+)(?:\s*\|\s*Cancelled:\s*(\d+))?/);
  
  let active = 0, paused = 0, completed = 0, cancelled = 0;
  if (countsMatch) {
    active = parseInt(countsMatch[1]) || 0;
    paused = parseInt(countsMatch[2]) || 0;
    completed = parseInt(countsMatch[3]) || 0;
    cancelled = parseInt(countsMatch[4]) || 0;
  }

  return {
    session_id: sessionId,
    status,
    focus_task: focusTask,
    active_tasks_count: active,
    paused_tasks_count: paused,
    completed_tasks_count: completed,
    cancelled_tasks_count: cancelled,
    raw_content: content
  };
}

/**
 * Main Execution
 */
function main() {
  try {
    console.log('Session Cache Parser for Memory Bank\n');
    console.log('=====================================\n');

    const cachePath = join(__dirname, '..', 'session_cache.md');
    console.log(`Reading: ${cachePath}\n`);

    const content = readFileSync(cachePath, 'utf-8');

    // Initialize database
    const dbPath = join(__dirname, 'memory_bank.db');
    const db = new Database(dbPath);
    
    // Clear existing table
    console.log('Clearing existing session_cache data...\n');
    db.exec('DROP TABLE IF EXISTS session_cache');
    initSchema(db);

    // Parse content
    console.log('Parsing session cache...\n');
    const data = parseSessionCache(content);

    // Insert into DB
    const insert = db.prepare(`
      INSERT INTO session_cache (
        session_id, status, focus_task, 
        active_tasks_count, paused_tasks_count, completed_tasks_count, cancelled_tasks_count,
        raw_content
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);

    insert.run(
      data.session_id,
      data.status,
      data.focus_task,
      data.active_tasks_count,
      data.paused_tasks_count,
      data.completed_tasks_count,
      data.cancelled_tasks_count,
      data.raw_content
    );

    console.log(`✓ Successfully cached session: ${data.session_id}`);
    console.log(`  Status: ${data.status.substring(0, 50)}...`);
    console.log(`  Active Tasks: ${data.active_tasks_count}`);
    
    db.close();

  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

main();
