/**
 * sql.js Adapter Module
 * Provides a better-sqlite3-compatible interface for sql.js (WASM SQLite)
 *
 * Key differences from better-sqlite3:
 * - All operations are async (WASM initialization)
 * - Database lives in memory, must explicitly save to disk
 * - Write queue prevents concurrent save corruption
 */

import initSqlJs from 'sql.js';
import { readFile, writeFile } from 'fs/promises';
import { existsSync } from 'fs';
import { dirname } from 'path';
import { mkdir } from 'fs/promises';

let SQL = null;
let currentDb = null;
let currentDbPath = null;
let saveQueue = Promise.resolve();
let dirty = false;

/**
 * Initialize sql.js WASM module
 * Must be called before any database operations
 */
export async function initSqlJsModule() {
  if (!SQL) {
    SQL = await initSqlJs();
  }
  return SQL;
}

/**
 * Open or create a database at the given path
 * Loads existing database from disk or creates new in-memory database
 *
 * @param {string} dbPath - Path to database file
 * @returns {Promise<void>}
 */
export async function openDb(dbPath) {
  await initSqlJsModule();

  // Close existing database if open
  if (currentDb) {
    currentDb.close();
    currentDb = null;
  }

  currentDbPath = dbPath;

  // Load existing database or create new one
  if (existsSync(dbPath)) {
    const buffer = await readFile(dbPath);
    currentDb = new SQL.Database(buffer);
  } else {
    currentDb = new SQL.Database();
  }

  dirty = false;

  return currentDb;
}

/**
 * Get the currently open database instance
 * Throws if no database is open
 *
 * @returns {Database}
 */
export function getDb() {
  if (!currentDb) {
    throw new Error('No database open. Call openDb() first.');
  }
  return currentDb;
}

/**
 * Get the current database file path
 *
 * @returns {string|null}
 */
export function getDbPath() {
  return currentDbPath;
}

/**
 * Execute a query and return all rows as objects
 *
 * @param {string} sql - SQL query
 * @param {Array} params - Query parameters
 * @returns {Promise<Array<Object>>}
 */
export async function queryAll(sql, params = []) {
  const db = getDb();
  const results = [];

  const stmt = db.prepare(sql);
  stmt.bind(params);

  while (stmt.step()) {
    results.push(stmt.getAsObject());
  }

  stmt.free();
  return results;
}

/**
 * Execute a query and return first row as object (or null)
 *
 * @param {string} sql - SQL query
 * @param {Array} params - Query parameters
 * @returns {Promise<Object|null>}
 */
export async function queryGet(sql, params = []) {
  const db = getDb();

  const stmt = db.prepare(sql);
  stmt.bind(params);

  let result = null;
  if (stmt.step()) {
    result = stmt.getAsObject();
  }

  stmt.free();
  return result;
}

/**
 * Execute a write statement (INSERT, UPDATE, DELETE)
 * Returns info about the execution (changes, lastInsertRowid)
 *
 * @param {string} sql - SQL statement
 * @param {Array} params - Statement parameters
 * @returns {Promise<{changes: number, lastInsertRowid: number}>}
 */
export async function execRun(sql, params = []) {
  const db = getDb();

  const stmt = db.prepare(sql);
  stmt.bind(params);
  stmt.step();

  const changes = db.getRowsModified();
  const lastInsertRowid = stmt.getAsObject()?.id || db.exec("SELECT last_insert_rowid() as id")[0]?.values[0]?.[0] || null;

  stmt.free();

  dirty = true;

  return { changes, lastInsertRowid };
}

/**
 * Execute raw SQL (multiple statements, no parameters)
 * Used for schema initialization
 *
 * @param {string} sql - SQL statements
 * @returns {Promise<void>}
 */
export async function exec(sql) {
  const db = getDb();
  db.exec(sql);
  dirty = true;
}

/**
 * Execute a PRAGMA statement
 *
 * @param {string} pragma - PRAGMA statement (e.g., "foreign_keys = ON")
 * @returns {Promise<any>}
 */
