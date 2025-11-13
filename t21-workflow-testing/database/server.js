#!/usr/bin/env node

/**
 * SQLite Web Explorer Server
 * Serves API endpoints for browsing database tables and data
 * Minimal, focused on Phase A schema exploration
 */

import express from 'express';
import Database from 'better-sqlite3';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Path to test database
const dbPath = join(__dirname, 'test_memory_bank.db');

let db;

try {
  db = new Database(dbPath, { readonly: true });
  console.log(`✅ Connected to database: ${dbPath}`);
} catch (err) {
  console.error(`❌ Failed to open database: ${err.message}`);
  process.exit(1);
}

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
    const { limit = 50, offset = 0 } = req.query;

    // Validate table name (prevent SQL injection)
    const tables = db.prepare(`
      SELECT name FROM sqlite_master WHERE type='table' AND name = ?
    `).all(name);

    if (tables.length === 0) {
      return res.status(404).json({ error: 'Table not found' });
    }

    const data = db.prepare(`SELECT * FROM ${name} LIMIT ? OFFSET ?`).all(limit, offset);
    const total = db.prepare(`SELECT COUNT(*) as cnt FROM ${name}`).get();

    res.json({
      table: name,
      data,
      pagination: {
        total: total.cnt,
        limit: parseInt(limit),
        offset: parseInt(offset),
        pages: Math.ceil(total.cnt / limit)
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

/**
 * Static HTML/CSS UI
 */
app.get('/', (req, res) => {
  res.sendFile(join(__dirname, 'explorer.html'));
});

// Start server
app.listen(PORT, () => {
  console.log(`\n🚀 SQLite Web Explorer started`);
  console.log(`📂 Database: ${dbPath}`);
  console.log(`🌐 Open: http://localhost:${PORT}`);
  console.log(`\nPress Ctrl+C to stop\n`);
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n✅ Shutting down...');
  db.close();
  process.exit(0);
});
