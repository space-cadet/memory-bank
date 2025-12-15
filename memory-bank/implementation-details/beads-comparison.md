# Beads vs. Memory Bank: Similarities and Differences

*Created: 2025-12-15 09:51:42 IST*
*Last Updated: 2025-12-15 09:52:58 IST*

## Related
- [T23: Format Specification System](../tasks/T23.md)
- [T21: Database-Native Memory Bank Update Workflow](../tasks/T21.md)
- [T19: Memory Bank Viewer Web Interface](../tasks/T19.md)
- [T17: Maintenance and Upkeep of Integrated Rules](../tasks/T17.md)
- [Format Specification System - Implementation Details](./format-specification-system.md)
- [Modular Memory Bank Viewer Architecture](./modular-viewer-architecture.md)
- [Database Update Workflow Plan](./database-update-workflow-plan.md)

## Context
- Reference project: https://github.com/steveyegge/beads
- This note compares philosophy and approach, and what changes if Memory Bank goes fully DB-first.
- Assumption: single user / single machine (no multi-user sync requirements).

## High-level summary
- Beads is a git-synced issue tracker designed primarily for AI agents.
- Memory Bank is a structured, human-readable operational knowledge system (tasks, sessions, edit history, context), currently markdown-first with a database-backed viewer.

## Similarities
- Both are agent-facing systems with a strong emphasis on workflow hygiene.
- Both use structured records (not free-form notes) and emphasize auditability.
- Both benefit from “write-time correctness” (validation, constraints, predictable formats) to avoid silent drift.

## Core philosophical differences

### 1) Source of truth
- Beads: committed JSONL is canonical; SQLite is a local cache.
- Memory Bank (current): markdown files are canonical; SQLite is a derived read model.

### 2) Optimization target
- Beads: coordination and task execution (issues + dependencies), fast CRUD, and safe sync.
- Memory Bank: durable project narrative and operational ledger (sessions/edit history/context), with governance via rules and formats.

### 3) Object model
- Beads: one primary entity type (issue) with dependency graph semantics.
- Memory Bank: multiple document/record types (tasks, sessions, edit entries, session cache, context) with different lifecycles.

## Implementation approach differences

### 1) Write path
- Beads: CLI-first writes to local DB, then auto-flush to JSONL.
- Memory Bank: edit markdown (or planned UI writes), then parse into DB for querying/viewing.

### 2) Merge/conflict handling
- Beads: treats merging canonical data as a first-class problem (merge driver, hooks, sync protocol).
- Memory Bank: relies on normal git text merges across multiple markdown files; strict schemas reduce parser breakage.

### 3) Format rigidity
- Beads: rigid machine format (JSONL) by design; humans rarely hand-edit.
- Memory Bank: human-edited markdown is central; requires strict formatting rules + parser compatibility.

## If Memory Bank switches to DB-first (single-machine)
- Main change: DB becomes authoritative; markdown becomes an export/projection instead of the truth.
- Workflow flips from “edit docs then parse” to “CRUD records with validation, then optionally render docs.”
- Format-spec work shifts:
  - From: markdown format strictness and parser survivability.
  - To: schema design, constraints, and write contracts (plus export formats if you still generate markdown).
- Git complexity decreases under single-machine assumption:
  - You can keep the authoritative SQLite locally and choose whether/when to export markdown for commits.

## What DB-first would not change
- The Memory Bank can still preserve narrative artifacts (sessions/edit history) as first-class concepts.
- The viewer/manager UI still needs good ergonomics for agents (fast create/update, clear next actions).

## Open design choice (if/when you revisit multi-machine)
- If you later want sharing without a central server, Beads’ pattern is the reference:
  - canonical text log committed to git (e.g., JSONL)
  - local SQLite cache for speed
  - hooks/merge driver for safe reconciliation
