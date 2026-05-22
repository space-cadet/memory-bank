# DB Workflow Migration Strategy and Gaps

*Created: 2026-05-22 17:48 IST*
*Last Updated: 2026-05-22 17:48 IST*

## Context

Phase E hardening (2026-05-21) made the DB-native workflow reliable for recording. Phase F cross-project validation (2026-05-22, Cloudy workspace) confirmed functionality but exposed critical gaps before text files can be replaced by DB-generated output.

## Findings from Phase F Validation

### What Worked
- Cloudy workspace synced DB workflow libraries from mb-core (`memory-bank/database/lib/*.js`)
- `mb db test`: 62 passed, 0 failed
- `mb db workflow --task T21 ...`: DB insert atomic, 234ms, entry + 8 file modifications + session + session_cache recorded correctly
- Session ID generation: `YYYY-MM-DD-period-HHMMSS-shortHash` format

### Critical Gap 1: Regeneration Destroys History Without Full Backfill

**Scenario:** Cloudy workspace had a pre-populated DB with 11 task rows (imported at some earlier point) but **0 edit entries**.

**Action:** Ran `mb db workflow` for T21 (a new task).

**Result:** `regenerateAll()` produced an `edit_history.md` containing only the single new T21 entry. All historical edit history (May 5–21, 2026) was lost from the regenerated file.

**Root Cause:** The DB was the authoritative source for regeneration, and the DB had no edit history. Text files were overwritten.

**Lesson:** DB must be fully backfilled with historical data before regeneration can be trusted.

### Critical Gap 2: No Record-Only Mode

**Current Behavior:** `recordSessionWork()` always calls `regenerate.regenerateAll()` as Step 5. `completeSessionWork()` also always regenerates.

**Problem:** There is no way to build up DB state safely (e.g., during backfill, or for ongoing record-only use) without touching text files.

**Workaround:** Call `inserts.insertEditEntry()` and `inserts.updateTaskStatus()` directly, bypassing the workflow wrapper.

**Fix Needed:** Add `skip_regeneration` parameter to both workflow functions and expose via CLI (`mb db workflow --skip-regenerate`).

### Critical Gap 3: Parsers Exist But Need Adaptation

**Current State:** T20 parsers (`parse-edits.js`, `parse-tasks.js`, `parse-sessions.js`, `parse-session-cache.js`) exist in `memory-bank/database/` (~1100 lines total).

**Problem:** They were written for mb-core's v6.10-era format. Each workspace may have evolved formats (different header structures, emoji conventions, metadata fields).

**Adaptation Needed:**
- Emoji status normalization mapping (🔄→in_progress, ✅→completed, ⏸️→paused, ⬜→pending)
- Date/time parsing with timezone awareness (IST = UTC+5:30)
- File modification action parsing (`Created`, `Modified`, `Updated`, `Deleted`)
- Task dependency extraction from tables + relationship trees
- Session focus tracking across periods
- Edit chunk cross-referencing (some chunks reference tasks but live outside `edit_history.md`)

### Safe Migration Path

```
Phase 1: Keep text primary (current)
  ↓
Phase 2: DB as secondary audit log
  - Use `mb workflow` or direct inserts to record into DB
  - Keep editing text files manually
  - Regenerated files are ignored / compared for validation only
  ↓
Phase 3: Full backfill
  - Run adapted T20 parsers against all text files
  - Verify DB content matches text content (row counts, dates, tasks)
  - Fix parser edge cases until roundtrip is perfect
  ↓
Phase 4: DB-primary transition (optional)
  - Enable record-only mode for routine logging
  - Regenerate text files from DB on explicit request
  - Keep text files as generated output, not source
  - Rollback plan: parsers can always reconstruct DB from text if needed
```

## Decision Log

1. **Text stays primary until backfill verified** (2026-05-22)
2. **Record-only mode is a blocker for safe DB adoption** — needs implementation before Phase 3
3. **Parser adaptation is non-trivial** — each workspace's format evolution must be handled
4. **No code changes until design is validated** — document gaps first, patch later

## Related Tasks

- T21: Database-Native Memory Bank Update Workflow
- T20: Memory Bank Database Parser (adaptation needed)
- T20a: Adaptive LLM-Based Format Parser (may assist with edge cases)

## References

- `memory-bank/implementation-details/database-update-workflow-plan.md`
- `memory-bank/implementation-details/db-workflow-phase-e-test-log-2026-05-20.md`
- `memory-bank/database/parse-*.js` (T20 parser scripts)
