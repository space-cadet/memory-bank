# DB Workflow Phase E Test Log

*Created: 2026-05-20 18:55:15 IST*
*Last Updated: 2026-05-21 03:00:25 IST*

## Purpose

This log records the Phase E end-to-end verification of the DB-native memory bank workflow using an isolated sibling test project. It captures the exact commands run, the data used, what succeeded, what failed, and any follow-up conclusions.

## Test Environment

- Canonical repo: `/Users/deepak/code/mb-core`
- Isolated test project: `/Users/deepak/code/memory-bank-test`
- CLI entrypoint: `/Users/deepak/code/mb-core/mb-cli/src/index.js`
- Goal: verify real project-relative DB workflow behavior without modifying the canonical text-first memory bank

## Test Data Strategy

Use non-trivial and non-obvious workflow descriptions and file modification paths derived from nearby real repos in `/Users/deepak/code/`, including:

- `med-docs-v2`
- `obsidian-ai`
- `hanyu-xue`

Representative paths selected for realistic workflow coverage:

- `/Users/deepak/code/med-docs-v2/components/ui/collapsible.tsx`
- `/Users/deepak/code/med-docs-v2/vercel.json`
- `/Users/deepak/code/obsidian-ai/src/settings.ts`
- `/Users/deepak/code/obsidian-ai/src/noteEditing/NoteEditingBridge.ts`
- `/Users/deepak/code/hanyu-xue/api/sync/upload.ts`
- `/Users/deepak/code/hanyu-xue/api-lib/auth.ts`

## Execution Log

### 2026-05-20 18:55:15 IST - Initialization

- Created isolated sibling directory: `/Users/deepak/code/memory-bank-test`
- Confirmed there was no pre-existing `memory-bank-test` fixture in `mb-core` root or one level up in `/Users/deepak/code`
- Selected realistic external repo paths for workflow payload data

### 2026-05-20 19:07:38 IST - Fresh Bootstrap Findings

- Ran `node /Users/deepak/code/mb-core/mb-cli/src/index.js init --database` in `/Users/deepak/code/memory-bank-test`
- Result: partial success
  - created `memory-bank/database/lib/` workflow library
  - created parser scripts and package metadata
  - did not copy `schema.sql`
- Ran `node /Users/deepak/code/mb-core/mb-cli/src/index.js db init`
- Result: failed bootstrap sequence on first attempt
  - error: `schema.sql not found — database created but no schema applied`
- Investigated generated files and `mb-cli/src/commands/init.js`
  - found that `schema.sql` existed in the template package
  - found that `init --database` did not include it in `DATABASE_FILES`
- Applied fix in canonical repo:
  - updated `mb-cli/src/commands/init.js` to copy `schema.sql` during `--database` initialization
- Re-ran `init --database` in the test project
  - created missing `memory-bank/database/schema.sql`
- Re-ran `db init`
  - success: schema applied to `/Users/deepak/code/memory-bank-test/memory_bank.db`
- Additional environment finding:
  - generated README recommends `pnpm install`
  - host machine does not have `pnpm`
  - used `npm install` in `memory-bank/database/` to continue Phase E testing

### 2026-05-20 19:19:52 IST - Scenario Execution Findings

- Rebuilt the isolated test project against corrected schema/template assets
- Ran first realistic workflow scenario:
  - task: `T42`
  - description: `Investigated OCR template-counter drift across med-docs-v2 shared-backend routing and Vercel env handoff`
  - file paths:
    - `/Users/deepak/code/med-docs-v2/vercel.json`
    - `/Users/deepak/code/med-docs-v2/components/ui/collapsible.tsx`
    - `/Users/deepak/code/med-docs-v2/SCHEMA_REDESIGN.md`
  - result: success
  - session ID returned: `2026-05-20-evening-191653-c830f3`
  - duration: `22ms`
