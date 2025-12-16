#!/usr/bin/env node

/**
 * Session Parser for Memory Bank
 * Parses all markdown files in memory-bank/sessions/ and populates the sessions table
 */

import * as sqlite from './lib/sqlite.js';
import { readFileSync, readdirSync, statSync } from 'fs';
import { join, dirname, basename } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * Initialize sessions schema
 */
function initSchema(db) {
  await sqlite.exec(`
    CREATE TABLE IF NOT EXISTS sessions (
      id TEXT PRIMARY KEY,         -- Filename (e.g., 2025-11-22-evening.md)
      date TEXT NOT NULL,          -- YYYY-MM-DD
      period TEXT,                 -- morning, afternoon, evening, night
      status TEXT,                 -- In Progress, Complete, etc.
      focus TEXT,                  -- Main focus of the session
      active_count INTEGER,        -- From "Active: X"
      paused_count INTEGER,        -- From "Paused: X"
      completed_count INTEGER,     -- From "Completed: X"
      cancelled_count INTEGER,     -- From "Cancelled: X"
      content TEXT                 -- Full markdown content
    );

    CREATE INDEX IF NOT EXISTS idx_sessions_date ON sessions(date);
  `);
  console.log('✓ Database schema initialized\n');
}

/**
 * Parse a single session file
 */
function parseSessionFile(filePath, filename) {
  const content = readFileSync(filePath, 'utf-8');
  const stats = statSync(filePath);
  
  // 1. Extract Date and Period from filename (e.g., 2025-11-22-evening.md)
  const nameMatch = filename.match(/^(\d{4}-\d{2}-\d{2})-(.+)\.md$/);
  let date = null;
  let period = null;
  
  if (nameMatch) {
    date = nameMatch[1];
    period = nameMatch[2];
  } else {
    // Fallback for unusual filenames, use file creation time or content
    date = new Date(stats.mtime).toISOString().split('T')[0];
    period = 'unknown';
  }

  // 2. Parse Metadata from Content
  
  // Status
  const statusMatch = content.match(/\*\*Status\*\*:\s*(.+?)(\n|$)/) || 
                      content.match(/Status:\s*(.+?)(\n|$)/);
  let status = statusMatch ? statusMatch[1].trim() : 'Unknown';
  // Clean status icons if present (e.g., "🔄 In Progress")
  status = status.replace(/^(🔄|✅|❌|⏸️)\s*/, '');

  // Focus (Look for "Focus Task:" or just "Focus:")
  const focusMatch = content.match(/\*\*Focus(?: Task)?\*\*:\s*(.+?)(\n|$)/) || 
                     content.match(/Focus(?: Task)?:\s*(.+?)(\n|$)/);
  const focus = focusMatch ? focusMatch[1].trim() : '';

  // 3. Parse Statistics (Active: 11 | Paused: 0 | ...)
  // Format: "- Active: 11 | Paused: 0 | Completed: 7 | Cancelled: 1"
  const statsLineMatch = content.match(/Active:\s*(\d+)\s*\|\s*Paused:\s*(\d+)\s*\|\s*Completed:\s*(\d+)(?:\s*\|\s*Cancelled:\s*(\d+))?/);
  
  let activeCount = 0;
  let pausedCount = 0;
  let completedCount = 0;
  let cancelledCount = 0;

  if (statsLineMatch) {
    activeCount = parseInt(statsLineMatch[1]) || 0;
    pausedCount = parseInt(statsLineMatch[2]) || 0;
    completedCount = parseInt(statsLineMatch[3]) || 0;
    cancelledCount = parseInt(statsLineMatch[4]) || 0;
  }

  return {
    id: filename,
    date,
    period,
    status,
    focus,
    activeCount,
    pausedCount,
    completedCount,
    cancelledCount,
    content
  };
}

/**
 * Main Execution
 */
async function main() {
  try {
    console.log('Session Parser for Memory Bank\n');
    console.log('=====================================\n');

    const sessionsDir = join(__dirname, '..', 'sessions');
    console.log(`Scanning directory: ${sessionsDir}\n`);

    // Initialize database
    const dbPath = join(__dirname, 'memory_bank.db');
    await sqlite.openDb(dbPath);
    
    // Recreate table to ensure clean slate
    await sqlite.exec('DROP TABLE IF EXISTS sessions');
    initSchema(db);

    // Get all .md files
    const files = readdirSync(sessionsDir).filter(f => f.endsWith('.md'));
    console.log(`Found ${files.length} session files\n`);

    if (files.length === 0) {
      console.log('No session files found.');
      await sqlite.closeDb();
      return;
    }

    // Prepare insert statement
    const insertSession = sqlite.prepare(`
      INSERT INTO sessions (
        id, date, period, status, focus, 
        active_count, paused_count, completed_count, cancelled_count, 
        content
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    // Process files
    let successCount = 0;
    let errorCount = 0;

    const insertAll = sqlite.transaction((sessionFiles) => {
      for (const file of sessionFiles) {
        try {
          const filePath = join(sessionsDir, file);
          const session = parseSessionFile(filePath, file);

          insertSession.run(
            session.id,
            session.date,
            session.period,
            session.status,
            session.focus,
            session.activeCount,
            session.pausedCount,
            session.completedCount,
            session.cancelledCount,
            session.content
          );

          successCount++;
          console.log(`✓ ${session.date} (${session.period}) - ${session.status}`);
        } catch (error) {
          errorCount++;
          console.error(`✗ Failed to parse ${file}: ${error.message}`);
        }
      }
    });

    insertAll(files);

    console.log(`✓ Successfully inserted ${successCount} sessions`);
    if (errorCount > 0) {
      console.log(`✗ Failed to insert ${errorCount} sessions`);
    }

    // Display Stats
    console.log('\n=====================================');
    const totalSessions = sqlite.prepare('SELECT COUNT(*) as count FROM sessions').get().count;
    const dateRange = sqlite.prepare('SELECT MIN(date) as start, MAX(date) as end FROM sessions').get();
    
    console.log(`Total Sessions: ${totalSessions}`);
    console.log(`Date Range: ${dateRange.start} to ${dateRange.end}`);
    console.log('\n✓ Session database updated successfully!');

    await sqlite.closeDb();

  } catch (error) {
    console.error('Fatal Error:', error);
    process.exit(1);
  }
}

main();
