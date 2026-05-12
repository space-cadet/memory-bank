# Active Context

*Last Updated: 2026-05-12 11:34:00 IST*

## Current Tasks
1. **[T25]**: Standalone Node Package (Browser-First) (HIGH priority)
   - Status: 🔄 IN PROGRESS
   - Current Focus: CLI utilities for database insert, query, and workflow operations
   - Recent Achievement: Browser-first imports hardened (tasks/sessions/session_cache + task file subtasks)
   - Next: Build `mb db` subcommands (query, workflow, test)

2. **[T13]**: Implement Memory Bank CLI (HIGH priority)
   - Status: 🔄 IN PROGRESS
   - Current Focus: Expand CLI beyond `init` — add `mb db` subcommand group for database operations
   - Recent Achievement: Init bootstrap completeness (integrated rules, protocols, commit template)
   - Next: Implement db query, db workflow, db test commands

3. **[T19]**: Memory Bank Viewer Web Interface (HIGH priority)
   - Status: 🔄 IN PROGRESS (Phase 3 Setup Wizard Complete)
   - Current Focus: Phase 3 includes setup wizard, write capabilities, and DB management
   - Recent Achievement: Comprehensive 4-step setup wizard integrated as default entry point

4. **[META-1]**: Memory Bank Update and Maintenance (HIGH priority)
   - Status: 🔄 IN PROGRESS
   - Current Focus: Memory bank sync after T21 completion, session maintenance

5. **[T24]**: Migrate from better-sqlite3 to sql.js (HIGH priority)
   - Status: 🔄 IN PROGRESS
   - Current Focus: Parser compatibility fixes and propagation to canonical/template packages

6. **[T17]**: Maintenance and Upkeep of Integrated Rules (MEDIUM priority)
   - Status: 🔄 IN PROGRESS
   - Current Focus: Rules documentation v6.12 alignment

7. **[T22]**: AdminJS Database Management Interface (HIGH priority)
   - Status: ❌ CANCELLED (2025-11-22)
   - Reason: Excessive complexity/dependency hell. Shelved in favor of extending T19.

## Completed Tasks (Recent)
1. **[T21]**: Database-Native Memory Bank Update Workflow
   - Status: ✅ COMPLETED (2026-05-12)
   - Output: Insert + Regenerate functions ported to canonical repo. 60 integration tests passing. Phases A, B, C, D complete.
   - Files: `memory-bank/database/lib/inserts.js`, `regenerate.js`, `workflow.js`, `test-workflow.js`

2. **[T19 Phase 2 Refactor]**:
   - Status: ✅ COMPLETED (2025-11-22)
   - Output: Modular Viewer architecture

## Implementation Focus - Current Session (T25 + T13)
**T21 Completion Sync (2026-05-12):**
- ✅ Ported inserts.js, regenerate.js, workflow.js from workspace to canonical repo
- ✅ Ported test-workflow.js with 60 integration tests
- ✅ All tests passing in canonical repo
- ✅ Updated T21 task file and task registry

**T25 CLI Utilities — Partial (Paused for new session):**
- ✅ `mb db query` — SQL queries with table and JSON output
- ✅ `mb db test` — Runs integration test suite (needs schema alignment fixes)
- ✅ `mb db init` — Initialize database schema
- ✅ `mb db workflow` — Implemented but needs session_cache schema alignment
- 🔄 Schema alignment: inserts.js, regenerate.js, workflow.js adapted for T20 schema
- ⬜ Complete schema alignment (session_cache table column names)
- ⬜ Verify full test suite passes after alignment
- ⬜ T13 CLI Expansion: Wire database/lib/ modules into CLI commands

## Next Steps
- Complete schema alignment between T20 parser schema and T21 workflow code
- Verify `mb db test` passes with full 60-check suite
- Finalize `mb db workflow` argument parsing and error handling
- Run fresh-project end-to-end test for `mb init` + `mb db` workflow

## Current Decisions
1. **Setup Wizard as Default**: All new projects see wizard first
2. **Skip Wizard for Existing**: Auto-detect initialized projects, skip to viewer
3. **Modular Architecture**: setup.js is standalone module, non-breaking
4. **No CLI Required**: Complete no-CLI workflow now possible
5. **Security First**: All paths validated, directory traversal prevented
6. **Backward Compatible**: mb init CLI still works, produces same results

## System Status
- **Database**: ✅ Operational (Phase A Schema + Phase B/C lib modules)
- **Insert/Regenerate Libs**: ✅ inserts.js, regenerate.js, workflow.js ported and tested (60 tests passing)
- **CLI (T13)**: 🔄 `mb db` subcommands implemented — needs schema alignment
- **Viewer (T19)**: ✅ Modular, Bug-free (Read-only mode)
- **Editor (T19)**: ✅ DB management, edit_history import, tasks/sessions/session_cache import
- **Setup Wizard (T19)**: ✅ Complete 4-step initialization flow
- **Template Creation**: ✅ All core files auto-generated
- **Management UI**: 🔄 Write capabilities pending (Phase 3 Part 2)