export async function pragma(pragmaStr) {
  const db = getDb();
  const results = db.exec(`PRAGMA ${pragmaStr}`);
  return results.length > 0 ? results[0] : null;
}

/**
 * Execute a function within a transaction
 * Best-effort implementation: BEGIN -> fn() -> COMMIT (or ROLLBACK on error)
 *
 * @param {Function} fn - Function to execute in transaction
 * @returns {Promise<any>}
 */
export async function withTransaction(fn) {
  const db = getDb();

  try {
    db.exec('BEGIN');
    const result = await fn();
    db.exec('COMMIT');
    return result;
  } catch (error) {
    db.exec('ROLLBACK');
    throw error;
  }
}

/**
 * Create a prepared statement object compatible with better-sqlite3 API
 * This allows code like: db.prepare(sql).get(params)
 *
 * @param {string} sql - SQL query/statement
 * @returns {Object} - Prepared statement object
 */
export function prepare(sql) {
  const db = getDb();

  return {
    get: (params = []) => {
      const stmt = db.prepare(sql);
      stmt.bind(Array.isArray(params) ? params : [params]);

      let result = null;
      if (stmt.step()) {
        result = stmt.getAsObject();
      }

      stmt.free();
      return result;
    },

    all: (params = []) => {
      const stmt = db.prepare(sql);
      stmt.bind(Array.isArray(params) ? params : [params]);

      const results = [];
      while (stmt.step()) {
        results.push(stmt.getAsObject());
      }

      stmt.free();
      return results;
    },

    run: (...params) => {
      const stmt = db.prepare(sql);
      stmt.bind(params);
      stmt.step();

      const changes = db.getRowsModified();
      const lastInsertRowid = db.exec('SELECT last_insert_rowid() as id')[0]?.values?.[0]?.[0] ?? null;

      stmt.free();

      dirty = true;

      return { changes, lastInsertRowid };
    }
  };
}

/**
 * Create a transaction function compatible with better-sqlite3 API
 * This allows code like: const run = db.transaction(fn); run(args);
 *
 * @param {Function} fn - Function to wrap in transaction
 * @returns {Function} - Wrapped function that executes in transaction
 */
export function transaction(fn) {
  return async (...args) => {
    return await withTransaction(() => fn(...args));
  };
}

/**
 * Save the in-memory database to disk
 * Serializes save operations to prevent corruption
 *
 * @returns {Promise<void>}
 */
export async function saveDb() {
  if (!currentDb || !currentDbPath) {
    return;
  }

  if (!dirty) {
    return;
  }

  // Queue this save operation
  saveQueue = saveQueue.then(async () => {
    try {
      const data = currentDb.export();
      const buffer = Buffer.from(data);

      // Ensure parent directory exists
      const parentDir = dirname(currentDbPath);
      await mkdir(parentDir, { recursive: true });

      await writeFile(currentDbPath, buffer);

      dirty = false;
    } catch (error) {
      console.error('Failed to save database:', error);
      throw error;
    }
  });

  return saveQueue;
}

/**
 * Close the current database
 *
 * @returns {Promise<void>}
 */
export async function closeDb() {
  if (currentDb) {
    // Save before closing only if there were writes
    await saveDb();
    currentDb.close();
    currentDb = null;
    currentDbPath = null;
    dirty = false;
  }
}

/**
 * Create a Database-like object compatible with better-sqlite3 patterns
 * This allows minimal changes to existing code
 *
 * @param {string} dbPath - Path to database file
 * @returns {Promise<Object>} - Database-like object
 */
export async function createDatabase(dbPath) {
  await openDb(dbPath);

  return {
    prepare,
    exec: async (sql) => {
      await exec(sql);
      await saveDb();
    },
    pragma,
    transaction,
    close: closeDb,

    // Direct access to underlying sql.js database
    _db: () => getDb()
  };
}

// Export a default object with all functions
export default {
  init: initSqlJsModule,
  openDb,
  getDb,
  getDbPath,
  queryAll,
  queryGet,
  execRun,
  exec,
  pragma,
  withTransaction,
  prepare,
  transaction,
  saveDb,
  closeDb,
  createDatabase
};
