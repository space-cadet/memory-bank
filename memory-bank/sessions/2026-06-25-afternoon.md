# Session: 2026-06-25 Afternoon

**Started**: 2026-06-25 18:32:00 IST
**Focus Task**: T21: Database-Native Memory Bank Update Workflow
**Status**: 🔄 **IN PROGRESS**

## Work Done

### T21: Critical Column Name Mismatch Discovery

During end-to-end testing with Sage on the timesarrow repo, discovered that the DB-native workflow templates have a critical mismatch between `schema.sql` column names and `lib/inserts.js` / `lib/workflow.js` column references.

#### Issues Found

1. **inserts.js column mismatch**: References `updated` but schema defines `last_updated`. References `date`, `period`, `focus` but schema defines `session_date`, `session_period`, `focus_task`. References `content` but schema defines `notes` (in some repos).

2. **workflow.js column mismatch**: Queries use `date`, `period`, `focus` instead of `session_date`, `session_period`, `focus_task`.

3. **regenerate.js column mismatch**: Still has ~10 references to old column names (`updated`, `date`, `period`, `focus`) that weren't fixed in commit a961805.

4. **Multiple stale copies in mb-core**: Four schema.sql copies exist in mb-core, all with old column names. `mb-core/memory-bank/database/lib/` has its own stale inserts.js.

5. **Downstream repo drift**: timesarrow was customized to have `id INTEGER`, `notes TEXT`, `start_time TIMESTAMP NOT NULL` but its lib files were copied from the old template and still reference `content`, `date`, `period`, `focus`.

6. **mb-cli init behavior**: The `init` command in `db.js` uses `resolveDbLibBase()` which checks project-local lib files first. So `mb-cli init --force` on an existing project never updates lib files from templates — it reuses the project's old copies.

#### Fixes Applied

- Commit `a961805` on mb-core `main`: Fixed `mb-cli/templates/memory-bank/database/schema.sql` (`updated` → `last_updated`, `date` → `session_date`, `period` → `session_period`, `focus` → `focus_task`)
- Commit `a961805`: Fixed `mb-cli/templates/memory-bank/database/lib/inserts.js` (all SQL references updated)
- Commit `a961805`: Fixed `mb-cli/templates/memory-bank/database/lib/workflow.js` (all queries and function calls updated)

#### Unresolved

- `regenerate.js` still has old column names
- `mb-core/memory-bank/database/lib/` still has stale copies
- 4 schema.sql copies in mb-core still need sync
- `test-workflow.js` not checked
- All downstream repos (timesarrow, etc.) have broken lib files
- `mb-cli init` doesn't update existing lib files from templates

#### Root Cause

No single source of truth. The schema was evolved in one place (mb-core/memory-bank/database/schema.sql) but the lib files and templates were not kept in sync. Additionally, `mb-cli init` copies from templates but `mb-cli init --force` on an existing project reuses the project's local lib files instead of refreshing from templates.

#### Proposed Resolution

1. Fix `regenerate.js` column names to match schema
2. Sync all 4 schema.sql copies in mb-core to canonical version
3. Sync `mb-core/memory-bank/database/lib/` files to canonical version
4. Delete/replace stale lib files in all downstream repos
5. Update `mb-cli init` to always copy from templates, or add `mb db sync --all` to force refresh
6. Add CI test to verify schema + lib consistency on commit

---

**Next Session Focus**: Continue fixing regenerate.js and stale copies, then propagate to downstream repos.

