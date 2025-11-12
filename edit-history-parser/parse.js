#!/usr/bin/env node

/**
 * Edit History Parser
 * Parses memory-bank/edit_history.md and populates a SQLite database via Prisma
 */

import { PrismaClient } from '@prisma/client';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const prisma = new PrismaClient();

/**
 * Parse a date string with timezone (e.g., "2025-11-11 19:43:25 IST")
 * Returns a Date object
 */
function parseDateTime(dateStr, timeStr, timezone) {
  // Remove timezone abbreviations if present in timeStr
  const cleanTime = timeStr.replace(/\s+(IST|UTC|EST|PST|GMT)$/i, '');

  // Create ISO string
  const isoString = `${dateStr}T${cleanTime}`;

  try {
    return new Date(isoString);
  } catch (error) {
    console.error(`Failed to parse date: ${dateStr} ${timeStr} ${timezone}`);
    return new Date(); // fallback to current date
  }
}

/**
 * Parse a single edit entry section
 * Format:
 * #### HH:MM:SS TZ - [TASK_ID]: Description
 * - Action `file/path` - description
 * - Action `file/path` - description
 */
function parseEditEntry(lines, index) {
  const headerLine = lines[index];

  // Parse header: #### 19:43:25 IST - T3, T13: Real-World Integration Testing
  // or: #### 19:43:25 IST - T3: Real-World Integration Testing
  // or: #### 18:45 UTC - T16: AI Consciousness Dialog Series Setup
  const headerMatch = headerLine.match(/####\s+(\d{1,2}:\d{2}(?::\d{2})?)\s+([A-Z]{3,4})\s+-\s+(.+)/);

  if (!headerMatch) {
    return null;
  }

  let [, time, timezone, remainder] = headerMatch;

  // Normalize time format (add :00 if missing seconds)
  if (!time.includes(':00') && time.split(':').length === 2) {
    time = time + ':00';
  }

  // Extract task ID(s) and description
  let taskId = null;
  let taskDescription = remainder;

  // Check for task ID pattern (T3, T13: description or T3: description)
  const taskMatch = remainder.match(/^(T\d+(?:,\s*T\d+)*)\s*:\s*(.+)/);
  if (taskMatch) {
    taskId = taskMatch[1]; // e.g., "T3" or "T3, T13"
    taskDescription = taskMatch[2];
  }

  // Parse file modifications (lines starting with -)
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

    // Detect edit entry headers: #### HH:MM:SS TZ - ...
    if (line.startsWith('####') && currentDate) {
      const entry = parseEditEntry(lines, i);

      if (entry) {
        entries.push({
          date: currentDate,
          ...entry
        });
        i = entry.nextIndex - 1; // Continue after this entry
      }
    }
  }

  return entries;
}

/**
 * Populate the database with parsed entries
 */
async function populateDatabase(entries) {
  console.log(`\nPopulating database with ${entries.length} entries...\n`);

  let successCount = 0;
  let errorCount = 0;

  for (const entry of entries) {
    try {
      const timestamp = parseDateTime(entry.date, entry.time, entry.timezone);

      await prisma.editEntry.create({
        data: {
          date: entry.date,
          time: entry.time,
          timezone: entry.timezone,
          timestamp: timestamp,
          taskId: entry.taskId,
          taskDescription: entry.taskDescription,
          modifications: {
            create: entry.modifications
          }
        }
      });

      successCount++;
      console.log(`✓ ${entry.date} ${entry.time} - ${entry.taskId || 'No task'}: ${entry.taskDescription.substring(0, 60)}...`);
    } catch (error) {
      errorCount++;
      console.error(`✗ Failed to insert entry: ${entry.date} ${entry.time}`);
      console.error(`  Error: ${error.message}`);
    }
  }

  console.log(`\n✓ Successfully inserted ${successCount} entries`);
  if (errorCount > 0) {
    console.log(`✗ Failed to insert ${errorCount} entries`);
  }
}

/**
 * Main function
 */
async function main() {
  try {
    console.log('Edit History Parser for Memory Bank\n');
    console.log('=====================================\n');

    // Read the edit history file
    const editHistoryPath = join(__dirname, '..', 'memory-bank', 'edit_history.md');
    console.log(`Reading: ${editHistoryPath}\n`);

    const content = readFileSync(editHistoryPath, 'utf-8');

    // Parse the content
    console.log('Parsing edit history...\n');
    const entries = parseEditHistory(content);

    console.log(`Found ${entries.length} edit entries\n`);

    if (entries.length === 0) {
      console.log('No entries found to process.');
      return;
    }

    // Clear existing data
    console.log('Clearing existing database data...\n');
    await prisma.fileModification.deleteMany();
    await prisma.editEntry.deleteMany();

    // Populate database
    await populateDatabase(entries);

    // Display statistics
    console.log('\n=====================================');
    console.log('Database Statistics:\n');

    const totalEntries = await prisma.editEntry.count();
    const totalModifications = await prisma.fileModification.count();
    const uniqueTasks = await prisma.editEntry.findMany({
      where: { taskId: { not: null } },
      distinct: ['taskId'],
      select: { taskId: true }
    });

    console.log(`Total Edit Entries: ${totalEntries}`);
    console.log(`Total File Modifications: ${totalModifications}`);
    console.log(`Unique Tasks: ${uniqueTasks.length}`);
    console.log(`Unique Task IDs: ${uniqueTasks.map(t => t.taskId).join(', ')}`);

    console.log('\n✓ Database populated successfully!');
    console.log('\nTo view the database, run:');
    console.log('  cd edit-history-parser && npm run studio\n');

  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
