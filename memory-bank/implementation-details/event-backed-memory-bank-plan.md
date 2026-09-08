# Event-Backed Memory Bank Experiment

*Created: 2026-09-08 16:09:24 IST*
*Last Updated: 2026-09-08 16:09:24 IST*

## Purpose

Test whether immutable JSON or JSONL event records can support parallel Memory
Bank work more safely than shared Markdown coordination files or a committed
SQLite database.

## Current Boundary

- The production Memory Bank remains text-first.
- The experiment uses `/Users/deepak/code/mb-core-test/memory-bank/`.
- The source ArXivite repository must remain unchanged.
- No production schema, CLI, or regeneration behavior changes during planning.
- SQLite may be evaluated later as a disposable local query index.

## Work Plan

### T28a: Import and Event Model

Inventory the fixture, define a versioned event envelope, import the existing
records, and report preserved, normalized, and unsupported information.

Minimum event identity and provenance candidates include event ID, schema
version, event type, task or session ID, actor, timestamp, base version,
source branch, source commit, and payload.

### T28b: Markdown Projection

Generate deterministic human-readable views from the imported events. Compare
meaning before exact formatting and require stable repeated output. Complete a
round trip from events to Markdown and back to events.

### T28c: Concurrency Tests

Simulate parallel independent updates, overlapping task changes, retries,
duplicate events, ownership conflicts, and contradictory decisions. Valid
event order variations must converge; real contradictions must be reported.

## Expected Evidence

- Import coverage and unsupported-content report
- Deterministic projection comparison
- Round-trip equivalence results
- Parallel merge and conflict test matrix
- Recommendation to adopt, revise, or reject the model

## Initial Success Condition

The experiment succeeds only if the event source preserves existing meaning,
merges independent work without shared-file conflicts, detects contradictions,
and can regenerate useful Markdown predictably.

## Related Work

- T20 supplies existing Markdown parsing experience.
- T21 remains the completed schema-alignment task.
- `database-update-workflow-plan.md` remains the record of the SQLite-first approach.