- Ran second realistic workflow scenario in same period:
  - task: `T57`
  - description: `Rebuilt provider-profile hydration guards after observing stale settings replay across note-editing and startup refresh paths`
  - file paths:
    - `/Users/deepak/code/obsidian-ai/src/settings.ts`
    - `/Users/deepak/code/obsidian-ai/src/noteEditing/NoteEditingBridge.ts`
    - `/Users/deepak/code/obsidian-ai/scripts/make-demo-gif.sh`
  - result: success
  - reused session ID returned: `2026-05-20-evening-191653-c830f3`
  - duration: `17ms`
- Inspected live DB state after repeated runs:
  - `session_cache.focus_task` advanced to `T57`
  - `sessions.focus` remained at original `T42`
  - conclusion: repeated same-period runs do not currently keep session-row focus synchronized with session cache
- Attempted direct `completeSessionWork()` library usage:
  - result: failed
  - error: `No database open. Call openDb() first.`
  - conclusion: direct workflow-library completion path is not yet safe for callers unless they open the DB manually first

### 2026-05-21 02:51:53 IST - Hardening Pass and Final Verification

- Updated canonical and generated workflow libraries to close the remaining Phase E gaps:
  - sql.js `:memory:` now stays in-memory instead of persisting a literal `:memory:` file
  - read-only DB opens no longer overwrite newer writes on close because persistence is now dirty-write gated
  - `recordSessionWork()` now auto-creates missing task rows for rapid logging in fresh projects
  - repeated same-period workflow runs now update `sessions.focus`, `session_cache`, and regenerated session files consistently
  - `completeSessionWork()` now resolves the project DB path automatically and no longer requires the caller to open the DB manually first
  - explicit session completion now updates the focused task status to match the text-based workflow expectations from integrated rules v6.12
- Verified fresh generated-project fixtures in `/private/tmp/mb-phasee-*`:
  - `mb init --database` succeeds
  - `mb db init` succeeds
  - `mb db test` succeeds twice in a row
  - repeated `mb workflow --period evening` runs reuse the same session ID and keep focus synchronized
  - direct `completeSessionWork()` succeeds without manual DB setup
- Synced the updated generated DB workflow files into `/Users/deepak/code/memory-bank-test`
- Verified the real sibling fixture:
  - `mb db test` succeeds twice in a row
  - generated-project behavior now matches the corrected canonical behavior

### 2026-05-21 03:00:25 IST - Canonical Final Check

- Re-ran `node mb-cli/src/index.js db test` directly in `/Users/deepak/code/mb-core`
- Result: success
  - `62 passed, 0 failed`
  - confirms the canonical repo still passes after the final documentation sync

## Scenario Checklist

- [x] Scenario 1: Fresh bootstrap with `mb init --database`
- [x] Scenario 2: Schema initialization with `mb db init`
- [x] Scenario 3: First workflow run with realistic file modifications
- [x] Scenario 4: Repeat workflow run in same project
- [x] Scenario 5: Same-period second session ID uniqueness
- [x] Scenario 6: Task completion transition
- [x] Scenario 7: Extended file regeneration verification
- [x] Scenario 8: DB-versus-markdown integrity cross-check
- [x] Scenario 9: Canonical `mb db test` verification

## Successes

- Isolated sibling fixture project created successfully
- Fresh `init --database` path exercised against a truly empty project
- Real bootstrap defect found and fixed: missing `schema.sql` copy in `mb-cli/src/commands/init.js`
- Schema initialization now succeeds in the isolated test project
- First realistic `mb workflow` scenario succeeds in the isolated sibling project
- Second realistic `mb workflow` scenario also succeeds in the same period
- Fresh generated-project fixtures now pass `mb db test` repeatedly
- Direct `completeSessionWork()` now works without manual DB opening
- Real sibling fixture now passes the corrected generated-project test flow twice in a row

## Failures

- Initial `mb init --database` -> `mb db init` flow failed because `schema.sql` was not copied into the generated project
- Generated package instructions assume `pnpm`, but `pnpm` is not available on this machine

## Open Questions

- The current workflow design should stay optimized for rapid recording of changes via `mb workflow`, with explicit session/task closeout handled by `completeSessionWork()`
