# Active Context

*Last Updated: 2026-05-22 20:18:36 IST*

## Current Tasks
1. **[T21]**: Database-Native Memory Bank Update Workflow (HIGH priority)
   - Status: 🔄 IN PROGRESS
   - Current Focus: Phase F gaps — record-only mode, full backfill tool, safe migration strategy
   - Recent Achievement: Cross-project validation in Cloudy workspace: 62/62 tests pass, workflow execution successful, DB insert/regenerate functional. Added explicit record/regenerate workflow modes, added `mb db sync`, and fixed importer/viewer schema drift plus sql.js import persistence
   - Critical Finding: No record-only mode — `recordSessionWork()` always regenerates text files
   - Critical Finding: Regeneration from partially-populated DB destroyed edit history (Cloudy workspace had 0 edit entries, so `edit_history.md` was truncated to 1 entry)
   - Decision: Text files stay primary until DB is fully backfilled; DB serves as audit log during transition
   - Next: Document migration strategy (done), plan record-only implementation, evaluate parser adaptation for backfill. Run a focused cleanup pass for `mb db --db <path> ...` option handling consistency

2. **[T20]**: Memory Bank Database Parser (MEDIUM priority)
   - Status: 🔄 IN PROGRESS
   - Current Focus: Parser adaptation for cross-project backfill use
   - Recent Achievement: Parser scripts exist (~1100 lines total in `memory-bank/database/`). `mb workflow`/`mb db workflow` now support record-only and regenerate-only actions, and `mb db sync` provides upgrade path for existing generated projects
   - Gap: Parsers written for mb-core v6.10 format; need normalization for emoji status, timezone parsing, file modification actions
   - Next: Adapt T20 parsers for Cloudy workspace format as test case, verify roundtrip integrity. Complete `--db` path-handling cleanup pass and re-verify command matrix

3. **[T13]**: Implement Memory Bank CLI (HIGH priority)
   - Status: 🔄 IN PROGRESS
   - Current Focus: Hold steady — CLI hardening complete from Phase E
   - Recent Achievement: Fresh-project DB workflow bootstrap and completion paths verified
   - Next: Add `--skip-regenerate` flag to `mb db workflow` when record-only mode is implemented

4. **[META-1]**: Memory Bank Update and Maintenance (HIGH priority)
   - Status: 🔄 IN PROGRESS
   - Current Focus: Synchronize DB workflow Phase F findings across all docs
   - Next: Ensure all canonical files reflect the text-primary-until-backfill decision

5. **[T25]**: Standalone Node Package (Browser-First) (HIGH priority)
   - Status: ✅ COMPLETED
   - Current Focus: Hold completed packaging work steady

6. **[T17]**: Maintenance and Upkeep of Integrated Rules (MEDIUM priority)
   - Status: 🔄 IN PROGRESS
   - Current Focus: Rules documentation v6.12 alignment

7. **[T22]**: AdminJS Database Management Interface (HIGH priority)
   - Status: ❌ CANCELLED (2025-11-22)
   - Reason: Excessive complexity/dependency hell. Shelved in favor of extending T19.

## Completed Tasks (Recent)
1. **[T21 Phase E]**: Database-Native Memory Bank Update Workflow
   - Status: ✅ COMPLETED (2026-05-21)
   - Output: Sibling-project verification passes; repeat logging, direct completion, generated-project bootstrap fixed

2. **[T19 Phase 2 Refactor]**:
   - Status: ✅ COMPLETED (2025-11-22)
   - Output: Modular Viewer architecture

## Implementation Focus - Current Session (T21 + T20)
**Phase F cross-project validation and gap documentation (2026-05-22):**
- ✅ Cloudy workspace synced DB libraries from mb-core Phase E
- ✅ `mb db test` in Cloudy workspace: 62 passed, 0 failed
- ✅ `mb db workflow` for T21 (Image Generation Setup): atomic insert, 234ms, 8 file modifications recorded
- ✅ Created migration strategy document: `db-workflow-migration-strategy.md`
- ✅ Updated T21 task with Phase F findings, record-only gap, backfill need
- ✅ Updated T20 task with parser adaptation Phase 4 subtasks
- 🔄 Text files restored after regeneration incident (git checkout recovery)
- ❌ Record-only mode not yet implemented
- ❌ Backfill tool not yet adapted
- ❌ DB cannot be considered primary until backfill verified

## Next Steps
- Implement record-only mode (`skip_regeneration` flag) in `workflow.js`
- Adapt T20 parsers for Cloudy workspace format (test case for cross-project backfill)
- Run roundtrip test: text → DB → text, verify equivalence
- Only after roundtrip passes: consider DB-primary transition

## Current Decisions
1. **Text stays primary until DB is fully backfilled** (2026-05-22)
2. **Record-only mode is a blocker** for safe DB adoption
3. **No code changes until design validated** — document first, patch later
4. **Setup Wizard as Default**: All new projects see wizard first
5. **Skip Wizard for Existing**: Auto-detect initialized projects, skip to viewer
6. **Modular Architecture**: setup.js is standalone module, non-breaking
7. **No CLI Required**: Complete no-CLI workflow now possible
8. **Security First**: All paths validated, directory traversal prevented
9. **Backward Compatible**: mb init CLI still works, produces same results

## System Status
- **Database**: ✅ Operational in canonical repo and verified in Cloudy workspace
- **Insert/Regenerate Libs**: ✅ Canonical and generated-project workflow paths pass tests
- **CLI (T13)**: ✅ Fresh-project DB workflow bootstrap and verification path runs
- **Viewer (T19)**: ✅ Modular, Bug-free (Read-only mode)
- **Editor (T19)**: ✅ DB management, edit_history import, tasks/sessions/session_cache import
- **Setup Wizard (T19)**: ✅ Complete 4-step initialization flow
- **Template Creation**: ✅ All core files auto-generated
- **Management UI**: 🔄 Write capabilities pending (Phase 3 Part 2)
