# Event-Backed Memory Bank Experiment

*Created: 2026-09-08 16:09:24 IST*
*Last Updated: 2026-09-08 16:55:56 IST*

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

## T28a Fixture Inventory

The filtered ArXivite fixture contains 1,002 files:

- 992 Markdown files and 10 supporting code, HTML, JSON, or graph files
- 210 task files, 299 session files, and 185 edit chunks
- 166 implementation-detail files
- 236 distinct task-like references across the Markdown corpus

The source is not uniform. Only 45 task files use a `Task Information`
section, 23 task files have YAML front matter, and 93 session filenames use a
descriptive or older naming form. Status text, heading levels, timestamps, and
edit-entry layouts vary. Both `activeContext.md` and an older
`active-context.md` exist. Thirty files contain absolute path references.

These variations must be reported during import rather than silently rewritten.

## Proposed Event Envelope

Each imported or new event should contain:

```json
{
  "schema_version": 1,
  "event_id": "stable unique ID",
  "project_id": "arxivite",
  "event_type": "task.recorded",
  "entity": { "type": "task", "id": "T102" },
  "occurred_at": "2026-09-08T14:38:02+05:30",
  "actor_id": null,
  "expected_version": null,
  "source": {
    "path": "memory-bank/tasks/T102.md",
    "content_hash": "sha256 value",
    "branch": "main",
    "commit": "source commit when known"
  },
  "data": {},
  "raw_markdown": "original section or record",
  "warnings": []
}
```

Imported IDs should be derived from project ID, source path, record position,
and content hash so that repeated imports do not create duplicates. New events
can use time-sortable unique IDs. Unknown dates, actors, or versions remain
empty; they must not be invented.

Initial event types are limited to task, session, edit, decision, and artifact
records. `project_id` is required because task IDs such as T28a exist in more
than one repository. `raw_markdown` preserves text that the importer cannot
normalize safely. `warnings` records missing or unclear fields.

## T28a Decision

The first importer favored preservation over aggressive parsing. It produced
events plus a coverage report and wrote neither to the fixture nor to the
production Memory Bank. This work was completed in T28a.

## T28a First Import Result

`mb-cli/scripts/import-memory-bank-events.mjs` now reads a Memory Bank and
writes `events.jsonl` and `coverage.json` to a separate output folder. It
creates one event per source file, keeps text unchanged in `raw_content`, and
keeps non-text bytes as base64. The source folder is never an output target.

Two imports of the ArXivite fixture each produced 1,002 events with identical
event-file hashes (`cdb85d806e5816d0f277a727ec20ba8607ba20957c9b12dd10b957aede0be6ba`).
The coverage report counted 210 task files, 299 session files, 185 edit chunks,
230 implementation-detail files, and 78 other files. It reported 291 files
without a source timestamp. Those warnings are retained for review; they are
not invented or silently changed.

The importer extracts basic task status, parent, dependency text, headings,
task references, and checklists. It preserves all other content. Separate
relationship and decision events were added in the semantic import step below.

## T28a Semantic Import Result

The importer now adds observed events alongside each original file record:

- `task.status_observed`
- `task.parent_observed`
- `task.dependency_observed`
- `decision.observed`

The full fixture produces 2,203 stable events from 1,002 source files: 199
status observations, 16 parent observations, 155 dependency observations, and
831 decision observations. The count is evidence of what the fixture contains,
not proof that all statements are current decisions.

`event-state.mjs` is a small test-only state resolver for future state-changing
events. It accepts independent changes, ignores an event replay with the same
ID, and reports two incompatible changes to the same field and version. It does
not select a hidden winner. Imported observations do not change state; a future
writer must provide an expected version before it can do so.

## T28b Projection Result

`project-memory-bank-events.mjs` writes a source-preserving projection plus
five generated Markdown views: tasks, sessions, context, progress, and history.
It also writes a warnings view. The source-preserving part restores every
original record to its original relative path; the views are concise summaries.

Two full-fixture projections produced byte-identical views. Re-importing the
source-preserving projection produced the same 1,002 record events, in the same
order, with no lost records. The 291 missing timestamp warnings remain visible
in the warnings view.

## T28c Concurrency Result

`event-store.mjs` stores each new event as its own immutable JSON file. Two
agents can therefore create files for separate event IDs without editing the
same JSONL line or Markdown section. Replaying an identical event reports a
duplicate; a different event using the same ID is rejected.

The resolver tests show that independent fields converge regardless of input
order. Two changes to the same field and expected version report a conflict;
this was tested for task status, ownership, and decision outcome. No implicit
last-writer-wins rule is used.

## Recommendation

Revise the approach before production adoption. Use immutable per-event JSON
files as the candidate coordination store, with generated JSONL as a portable
export and generated Markdown as the readable view. Do not make a shared JSONL
file authoritative: concurrent appends would recreate the same shared-write
problem that this experiment is meant to remove.

Before a real migration, define authenticated writer identity and ownership,
test actual Git merge behavior, and obtain approval for a repository migration
plan. The production Memory Bank remains text-first.

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
