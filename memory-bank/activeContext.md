# Active Context

*Last Updated: 2025-12-16 22:19:00 IST*

## Current Tasks
1. **[T24]**: Migrate from better-sqlite3 to sql.js (HIGH priority)
   - Status: 🔄 IN PROGRESS
   - Current Focus: Make mb-cli the single source of truth for the standalone database package (`mb-cli/src/server-package/`) and keep templates as generated output while completing sql.js migration correctness and clean install behavior
   - Recent Achievement: Canonicalized server package + added template sync workflow; fixed sql.js adapter persistence correctness and better-sqlite3 semantics (lastInsertRowid)

2. **[T19]**: Memory Bank Viewer Web Interface (HIGH priority)
   - Status: 🔄 IN PROGRESS (Phase 3 Setup Wizard Complete)
   - Current Focus: Phase 3 includes setup wizard, write capabilities, and DB management
   - Recent Achievement: Comprehensive 4-step setup wizard integrated as default entry point for new projects. Web interface now handles complete initialization without CLI.

3. **[T13]**: Implement Memory Bank CLI (HIGH priority)
   - Status: 🔄 IN PROGRESS
   - Current Focus: Canonicalize mb-cli templates and keep generated memory-bank/database and memory-bank/templates as output only.

4. **[T21]**: Database-Native Memory Bank Update Workflow (HIGH priority)
   - Status: 🔄 IN PROGRESS (Phase A Complete)
   - Current Focus: DB-first workflow slice expanded with DB selection/import tooling in the canonical viewer; next is safe write-to-disk export with backups and roundtrip validation.
   - Note: T22 (AdminJS) was attempted to solve this but cancelled. We are now building the write UI directly into T19.

5. **[T22]**: AdminJS Database Management Interface (HIGH priority)
   - Status: ❌ CANCELLED (2025-11-22)
   - Reason: Excessive complexity/dependency hell. Shelved in favor of extending T19.

6. **[T17]**: Maintenance and Upkeep of Integrated Rules (MEDIUM priority)
   - Status: 🔄 IN PROGRESS
   - Current Focus: Rules documentation v6.8 → v6.10

## Completed Tasks (Recent)
1. **[T19 Phase 2 Refactor]**:
   - Status: ✅ COMPLETED (2025-11-22)
   - Output: Modular Viewer architecture in `t21-workflow-testing/database/public/`.

## Implementation Focus - Current Session (T24 sql.js + mb-cli canonical server-package)
**T24 sql.js migration correctness (night session):**
- ✅ Added dirty-write persistence gating (avoid writing DB on close when no writes occurred)
- ✅ Improved better-sqlite3 compatibility in adapter (return lastInsertRowid on run)
- ✅ Fixed server transaction usage to await async transaction runner
- ✅ Fixed raw sql.js API misuse by using adapter prepare/all/get in server endpoints
- ✅ Added default DB bootstrap behavior on first start for default db path

**mb-cli canonical source + template generation:**
- ✅ Created `mb-cli/src/server-package/` as canonical database package source
- ✅ Added `mb-cli/src/sync-database-template.js` to regenerate `mb-cli/templates/memory-bank/database/`
- ✅ Added `pnpm-workspace.yaml` to prevent monorepo pnpm install hijack when running inside memory-bank/database

## Next Steps
- Run clean install tests in:
  - fresh repo (pnpm install && pnpm start inside memory-bank/database)
  - pnpm monorepo (ensure local workspace marker scopes install)
- Verify no unwanted default DB creation when switching DBs in the editor
- Confirm parsers/query scripts behave correctly with sql.js adapter (persistence + async flow)

## Current Decisions
1. **Setup Wizard as Default**: All new projects see wizard first
2. **Skip Wizard for Existing**: Auto-detect initialized projects, skip to viewer
3. **Modular Architecture**: setup.js is standalone module, non-breaking
4. **No CLI Required**: Complete no-CLI workflow now possible
5. **Security First**: All paths validated, directory traversal prevented
6. **Backward Compatible**: mb init CLI still works, produces same results

## System Status
- **Database**: ✅ Operational (Phase A Schema)
- **Viewer (T19)**: ✅ Modular, Bug-free (Read-only mode)
- **Editor (T19)**: ✅ DB management, edit_history import
- **Setup Wizard (T19)**: ✅ Complete 4-step initialization flow
- **Template Creation**: ✅ All core files auto-generated
- **Management UI**: 🔄 Write capabilities pending (Phase 3 Part 2)
