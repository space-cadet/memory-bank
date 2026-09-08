---
source_branch: main
source_commit: cae6d896f01395e438b1dbfc3c53b24c41a62238
---

#### 16:55:56 IST - T28: Complete projection and concurrency experiment
- Created `mb-cli/scripts/project-memory-bank-events.mjs` - Added deterministic source and Markdown projections
- Created `mb-cli/scripts/event-store.mjs` - Added immutable per-event JSON storage
- Created `mb-cli/test/event-projection.test.js` - Covered byte-stable views and round-trip preservation
- Created `mb-cli/test/event-store.test.js` - Covered independent writes, retries, and ID collisions
- Modified `mb-cli/test/event-import.test.js` - Covered order-independent updates and status, ownership, and decision conflicts
- Modified `memory-bank/tasks/T28.md` - Recorded recommendation and experiment completion
- Modified `memory-bank/tasks/T28b.md` - Marked projection and round-trip acceptance complete
- Modified `memory-bank/tasks/T28c.md` - Marked concurrency acceptance complete
- Modified `memory-bank/tasks.md` - Updated T28 task-family status
- Modified `memory-bank/implementation-details/event-backed-memory-bank-plan.md` - Recorded projection, concurrency, and recommendation evidence
- Modified `memory-bank/activeContext.md` - Closed the experiment without changing production behavior
- Modified `memory-bank/progress.md` - Recorded the final T28 outcome
- Modified `memory-bank/session_cache.md` - Updated the completed experiment state
- Modified `memory-bank/sessions/2026-09-08-afternoon.md` - Appended closeout evidence
- Modified `memory-bank/edit_history.md` - Added the generated-view entry
