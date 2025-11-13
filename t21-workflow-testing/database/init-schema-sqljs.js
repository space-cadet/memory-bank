#!/usr/bin/env node

/**
 * Phase A Schema Initialization - sql.js version
 * Creates fresh memory_bank.db with Phase A schema for T21 workflow testing
 * Uses sql.js (pure JavaScript, no native compilation)
 */

import initSqlJs from 'sql.js';
import { writeFileSync, readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function initializeDatabase() {
  const dbPath = join(__dirname, 'memory_bank.db');
  const schemaPath = join(__dirname, 'schema.sql');

  try {
    console.log('\n🔄 Initializing Phase A Database (sql.js)...\n');

    // Initialize sql.js
    const SQL = await initSqlJs();
    console.log('✅ sql.js initialized');

    // Create new database
    const db = new SQL.Database();
    console.log('✅ Database created in memory');

    // Read and execute schema
    const schema = readFileSync(schemaPath, 'utf-8');
    const statements = schema
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'));

    let tableCount = 0;
    let indexCount = 0;

    for (const statement of statements) {
      try {
        db.run(statement);
        
        if (statement.toUpperCase().startsWith('CREATE TABLE')) {
          tableCount++;
          const tableName = statement.match(/CREATE TABLE (\w+)/i)?.[1] || 'unknown';
          console.log(`  📋 Created table: ${tableName}`);
        } else if (statement.toUpperCase().startsWith('CREATE INDEX')) {
          indexCount++;
          const indexName = statement.match(/CREATE INDEX (\w+)/i)?.[1] || 'unknown';
          console.log(`  🔑 Created index: ${indexName}`);
        }
      } catch (err) {
        console.error(`❌ Error executing statement:\n${statement}\n${err.message}`);
        throw err;
      }
    }

    // Verify schema
    console.log('\n✅ Schema verification:\n');

    const tableResult = db.exec("SELECT name FROM sqlite_master WHERE type='table' ORDER BY name");
    const tables = tableResult.length > 0 ? tableResult[0].values : [];
    console.log(`  📊 Tables created: ${tables.length}`);
    tables.forEach(row => console.log(`    - ${row[0]}`));

    const indexResult = db.exec("SELECT name FROM sqlite_master WHERE type='index' ORDER BY name");
    const indexes = indexResult.length > 0 ? indexResult[0].values : [];
    console.log(`\n  🔑 Indexes created: ${indexes.length}`);
    indexes.forEach(row => console.log(`    - ${row[0]}`));

    // Show table schemas
    console.log('\n📋 Table Schemas:\n');
    for (const tableRow of tables) {
      const tableName = tableRow[0];
      const schemaResult = db.exec(`PRAGMA table_info(${tableName})`);
      console.log(`  ${tableName}:`);
      
      if (schemaResult.length > 0) {
        schemaResult[0].values.forEach(col => {
          const colName = col[1];
          const colType = col[2];
          const notNull = col[3] ? ' NOT NULL' : '';
          const pk = col[5] ? ' PRIMARY KEY' : '';
          console.log(`    - ${colName} (${colType})${notNull}${pk}`);
        });
      }
    }

    // Export to file
    const data = db.export();
    const buffer = Buffer.from(data);
    writeFileSync(dbPath, buffer);
    console.log('\n✅ Database saved to disk:', dbPath);

    db.close();

    console.log('\n✅ Phase A Database initialized successfully!\n');
    console.log('📁 Database location:', dbPath);
    console.log('📊 Total tables:', tables.length);
    console.log('🔑 Total indexes:', indexes.length);
    console.log('\nReady for Phase B: Insert Functions\n');

  } catch (error) {
    console.error('\n❌ Initialization failed:', error.message);
    process.exit(1);
  }
}

initializeDatabase();
