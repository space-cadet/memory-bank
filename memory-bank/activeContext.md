# Active Context

*Last Updated: 2026-06-26 01:33:00 IST*

## Current Tasks
1. **[T21]**: Database-Native Memory Bank Update Workflow (HIGH priority)
   - Status: 🔄 IN PROGRESS
   - Current Focus: Phase F.1 COMPLETE — schema consistency fix across all mb-core files. Phase F.2: downstream propagation, record-only mode, backfill tool
   - Recent Achievement (2026-06-25 night): Full schema fix sweep completed. All canonical files, templates, CLI commands, parsers, and test data aligned to v1.1 naming (`last_updated`, `session_date`, `session_period`, `focus_task`, `content`). `init-schema.js` verification passed. Deleted stale `server-package/`.
   - Critical Finding RESOLVED: Column name mismatch between schema.sql and lib files. All fixed.
   - Next: Propagate fixed templates to downstream repos, implement record-only mode, adapt backfill tool

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

## Implementation Focus - Current Session (T21 Phase F)
**Phase F.1: Schema consistency fix (2026-06-25 night):**
- ✅ Canonical schema.sql updated to v1.1 naming
- ✅ All lib files aligned (inserts.js, workflow.js, regenerate.js)
- ✅ Parser files aligned (parse-tasks.js, parse-sessions.js)
- ✅ CLI commands aligned (task.js, session.js)
- ✅ Templates synced from canonical
- ✅ Test data aligned (test-schema.js, generate-test-data.js)
- ✅ Documentation created (schema-protocol-reference.md, schema-audit-2026-06-25.md)
- ✅ Stale server-package/ deleted
- ✅ init-schema.js verification passed (10 tables, 23 indexes)
- ⬜ Downstream repo propagation (10 projects)
- ⬜ Record-only mode implementation
- ⬜ Backfill tool adaptation

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
