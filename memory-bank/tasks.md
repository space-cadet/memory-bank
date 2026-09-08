# Memory Bank - Sage Workspace

*Created: 2026-06-26 13:21:04 IST*
*Last Updated: 2026-09-08 16:09:24 IST*

## Overview

This is the Memory Bank for the Sage (灵剑) OpenClaw workspace.

## Active Tasks

| ID | Title | Status | Priority | Started | Dependencies | Details |
|----|-------|--------|----------|---------|--------------|---------|
| T28 | Event-Backed Memory Bank Coordination | 🔄 | HIGH | 2026-09-08 | T20 | [Details](tasks/T28.md) |
| T28a | Markdown-to-Event Import | 🔄 | HIGH | 2026-09-08 | T20, T28 | [Details](tasks/T28a.md) |
| T28b | Deterministic Markdown Projection | ⏸️ | HIGH | 2026-09-08 | T28a | [Details](tasks/T28b.md) |
| T28c | Parallel Merge and Conflict Simulation | ⏸️ | HIGH | 2026-09-08 | T28b | [Details](tasks/T28c.md) |
| T20 | Memory Bank Database Parser | 🔄 | MEDIUM | 2025-11-12 | - | [Details](tasks/T20.md) |
| T999 | Verification record only | 🔄 | MEDIUM | 2026-05-22 | - | [Details](tasks/T999.md) |
| T27 | Publish the Memory Bank CLI to npm | 🔄 | HIGH | 2026-08-14 | T13, T25 | [Details](tasks/T27.md) |

## Completed Tasks

| ID | Title | Status | Priority | Started | Completed | Dependencies | Details |
|----|-------|--------|----------|---------|-----------|--------------|---------|
| T21 | Schema v1.1 alignment - migrate sessions to short column names | ✅ | HIGH | 2026-06-26 | 2026-06-26 | - | [Details](tasks/T21.md) |

## Task Relationships

```
T21: Schema v1.1 alignment - migrate sessions to short column names
T999: Verification record only
T27: Publish the Memory Bank CLI to npm (depends on T13, T25)
T28: Event-backed coordination experiment (depends on T20)
  ├─ T28a: Markdown-to-event import
  ├─ T28b: Deterministic Markdown projection (depends on T28a)
  └─ T28c: Parallel merge and conflict simulation (depends on T28b)
```

## Status Summary

- **Active**: 5
- **Pending**: 0
- **Completed**: 1
- **Paused**: 2
- **Total**: 8
