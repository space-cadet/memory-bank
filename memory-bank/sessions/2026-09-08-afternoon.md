# Session 2026-09-08 - Afternoon
*Created: 2026-09-08 16:09:24 IST*
*Last Updated: 2026-09-08 17:15:16 IST*

## Focus Task
T28: Event-Backed Memory Bank Coordination

**Status**: ✅ COMPLETE

## Session Summary

**Objective**: Record the approved event-backed Memory Bank experiment.

**Scope**: Task ownership, architecture boundary, fixture use, and validation stages.

**Work Completed**:
1. Created T28 and the T28a-T28c task sequence.
2. Created the canonical event-backed experiment plan.
3. Linked T20 parser work and corrected T21's completed status in current context.
4. Kept production text-first behavior and database schema unchanged.

## Context and Working State

**Code Status**: T28 experimental importer, projection, event-store, and tests were added; production code and database schema were unchanged.

**Documentation Status**: Planning, evidence, closeout, and recommendation records were created and cross-linked.

**Key Decisions Made**:
- Use the copied ArXivite Memory Bank as the primary fixture.
- Test import, deterministic projection, and concurrency in sequence.
- Treat SQLite as a possible generated index rather than a committed authority.

## Initial Plan Next Steps
1. Inventory the T28a fixture formats and relationships.
2. Define the smallest versioned, loss-aware event envelope.

## Session Outcome

**Status**: ✅ SESSION COMPLETE

## T28a Fixture Inventory - 2026-09-08 16:26:03 IST

- Counted 1,002 files: 992 Markdown files plus 10 supporting files.
- Found 210 tasks, 299 sessions, 185 edit chunks, and 166 implementation docs.
- Confirmed mixed task, status, timestamp, session-name, and edit formats.
- Confirmed task IDs need repository scope because IDs repeat across projects.
- Defined a small event envelope with stable identity, source details, raw text,
  normalized data, and warnings.
- Kept the fixture and all production behavior unchanged.

Next: implement the read-only importer and coverage report.

## T28a Read-Only Import - 2026-09-08 16:35:22 IST

- Added `mb-cli/scripts/import-memory-bank-events.mjs`.
- Added three focused tests: source unchanged, non-text bytes preserved, and
  output-folder safety.
- Imported the fixture twice into temporary folders: 1,002 events each time,
  with identical event-file hashes.
- Coverage: 210 task files, 299 session files, 185 edit chunks, 230
  implementation-detail files, and 78 other files.
- Retained 291 missing-source-timestamp warnings for later review.

Next: create separate relationship and decision events from the preserved text.

## T28a Semantic Import - 2026-09-08 16:48:10 IST

- Added observed task-status, parent, dependency, and decision events.
- Imported 1,002 source files into 2,203 stable events twice; both JSONL files
  had hash `e6f273e7bb1a65220e1a73a745904dbdf4277a0868fbfe5b3ef8ebf7911febc2`.
- Kept 291 source-timestamp warnings without duplicating them for semantic events.
- Added focused tests for source safety, non-text preservation, retries,
  independent updates, and same-field conflicts; all nine tests pass.

Next: start T28b deterministic Markdown projection.

## T28b and T28c Closeout - 2026-09-08 16:55:56 IST

- Generated task, session, context, progress, history, and warnings views.
- Repeated full-fixture projections matched byte for byte.
- Re-imported projection preserved all 1,002 record events exactly.
- Added immutable per-event JSON storage and tests for independent writes,
  duplicate retries, ID collisions, order-independent state, and conflicts.
- Concluded that shared JSONL must remain an export; it is not a safe primary
  write target for parallel agents.

Outcome: T28 is complete as an experiment. The production Memory Bank remains
text-first pending a separate, approved migration task.
