# Active Context

*Last Updated: 2026-09-08 16:09:24 IST*

## Current Tasks
1. **[T28]**: Event-Backed Memory Bank Coordination (HIGH priority)
   - Status: 🔄 IN PROGRESS
   - Current Focus: T28a Markdown-to-event import design using the copied ArXivite Memory Bank fixture
   - Boundary: Text remains authoritative; no production schema or workflow changes are authorized
   - Next: Inventory fixture formats and define the smallest loss-aware event envelope

2. **[T20]**: Memory Bank Database Parser (MEDIUM priority)
   - Status: 🔄 IN PROGRESS
   - Current Focus: Parser adaptation for cross-project backfill use
   - Recent Achievement: Parser scripts exist (~1100 lines total in `memory-bank/database/`). `mb workflow`/`mb db workflow` now support record-only and regenerate-only actions, and `mb db sync` provides upgrade path for existing generated projects
   - Gap: Parsers written for mb-core v6.10 format; need normalization for emoji status, timezone parsing, file modification actions
   - Next: Reuse parser normalization lessons in T28a and test against the copied ArXivite fixture

3. **[T13]**: Implement Memory Bank CLI (HIGH priority)
   - Status: 🔄 IN PROGRESS
   - Current Focus: Hold steady — CLI hardening complete from Phase E
   - Recent Achievement: Fresh-project DB workflow bootstrap and completion paths verified
   - Next: Add `--skip-regenerate` flag to `mb db workflow` when record-only mode is implemented

4. **[T27]**: Publish the Memory Bank CLI to npm (HIGH priority)
   - Status: 🔄 IN PROGRESS
   - Current Focus: `0.1.0-beta.1` is published and accepted; dist-tag cleanup is blocked by npm permission, while the GitHub Actions runtime update is CI-green
   - Dependencies: T13 CLI functionality and T25 clean-install/package lessons
   - Next: Obtain dist-tag management permission, then gather prerelease feedback before stable release

5. **[META-1]**: Memory Bank Update and Maintenance (HIGH priority)
   - Status: 🔄 IN PROGRESS
   - Current Focus: Synchronize DB workflow Phase F findings across all docs
   - Next: Ensure all canonical files reflect the text-primary-until-backfill decision

6. **[T25]**: Standalone Node Package (Browser-First) (HIGH priority)
   - Status: ✅ COMPLETED
   - Current Focus: Hold completed packaging work steady

7. **[T17]**: Maintenance and Upkeep of Integrated Rules (MEDIUM priority)
   - Status: 🔄 IN PROGRESS
   - Current Focus: Rules documentation v6.12 alignment

8. **[T22]**: AdminJS Database Management Interface (HIGH priority)
   - Status: ❌ CANCELLED (2025-11-22)
   - Reason: Excessive complexity/dependency hell. Shelved in favor of extending T19.

## Completed Tasks (Recent)
1. **[T21]**: Schema v1.1 Alignment
   - Status: ✅ COMPLETED (2026-06-26)
   - Output: Canonical schema, libraries, parsers, commands, templates, and tests aligned

2. **[T19 Phase 2 Refactor]**:
   - Status: ✅ COMPLETED (2025-11-22)
   - Output: Modular Viewer architecture

## Implementation Focus - Current Session (T28 Planning)

- ✅ Copied a filtered ArXivite Memory Bank fixture to `/Users/deepak/code/mb-core-test/memory-bank/`
- ✅ Defined T28a import, T28b projection, and T28c concurrency-test stages
- ⬜ Inventory the fixture and define the versioned event envelope
- ⬜ Test deterministic projection and semantic round trips
- ⬜ Test parallel merge, retry, duplicate, and contradiction behavior

## Historical Database Work (T21)
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
- Begin T28a with a read-only fixture inventory and import coverage report
- Keep generated output separate from the copied fixture during experiments
- Implement record-only mode (`skip_regeneration` flag) in `workflow.js`
- Adapt T20 parsers for Cloudy workspace format (test case for cross-project backfill)
- Run roundtrip test: text → DB → text, verify equivalence
- Only after roundtrip passes: consider DB-primary transition

## Current Decisions
1. **T28 is an experiment**; the production Memory Bank remains text-first
2. **Event files are the candidate portable authority**; SQLite may become a generated local index
3. **T21 remains completed** and is not reopened by T28
4. **Text stays primary until an alternative is fully validated**
5. **No code changes until design validated** — document first, patch later
6. **Setup Wizard as Default**: All new projects see wizard first
7. **Skip Wizard for Existing**: Auto-detect initialized projects, skip to viewer
8. **Modular Architecture**: setup.js is standalone module, non-breaking
9. **No CLI Required**: Complete no-CLI workflow now possible
10. **Security First**: All paths validated, directory traversal prevented
11. **Backward Compatible**: mb init CLI still works, produces same results

## System Status
- **Database**: ✅ Operational in canonical repo and verified in Cloudy workspace
- **Insert/Regenerate Libs**: ✅ Canonical and generated-project workflow paths pass tests
- **CLI (T13)**: ✅ Fresh-project DB workflow bootstrap and verification path runs
- **Viewer (T19)**: ✅ Modular, Bug-free (Read-only mode)
- **Editor (T19)**: ✅ DB management, edit_history import, tasks/sessions/session_cache import
- **Setup Wizard (T19)**: ✅ Complete 4-step initialization flow
- **Template Creation**: ✅ All core files auto-generated
- **Management UI**: 🔄 Write capabilities pending (Phase 3 Part 2)
