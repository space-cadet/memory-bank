#!/usr/bin/env node

/**
 * SQLite Web Explorer Server
 * Serves API endpoints for browsing database tables and data
 * Minimal, focused on Phase A schema exploration
 */

import express from 'express';
import Database from 'better-sqlite3';
import { join, dirname, resolve, sep } from 'path';
import { fileURLToPath } from 'url';
import { readdir, readFile, stat } from 'fs/promises';
import { existsSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();

app.use(express.json());

// Parse command line arguments
const args = process.argv.slice(2);

// Port configuration
const portArgIndex = args.indexOf('--port');
const PORT = portArgIndex !== -1 && args[portArgIndex + 1]
  ? parseInt(args[portArgIndex + 1])
  : (process.env.PORT || 3000);

// Check for help flag
if (args.includes('--help') || args.includes('-h')) {
  console.log(`
Memory Bank Database Viewer Server

Usage:
  node server.js [OPTIONS]

Options:
  --db <path>     Path to SQLite database file (default: memory_bank.db)
  --port <port>   Port to run server on (default: 3000)
  --help, -h      Show this help message

Examples:
  node server.js
  node server.js --db memory_bank.db
  node server.js --db /path/to/database.db --port 8080
`);
  process.exit(0);
}

const dbArgIndex = args.indexOf('--db');
let dbPath;

if (dbArgIndex !== -1 && args[dbArgIndex + 1]) {
  // Use provided path (can be relative to CWD or absolute)
  dbPath = args[dbArgIndex + 1];
} else {
  // Default to memory_bank.db in the current directory
  dbPath = join(__dirname, 'memory_bank.db');
}

let db;

try {
  db = new Database(dbPath);
  console.log(`✅ Connected to database: ${dbPath}`);
} catch (err) {
  console.error(`❌ Failed to open database: ${err.message}`);
  process.exit(1);
}

// Serve static files from public directory
app.use(express.static(join(__dirname, 'public')));

/**
 * API Routes
 */

// Get all tables with metadata
app.get('/api/tables', (req, res) => {
  try {
    const tables = db.prepare(`
      SELECT name FROM sqlite_master 
      WHERE type='table' AND name NOT LIKE 'sqlite_%'
      ORDER BY name
    `).all();

    const tablesWithInfo = tables.map(t => {
      const info = db.prepare(`PRAGMA table_info(${t.name})`).all();
      const count = db.prepare(`SELECT COUNT(*) as cnt FROM ${t.name}`).get();
      
      return {
        name: t.name,
        columnCount: info.length,
        rowCount: count.cnt,
        columns: info.map(col => ({
          name: col.name,
          type: col.type,
          notnull: col.notnull,
          pk: col.pk
        }))
      };
    });

    res.json(tablesWithInfo);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get table data with pagination
app.get('/api/table/:name', (req, res) => {
  try {
    const { name } = req.params;
    const { limit = 50, offset = 0, q = '', sortBy = '', sortDir = 'asc' } = req.query;

    // Validate table name (prevent SQL injection)
    const tables = db.prepare(`
      SELECT name FROM sqlite_master WHERE type='table' AND name = ?
    `).all(name);

    if (tables.length === 0) {
      return res.status(404).json({ error: 'Table not found' });
    }

    const limitNum = Math.max(1, Math.min(1000, parseInt(limit)));
    const offsetNum = Math.max(0, parseInt(offset));

    // Column list for validation and for building WHERE.
    const tableInfo = db.prepare(`PRAGMA table_info(${name})`).all();
    const columnNames = tableInfo.map(c => c.name);

    // Global filter: OR across columns using LIKE over CAST(col AS TEXT)
    const filterText = String(q || '').trim();
    let whereClause = '';
    const whereParams = [];
    if (filterText) {
      const like = `%${filterText}%`;
      const parts = columnNames.map(col => `CAST(${col} AS TEXT) LIKE ?`);
      whereClause = ` WHERE (${parts.join(' OR ')})`;
      whereParams.push(...columnNames.map(() => like));
    }

    // Server-side sorting.
    // Validate sortBy against actual column names to avoid injection.
    const normalizedSortDir = String(sortDir).toLowerCase() === 'desc' ? 'DESC' : 'ASC';
    let orderBy = '';
    if (sortBy && columnNames.includes(sortBy)) {
      orderBy = ` ORDER BY ${sortBy} ${normalizedSortDir}`;
    } else if (name === 'sessions') {
      // Default ordering for sessions only when no explicit sort is requested.
      orderBy = ' ORDER BY date DESC, id DESC';
    }

    const data = db
      .prepare(`SELECT * FROM ${name}${whereClause}${orderBy} LIMIT ? OFFSET ?`)
      .all(...whereParams, limitNum, offsetNum);

    const totalFiltered = db
      .prepare(`SELECT COUNT(*) as cnt FROM ${name}${whereClause}`)
      .get(...whereParams);

    const totalAll = db.prepare(`SELECT COUNT(*) as cnt FROM ${name}`).get();

    res.json({
      table: name,
      data,
      pagination: {
        total: totalFiltered.cnt,
        totalAll: totalAll.cnt,
        limit: limitNum,
        offset: offsetNum,
        pages: Math.ceil(totalFiltered.cnt / limitNum)
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get table schema with foreign keys
app.get('/api/table/:name/schema', (req, res) => {
  try {
    const { name } = req.params;

    const columns = db.prepare(`PRAGMA table_info(${name})`).all();
    const fks = db.prepare(`PRAGMA foreign_key_list(${name})`).all();
    const indexes = db.prepare(`PRAGMA index_list(${name})`).all();

    res.json({
      table: name,
      columns,
      foreignKeys: fks,
      indexes
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get relationships for a record
app.get('/api/table/:name/record/:id', (req, res) => {
  try {
    const { name, id } = req.params;

    // Get primary key column
    const cols = db.prepare(`PRAGMA table_info(${name})`).all();
    const pkCol = cols.find(c => c.pk === 1);

    if (!pkCol) {
      return res.status(400).json({ error: 'Table has no primary key' });
    }

    // Get the record
    const record = db.prepare(`SELECT * FROM ${name} WHERE ${pkCol.name} = ?`).get(id);

    if (!record) {
      return res.status(404).json({ error: 'Record not found' });
    }

    // Get foreign key relationships
    const fks = db.prepare(`PRAGMA foreign_key_list(${name})`).all();
    const relationships = {};

    for (const fk of fks) {
      const relatedRecords = db.prepare(`
        SELECT * FROM ${fk.table} WHERE ${fk.to} = ?
      `).all(record[fk.from]);

      // Get primary key column of related table for navigation
      const relatedCols = db.prepare(`PRAGMA table_info(${fk.table})`).all();
      const relatedPkCol = relatedCols.find(c => c.pk === 1);

      relationships[`${fk.table} (via ${fk.from})`] = {
        table: fk.table,
        pkColumn: relatedPkCol ? relatedPkCol.name : 'id',
        records: relatedRecords
      };
    }

    res.json({
      table: name,
      record,
      relationships
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Search across all tables
app.get('/api/search', (req, res) => {
  try {
    const { q } = req.query;

    if (!q || q.length < 2) {
      return res.status(400).json({ error: 'Query too short' });
    }

    const searchTerm = `%${q}%`;
    const results = {};

    const tables = db.prepare(`
      SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'
    `).all();

    for (const table of tables) {
      const columns = db.prepare(`PRAGMA table_info(${table.name})`).all();
      
      for (const col of columns) {
        if (col.type.includes('TEXT') || col.type.includes('BLOB')) {
          try {
            const matches = db.prepare(`
              SELECT * FROM ${table.name} WHERE CAST(${col.name} AS TEXT) LIKE ?
            `).all(searchTerm);

            if (matches.length > 0) {
              if (!results[table.name]) results[table.name] = [];
              results[table.name].push(...matches);
            }
          } catch (err) {
            // Skip columns that can't be searched
          }
        }
      }
    }

    res.json({
      query: q,
      results,
      totalMatches: Object.values(results).reduce((sum, arr) => sum + arr.length, 0)
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get database statistics
app.get('/api/stats', (req, res) => {
  try {
    const tables = db.prepare(`
      SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'
    `).all();

    let totalRows = 0;
    const stats = {};

    for (const table of tables) {
      const count = db.prepare(`SELECT COUNT(*) as cnt FROM ${table.name}`).get();
      stats[table.name] = count.cnt;
      totalRows += count.cnt;
    }

    res.json({
      database: dbPath,
      tableCount: tables.length,
      totalRows,
      tableStats: stats
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

function isValidDate(value) {
  return /^\d{4}-\d{2}-\d{2}$/.test(String(value || ''));
}

function normalizeTime(value) {
  const raw = String(value || '').trim();
  const match = raw.match(/^\d{1,2}:\d{2}(?::\d{2})?$/);
  if (!match) return null;
  if (raw.split(':').length === 2) return `${raw}:00`;
  return raw;
}

function computeTimestampIso(dateStr, timeStr) {
  const isoString = `${dateStr}T${timeStr}`;
  const date = new Date(isoString);
  if (Number.isNaN(date.getTime())) return null;
  return date.toISOString();
}

function isValidEditAction(value) {
  return ['Created', 'Modified', 'Updated', 'Deleted'].includes(String(value || '').trim());
}

app.post('/api/edit-entries', (req, res) => {
  try {
    const { date, time, timezone = null, task_id = null, task_description } = req.body || {};

    if (!isValidDate(date)) {
      return res.status(400).json({ error: 'Invalid date (expected YYYY-MM-DD)' });
    }

    const normalizedTime = normalizeTime(time);
    if (!normalizedTime) {
      return res.status(400).json({ error: 'Invalid time (expected HH:MM or HH:MM:SS)' });
    }

    const desc = String(task_description || '').trim();
    if (!desc) {
      return res.status(400).json({ error: 'task_description is required' });
    }

    const timestamp = computeTimestampIso(date, normalizedTime);
    if (!timestamp) {
      return res.status(400).json({ error: 'Invalid date/time combination' });
    }

    const insert = db.prepare(`
      INSERT INTO edit_entries (date, time, timezone, timestamp, task_id, task_description)
      VALUES (?, ?, ?, ?, ?, ?)
    `);

    const result = insert.run(
      date,
      normalizedTime,
      timezone === '' ? null : timezone,
      timestamp,
      task_id === '' ? null : task_id,
      desc
    );

    res.json({
      id: result.lastInsertRowid,
      date,
      time: normalizedTime,
      timezone: timezone === '' ? null : timezone,
      timestamp,
      task_id: task_id === '' ? null : task_id,
      task_description: desc
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/edit-entries/:id/modifications', (req, res) => {
  try {
    const { id } = req.params;
    const entry = db.prepare('SELECT id FROM edit_entries WHERE id = ?').get(id);
    if (!entry) {
      return res.status(404).json({ error: 'Edit entry not found' });
    }

    const { action, file_path, description } = req.body || {};

    if (!isValidEditAction(action)) {
      return res.status(400).json({ error: 'Invalid action (Created|Modified|Updated|Deleted)' });
    }

    const path = String(file_path || '').trim();
    if (!path) {
      return res.status(400).json({ error: 'file_path is required' });
    }

    const desc = String(description || '').trim();
    if (!desc) {
      return res.status(400).json({ error: 'description is required' });
    }

    const insert = db.prepare(`
      INSERT INTO file_modifications (edit_entry_id, action, file_path, description)
      VALUES (?, ?, ?, ?)
    `);

    const result = insert.run(entry.id, action, path, desc);

    res.json({
      id: result.lastInsertRowid,
      edit_entry_id: entry.id,
      action,
      file_path: path,
      description: desc
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/edit-entries/:id', (req, res) => {
  try {
    const { id } = req.params;

    const del = db.prepare('DELETE FROM edit_entries WHERE id = ?');
    const result = del.run(id);

    if (result.changes === 0) {
      return res.status(404).json({ error: 'Edit entry not found' });
    }

    res.json({ deleted: true, id: Number(id) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/export/edit-history', (req, res) => {
  try {
    const entries = db.prepare(`
      SELECT id, date, time, timezone, task_id, task_description
      FROM edit_entries
      ORDER BY date DESC, time DESC
    `).all();

    if (entries.length === 0) {
      return res.json({ markdown: '# Edit History\n\n*No entries*\n' });
    }

    let markdown = '# Edit History\n';
    markdown += `*Last Updated: ${new Date().toISOString().split('T')[0]}*\n\n`;

    let currentDate = null;

    for (const entry of entries) {
      if (entry.date !== currentDate) {
        currentDate = entry.date;
        markdown += `\n### ${currentDate}\n\n`;
      }

      const tzPart = entry.timezone ? ` ${entry.timezone}` : '';
      const taskPart = entry.task_id ? `${entry.task_id}: ` : '';
      markdown += `#### ${entry.time}${tzPart} - ${taskPart}${entry.task_description}\n`;

      const mods = db.prepare(`
        SELECT action, file_path, description
        FROM file_modifications
        WHERE edit_entry_id = ?
        ORDER BY id ASC
      `).all(entry.id);

      for (const mod of mods) {
        markdown += `- ${mod.action} \`${mod.file_path}\` - ${mod.description}\n`;
      }
    }

    res.json({ markdown });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * Memory Bank File Browser API
 */

// Memory bank base path (relative to server location)
const MEMORY_BANK_PATH = join(__dirname, '..', '..', 'memory-bank');
const MEMORY_BANK_ROOT = resolve(MEMORY_BANK_PATH);

// Get all memory bank files organized by category
app.get('/api/memory-bank/files', async (req, res) => {
  try {
    if (!existsSync(MEMORY_BANK_PATH)) {
      return res.status(404).json({ error: 'Memory bank directory not found' });
    }

    const categories = {
      core: {
        name: 'Core Files',
        icon: '📘',
        files: []
      },
      tasks: {
        name: 'Tasks',
        icon: '📋',
        files: []
      },
      sessions: {
        name: 'Sessions',
        icon: '🗓️',
        files: []
      },
      implementation: {
        name: 'Implementation Details',
        icon: '🔧',
        files: []
      },
      database: {
        name: 'Database',
        icon: '💾',
        files: []
      }
    };

    // Core markdown files
    const coreFiles = [
      'tasks.md',
      'activeContext.md',
      'session_cache.md',
      'edit_history.md',
      'errorLog.md',
      'progress.md',
      'changelog.md',
      'projectbrief.md',
      'productContext.md',
      'techContext.md',
      'systemPatterns.md'
    ];

    for (const file of coreFiles) {
      const filePath = join(MEMORY_BANK_PATH, file);
      if (existsSync(filePath)) {
        const stats = await stat(filePath);
        categories.core.files.push({
          name: file,
          path: file,
          size: stats.size,
          modified: stats.mtime
        });
      }
    }

    // Task files
    const tasksDir = join(MEMORY_BANK_PATH, 'tasks');
    if (existsSync(tasksDir)) {
      const taskFiles = await readdir(tasksDir);
      for (const file of taskFiles) {
        if (file.endsWith('.md')) {
          const filePath = join(tasksDir, file);
          const stats = await stat(filePath);
          categories.tasks.files.push({
            name: file,
            path: `tasks/${file}`,
            size: stats.size,
            modified: stats.mtime
          });
        }
      }
      // Sort task files by name
      categories.tasks.files.sort((a, b) => {
        // Extract task numbers for proper sorting (T1, T2, T10, etc.)
        const aMatch = a.name.match(/T(\d+)/);
        const bMatch = b.name.match(/T(\d+)/);
        if (aMatch && bMatch) {
          return parseInt(aMatch[1]) - parseInt(bMatch[1]);
        }
        return a.name.localeCompare(b.name);
      });
    }

    // Session files
    const sessionsDir = join(MEMORY_BANK_PATH, 'sessions');
    if (existsSync(sessionsDir)) {
      const sessionFiles = await readdir(sessionsDir);
      for (const file of sessionFiles) {
        if (file.endsWith('.md')) {
          const filePath = join(sessionsDir, file);
          const stats = await stat(filePath);
          categories.sessions.files.push({
            name: file,
            path: `sessions/${file}`,
            size: stats.size,
            modified: stats.mtime
          });
        }
      }
      // Sort session files by date (most recent first)
      categories.sessions.files.sort((a, b) => b.modified - a.modified);
    }

    // Implementation details
    const implDir = join(MEMORY_BANK_PATH, 'implementation-details');
    if (existsSync(implDir)) {
      const implFiles = await readdir(implDir);
      for (const file of implFiles) {
        if (file.endsWith('.md')) {
          const filePath = join(implDir, file);
          const stats = await stat(filePath);
          categories.implementation.files.push({
            name: file,
            path: `implementation-details/${file}`,
            size: stats.size,
            modified: stats.mtime
          });
        }
      }
      categories.implementation.files.sort((a, b) => a.name.localeCompare(b.name));
    }

    // Database files
    const dbDir = join(MEMORY_BANK_PATH, 'database');
    if (existsSync(dbDir)) {
      const dbFiles = await readdir(dbDir);
      for (const file of dbFiles) {
        const filePath = join(dbDir, file);
        const stats = await stat(filePath);
        categories.database.files.push({
          name: file,
          path: `database/${file}`,
          size: stats.size,
          modified: stats.mtime,
          isDir: stats.isDirectory()
        });
      }
      categories.database.files.sort((a, b) => a.name.localeCompare(b.name));
    }

    res.json(categories);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get content of a specific memory bank file
// NOTE: Express 5 uses path-to-regexp v8 which is stricter about wildcard patterns.
// Using a RegExp route here avoids route pattern parsing errors.
app.get(/^\/api\/memory-bank\/file\/(.+)$/, async (req, res) => {
  try {
    const filePath = req.params[0];
    const fullPath = resolve(MEMORY_BANK_ROOT, filePath);

    // Security check: ensure the path is within memory-bank directory
    if (fullPath !== MEMORY_BANK_ROOT && !fullPath.startsWith(MEMORY_BANK_ROOT + sep)) {
      return res.status(403).json({ error: 'Access denied' });
    }

    if (!existsSync(fullPath)) {
      return res.status(404).json({ error: 'File not found' });
    }

    const stats = await stat(fullPath);

    if (stats.isDirectory()) {
      return res.status(400).json({ error: 'Path is a directory' });
    }

    const content = await readFile(fullPath, 'utf-8');

    res.json({
      path: filePath,
      name: filePath.split('/').pop(),
      content: content,
      size: stats.size,
      modified: stats.mtime
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * Static HTML/CSS UI
 */
app.get('/', (req, res) => {
  res.sendFile(join(__dirname, 'public', 'index.html'));
});

// Start server with port fallback
const server = app.listen(PORT, () => {
  console.log(`\n🚀 SQLite Web Explorer started`);
  console.log(`📂 Database: ${dbPath}`);
  console.log(`🌐 Open: http://localhost:${PORT}`);
  console.log(`\nPress Ctrl+C to stop\n`);
}).on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.log(`⚠️  Port ${PORT} is busy, trying a random available port...`);
    const fallbackServer = app.listen(0, () => {
      const address = fallbackServer.address();
      console.log(`\n🚀 SQLite Web Explorer started`);
      console.log(`📂 Database: ${dbPath}`);
      console.log(`🌐 Open: http://localhost:${address.port}`);
      console.log(`\nPress Ctrl+C to stop\n`);
    });
  } else {
    console.error(err);
  }
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n✅ Shutting down...');
  db.close();
  process.exit(0);
});
