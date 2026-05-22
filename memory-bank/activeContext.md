# Active Context

*Last Updated: 2026-05-22 20:18:36 IST*

## Current Tasks
1. **[T21]**: Database-Native Memory Bank Update Workflow (HIGH priority)
   - Status: 🔄 IN PROGRESS
   - Current Focus: Keep the DB-native workflow split and sync upgrades documented and verified against sibling fixture behavior
   - Recent Achievement: Added explicit record/regenerate workflow modes, added `mb db sync`, and fixed importer/viewer schema drift plus sql.js import persistence
   - Next: Run a focused cleanup pass for `mb db --db <path> ...` option handling consistency

2. **[T13]**: Implement Memory Bank CLI (HIGH priority)
   - Status: 🔄 IN PROGRESS
   - Current Focus: Continue CLI hardening around DB-native workflows and generated-project maintenance
   - Recent Achievement: `mb workflow`/`mb db workflow` now support record-only and regenerate-only actions, and `mb db sync` provides upgrade path for existing generated projects
   - Next: Complete `--db` path-handling cleanup pass and re-verify command matrix

3. **[T25]**: Standalone Node Package (Browser-First) (HIGH priority)
   - Status: ✅ COMPLETED
   - Current Focus: Hold completed packaging work steady while T21/T13 Phase E validation continues
   - Recent Achievement: Project-relative DB workflow support landed in `mb-cli`

4. **[META-1]**: Memory Bank Update and Maintenance (HIGH priority)
   - Status: 🔄 IN PROGRESS
   - Current Focus: Synchronize DB workflow findings, Phase E test log, and stale task/session context

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

## Implementation Focus - Current Session (T21 + T13)
**Phase E hardening and verification (2026-05-20 to 2026-05-21):**
- ✅ Created sibling fixture project at `/Users/deepak/code/memory-bank-test`
- ✅ Exercised fresh-project `mb init --database` -> dependency install -> `mb db init`
- ✅ Fixed missing `schema.sql` copy in generated DB packages
- ✅ Restored missing shared `findDbPath()` helper in `mb-cli/src/commands/db.js`
- ✅ Fixed sql.js `:memory:` persistence and dirty-write handling for repeat DB workflow tests
- ✅ Fixed same-period session reuse so focus/task/session/session_cache stay synchronized
- ✅ Fixed direct `completeSessionWork()` so it can discover the project DB path and run without manual `openDb()`
- ✅ Re-ran `mb db test` twice in the real sibling fixture and confirmed both passes succeed

## Next Steps
- Finish the text-based memory-bank update in `mb-core`
- Keep the implementation docs aligned with the rapid-recording DB workflow design
- Decide whether any additional post-Phase-E cleanup should be split into a separate task

## Current Decisions
1. **Setup Wizard as Default**: All new projects see wizard first
2. **Skip Wizard for Existing**: Auto-detect initialized projects, skip to viewer
3. **Modular Architecture**: setup.js is standalone module, non-breaking
4. **No CLI Required**: Complete no-CLI workflow now possible
5. **Security First**: All paths validated, directory traversal prevented
6. **Backward Compatible**: mb init CLI still works, produces same results

## System Status
- **Database**: ✅ Operational in canonical repo and verified in the real sibling fixture
- **Insert/Regenerate Libs**: ✅ Canonical and generated-project workflow paths now pass the current Phase E checks
- **CLI (T13)**: ✅ Fresh-project DB workflow bootstrap and verification path now runs without the earlier manual fixes
- **Viewer (T19)**: ✅ Modular, Bug-free (Read-only mode)
- **Editor (T19)**: ✅ DB management, edit_history import, tasks/sessions/session_cache import
- **Setup Wizard (T19)**: ✅ Complete 4-step initialization flow
- **Template Creation**: ✅ All core files auto-generated
- **Management UI**: 🔄 Write capabilities pending (Phase 3 Part 2)
