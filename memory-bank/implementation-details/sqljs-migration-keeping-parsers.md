# Implementation Plan: Replace better-sqlite3 with sql.js (Keep Parsers)

*Last Updated: 2025-12-16*

## Goal

Remove native Node addon dependencies (specifically `better-sqlite3`) from:

- the standalone server package in `memory-bank/database/`
- the mb-cli database template + parser scripts

while keeping the current feature set, including:

- Setup Wizard (web)
- Database Viewer (web)
- Database Editor (web)
- Existing parser scripts (CLI/template) that generate and query `memory_bank.db`

Primary motivation: enable predictable installation and eventually allow single-executable bundling (SEA-style) without Node/V8 ABI friction.

## Non-Goals

- No schema changes (keep `schema.sql` and table names as-is)
- No UX redesign
- No change to REST API shapes unless required by the DB swap

## High-Level Approach

Replace `better-sqlite3` with a WASM SQLite implementation (`sql.js`) and add a small adapter layer that provides the same basic operations currently used throughout:

- open DB at a file path
- read queries: "get one", "get many"
- write queries: "run"
- transactions (best-effort)
- persistence (explicit): export DB bytes and write to disk

Because `sql.js` runs in-memory, persistence is implemented by:

- On open: if the db file exists, load bytes into the in-memory DB
- On schema creation: run `schema.sql` in memory and then save to disk
- On any write: save to disk immediately (or via a simple write queue)

## Key Behavioral Differences

### Async initialization

- `sql.js` initialization is async (WASM load)
- DB open should be async
- Start the Express server only after DB is ready OR gate API handlers behind `await dbReady`

### Persistence

- `better-sqlite3` writes to disk automatically
- `sql.js` does not; we must explicitly `db.export()` and `writeFile(dbPath, bytes)` after writes

### Concurrency

- Multiple concurrent write requests can corrupt persistence if they interleave export/write.
- Add a minimal in-process “write lock” (promise queue) around save operations.

## File Change List (Server Package)

### 1) Modify `memory-bank/database/package.json`

- Remove dependency: `better-sqlite3`
- Add dependency: `sql.js`
- Ensure the wasm asset is included in the distributable
  - Either via `files` array or by locating wasm from `node_modules/sql.js/dist/`

Estimated change: 5–15 LOC

### 2) Modify `memory-bank/database/server.js`

Replace all DB calls:

- `new Database(path)`
- `db.prepare(sql).get()` / `.all()` / `.run()`
- `db.transaction(fn)`

with adapter calls:

- `await sqlite.open(dbPath)`
- `await sqlite.queryGet(sql, params)`
- `await sqlite.queryAll(sql, params)`
- `await sqlite.execRun(sql, params)`
- `await sqlite.withTransaction(fn)` (best-effort)

Also:

- Make initial DB open async
- On `/api/db/open` and `/api/db/create`, re-open/re-init using adapter
- After write endpoints (create entry, create modification, import run, delete, etc.), persist to disk

Estimated change: 250–500 LOC modified

### 3) Add a helper module: `memory-bank/database/lib/sqlite.js`

Responsibilities:

- `initSqlJs` + wasm location resolution
- `openDb(dbPath)`:
  - validate path (existing security rules)
  - if exists: read bytes and `new SQL.Database(bytes)`
  - else: `new SQL.Database()`
- Query helpers:
  - `queryAll(sql, params)` -> array of row objects
  - `queryGet(sql, params)` -> row or null
  - `execRun(sql, params)` -> run statement
- Persistence:
  - `saveDb()` -> export bytes and write file
  - write queue / mutex: serialize save operations

Estimated size: 150–300 LOC added

### 4) WASM asset handling

Depending on bundling strategy:

- If runtime loads wasm from installed `node_modules`, no repo file added.
- If bundling requires a stable path, include/copy wasm into the package and reference it.

Estimated change: 0–1 additional files

## File Change List (mb-cli, Keeping Parsers)

### 1) Modify `mb-cli/templates/memory-bank/database/package.json`

- Remove `better-sqlite3`
- Add `sql.js`
- Ensure wasm asset ends up in the generated template output

Estimated change: 5–15 LOC

### 2) Modify `mb-cli/templates/memory-bank/database/server.js`

- Same migration pattern as `memory-bank/database/server.js`
- Use the template’s own `lib/sqlite.js` helper

Estimated change: 250–500 LOC modified

### 3) Modify parser scripts (rewrite to sql.js)

Files:

- `mb-cli/templates/memory-bank/database/parse-edits.js`
- `mb-cli/templates/memory-bank/database/parse-tasks.js`
- `mb-cli/templates/memory-bank/database/parse-sessions.js`
- `mb-cli/templates/memory-bank/database/parse-session-cache.js`

Changes:

- Replace better-sqlite3 calls with adapter calls
- Ensure each parser:
  - opens/creates `memory_bank.db` via sql.js
  - runs schema if needed
  - performs inserts
  - calls `saveDb()` at the end (and/or after batches)

Estimated change: 150–300 LOC per file

### 4) Modify query scripts

Files:

- `mb-cli/templates/memory-bank/database/query.js`
- `mb-cli/templates/memory-bank/database/query-tasks.js`

Changes:

- Replace better-sqlite3 reads with sql.js adapter reads

Estimated change: 80–200 LOC per file

### 5) Add helper module in templates

- `mb-cli/templates/memory-bank/database/lib/sqlite.js`

Same responsibilities as server package helper.

Estimated size: 150–300 LOC added

### 6) Modify `mb-cli/src/commands/init.js`

- Ensure the new template helper file is copied (`lib/sqlite.js`)
- Ensure wasm asset is copied if we choose to vendor it

Estimated change: 10–40 LOC

## Total Scope Estimate (Keeping Parsers)

- Files touched: ~12–15
- New files: 2 (`lib/sqlite.js` in server package + templates) + optional wasm asset
- Total LOC changed/added: ~1200–2500

## Implementation Notes

### Query helper implementation sketch

- `queryAll(sql, params)`
  - `const stmt = db.prepare(sql)`
  - `stmt.bind(params)`
  - `while (stmt.step()) rows.push(stmt.getAsObject())`
  - `stmt.free()`

- `queryGet(sql, params)`
  - same as above, but only first row

- `execRun(sql, params)`
  - prepare/bind/step/free

### “Transaction” best-effort

`sql.js` supports `BEGIN`, `COMMIT`, `ROLLBACK`.

- `withTransaction(fn)`:
  - `exec('BEGIN')`
  - run `fn()`
  - `exec('COMMIT')`
  - on error: `exec('ROLLBACK')`

### Save strategy

KIRSS approach:

- Save immediately after any endpoint that mutates DB.
- For parsers, save once at end (or after each major chunk).

## Testing Checklist

Server:

- Start server in an empty project: setup wizard appears
- Initialize memory bank: created files + db file exists
- Viewer: `/api/tables`, `/api/table/:name`, `/api/search` work
- Editor: create entry, add modification, delete entry persists after restart
- Import edit history: run import and confirm row counts

Parsers:

- Run each parser against a sample memory bank
- Confirm `memory_bank.db` created/updated and persists
- Run query scripts and validate outputs

## Risks / Open Decisions

- WASM asset location must be stable for bundling.
- Performance may be lower than better-sqlite3; acceptable for local tooling.
- Keeping parsers increases work; removing parsers and doing import in-server would be simpler.
