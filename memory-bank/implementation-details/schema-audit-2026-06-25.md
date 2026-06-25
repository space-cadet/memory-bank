# Schema Audit Report — mb-core Repository

*Date: 2026-06-25 19:44 UTC*  
*Auditor: Cloudy*  
*Scope: All `.sql`, `.js` files in `memory-bank/database/`, `mb-cli/templates/memory-bank/database/`, `mb-cli/src/server-package/`, `skills/mb-db-workflow/references/`*  
*Reference: `schema-protocol-reference.md` (v1.1)*

---

## Executive Summary

The mb-core repository contains **multiple schema conventions** that have drifted apart. There are two competing naming systems:

- **OLD names (v1.0):** `updated`, `date`, `period`, `focus`, `notes`
- **NEW names (v1.1):** `last_updated`, `session_date`, `session_period`, `focus_task`, `content`

Some files use OLD, some use NEW, and some use a mix. The canonical `schema.sql` in `memory-bank/database/` still uses OLD names, while the template `schema.sql` in `mb-cli/templates/` uses NEW names. This means **no single schema file is consistent with all lib/parser/cli code**.

**Impact:** Any project initialized with `mb init --database` gets a schema that mismatches `regenerate.js`, `test-schema.js`, `generate-test-data.js`, and several CLI commands. Any DB workflow will produce `no such column` errors.

---

## 1. Schema Files — 5 Copies Found, 4 Inconsistent

| File | OLD/NEW | `task_subtasks` | `start_time`/`end_time` | Notes |
|------|---------|-----------------|------------------------|-------|
| `memory-bank/database/schema.sql` | **OLD** | ❌ Missing | ✅ Present | Canonical but stale |
| `mb-cli/templates/memory-bank/database/schema.sql` | **NEW** | ❌ Missing | ✅ Present | Template but missing `task_subtasks` |
| `mb-cli/src/server-package/schema.sql` | **OLD** | ❌ Missing | ❌ Missing | Stale copy from before init-schema.js migration |
| `skills/mb-db-workflow/references/schema.sql` | **OLD** | ❌ Missing | ❌ Missing | Skill reference is stale |
| `archive/to_delete_2025-12-16/.../schema.sql` | **OLD** | ❌ Missing | ❌ Missing | Archived, can be ignored |

**Issue:** Only the template schema uses NEW names, but it still lacks `task_subtasks`. The canonical schema is the one used by the mb-core project itself, but it uses OLD names — so the mb-core project's own database is inconsistent with its own template.

---

## 2. Lib Files — Both Copies Broken in Different Ways

### 2.1 `inserts.js`

| Location | `task_items` | `sessions` | `session_cache` | Verdict |
|----------|-------------|-----------|-----------------|---------|
| `memory-bank/database/lib/inserts.js` | `updated` (OLD) | `date`, `period`, `focus` (OLD) | `focus_task` (OK) | Matches canonical schema (OLD) |
| `mb-cli/templates/memory-bank/database/lib/inserts.js` | `last_updated` (NEW) | `session_date`, `session_period`, `focus_task` (NEW) | `focus_task` (OK) | Matches template schema (NEW) |

**Verdict:** Each copy is internally consistent with its paired schema, but the two copies diverge. Downstream repos that copy the template get the NEW convention, while the mb-core project itself uses OLD.

### 2.2 `workflow.js`

| Location | `sessions` Query | `session` SELECT | Verdict |
|----------|-----------------|-----------------|---------|
| `memory-bank/database/lib/workflow.js` | `date = ? AND period = ?` (OLD) | `focus` (OLD) | Matches OLD schema |
| `mb-cli/templates/memory-bank/database/lib/workflow.js` | `session_date = ? AND session_period = ?` (NEW) | `focus_task` (NEW) | Matches NEW schema |

**Verdict:** Same divergence as `inserts.js`.

### 2.3 `regenerate.js` — **BOTH COPIES BROKEN**

| Query | Canonical Copy | Template Copy | Expected (v1.1) |
|-------|---------------|---------------|-----------------|
| `SELECT ... FROM task_items` | `updated` (OLD) | `updated` (OLD) | `last_updated` |
| `SELECT ... FROM sessions` | `date`, `period`, `focus` (OLD) | `date`, `period`, `focus` (OLD) | `session_date`, `session_period`, `focus_task` |
| `WHERE focus = ?` | `focus` (OLD) | `focus` (OLD) | `focus_task` |
| `ORDER BY date` | `date` (OLD) | `date` (OLD) | `session_date` |
| `latestSession.date` | `date` (OLD) | `date` (OLD) | `session_date` |
| `latestSession.period` | `period` (OLD) | `period` (OLD) | `session_period` |
| `t.updated` for completed | `updated` (OLD) | `updated` (OLD) | `last_updated` |

**Verdict:** `regenerate.js` is the most broken file. It uses OLD names in **both** copies, but the template schema (which gets deployed to new projects) uses NEW names. This means **any new project initialized with `mb init --database` will have a schema that regenerate.js cannot read**.

### 2.4 `sqlite.js`

No schema references. Clean.

---

## 3. Parser Files — All Use OLD Names

| Parser | `task_items` | `sessions` | `session_cache` | Verdict |
|--------|-------------|-----------|-----------------|---------|
| `parse-tasks.js` (both copies) | `updated` (OLD) | N/A | N/A | Broken against NEW schema |
| `parse-sessions.js` (both copies) | N/A | `date`, `period`, `focus`, `content` (OLD) | N/A | Broken against NEW schema |
| `parse-session-cache.js` (both copies) | N/A | N/A | `focus_task` (OK) | OK |
| `parse-edits.js` (both copies) | N/A | N/A | N/A | OK |

**Verdict:** `parse-tasks.js` and `parse-sessions.js` in both locations use OLD names. They will fail against the NEW template schema.

**Note:** Parsers correctly use `DELETE FROM` (not `DROP TABLE`) since commit `a961805`. Good.

---

## 4. Test Files — Broken Against Canonical Schema

| File | Uses NEW names? | Broken against canonical? | Broken against template? |
|------|----------------|--------------------------|------------------------|
| `memory-bank/database/test-schema.js` | ✅ Yes (`session_date`, `session_period`, `focus_task`, `last_updated`, `notes`) | ✅ Yes — canonical schema has `date`, `period`, `focus`, `updated`, `content` | ✅ Yes — uses `notes` instead of `content`, and `id`/`current_session_id` in `session_cache` instead of `session_id` |
| `memory-bank/database/test-workflow.js` | TBD — not audited in detail | Likely | Likely |
| `memory-bank/database/generate-test-data.js` | ✅ Yes (`session_date`, `session_period`, `focus_task`, `last_updated`) | ✅ Yes | ❌ No |
| `mb-cli/templates/memory-bank/database/generate-test-data.js` | ✅ Yes | N/A | ❌ No |
| `mb-cli/templates/memory-bank/database/test-schema.js` | TBD | N/A | Likely |

**Verdict:** The canonical `test-schema.js` and `generate-test-data.js` are written for the NEW convention but the canonical schema uses OLD. This means running tests in the mb-core project itself would fail.

**Additional issue in `test-schema.js`:** It inserts into `session_cache` with columns `id`, `current_session_id`, `current_focus_task`, `active_count`, `paused_count`, `completed_count`, `last_updated` — but the schema defines `session_id`, `status`, `focus_task`, `active_tasks_count`, `paused_tasks_count`, `completed_tasks_count`, `cancelled_tasks_count`, `raw_content`. This is a **completely different column set**.

---

## 5. CLI Commands — Mixed

| Command | File | Uses OLD or NEW? | Issue |
|---------|------|-----------------|-------|
| `mb task list` | `mb-cli/src/commands/task.js` | OLD (`updated`) | Should use `last_updated` |
| `mb task update` | `mb-cli/src/commands/task.js` | OLD (`updated = ?`) | Should use `last_updated` |
| `mb session start` | `mb-cli/src/commands/session.js` | OLD (`date`, `period`, `focus`) | Should use `session_date`, `session_period`, `focus_task` |
| `mb session list` | `mb-cli/src/commands/session.js` | OLD (`date`, `period`, `focus`) | Should use `session_date`, `session_period`, `focus_task` |
| `mb session complete` | `mb-cli/src/commands/session.js` | OLD (`focus`) | Should use `focus_task` |
| `mb session cache` | `mb-cli/src/commands/session.js` | NEW (`focus_task`) | OK |
| `mb db workflow` | `mb-cli/src/commands/db.js` | Pass-through | Calls `workflow.js` which is correct in template but not in canonical |

**Verdict:** CLI commands use OLD names throughout. They will work with the canonical schema (OLD) but break against the template schema (NEW).

---

## 6. Server Package — Completely Stale

`mb-cli/src/server-package/` contains pre-sql.js versions of:
- `schema.sql` (OLD names, missing `start_time`/`end_time`, missing `task_subtasks`)
- `lib/sqlite.js` (pre-queue, pre-saveDb fixes)
- All parser files (OLD names, `DROP TABLE` instead of `DELETE FROM`)

**Verdict:** This entire directory appears to be a stale snapshot from before the sql.js migration and before the column rename. It should either be updated or deleted.

---

## 7. Skills Reference — Stale

`skills/mb-db-workflow/references/schema.sql` uses OLD names and is missing `task_subtasks`, `start_time`, `end_time`.

**Verdict:** Skill reference is outdated. Agents using this skill may emit incorrect SQL.

---

## 8. Issue Matrix (Files × Problems)

```
File                                    | Schema Mismatch | Missing Table | Wrong Column Names | Stale Copy | DROP TABLE |
----------------------------------------|-----------------|---------------|--------------------|------------|------------|
memory-bank/database/schema.sql         | ✅              | ✅ task_subtasks | ✅ OLD names      |            |            |
mb-cli/templates/memory-bank/database/schema.sql |         | ✅ task_subtasks |                 |            |            |
mb-cli/src/server-package/schema.sql    | ✅              | ✅ task_subtasks | ✅ OLD names      | ✅         |            |
skills/mb-db-workflow/references/schema.sql | ✅        | ✅ task_subtasks | ✅ OLD names      | ✅         |            |
memory-bank/database/lib/inserts.js     |                 |               | ✅ OLD names       |            |            |
mb-cli/templates/.../lib/inserts.js     |                 |               |                    |            |            |
memory-bank/database/lib/workflow.js    |                 |               | ✅ OLD names       |            |            |
mb-cli/templates/.../lib/workflow.js    |                 |               |                    |            |            |
memory-bank/database/lib/regenerate.js  |                 |               | ✅ OLD names       |            |            |
mb-cli/templates/.../lib/regenerate.js  |                 |               | ✅ OLD names       |            |            |
memory-bank/database/parse-tasks.js     |                 |               | ✅ OLD names       |            |            |
mb-cli/templates/.../parse-tasks.js     |                 |               | ✅ OLD names       |            |            |
memory-bank/database/parse-sessions.js  |                 |               | ✅ OLD names       |            |            |
mb-cli/templates/.../parse-sessions.js  |                 |               | ✅ OLD names       |            |            |
memory-bank/database/test-schema.js     | ✅              | ✅ (session_cache cols) | ✅ mixed   |            |            |
memory-bank/database/generate-test-data.js |              |               | ✅ NEW names       |            |            |
mb-cli/src/commands/task.js             |                 |               | ✅ OLD names       |            |            |
mb-cli/src/commands/session.js          |                 |               | ✅ OLD names       |            |            |
mb-cli/src/server-package/ (all)        | ✅              | ✅             | ✅ OLD names       | ✅         | ✅         |
```

---

## 9. Root Cause Analysis

1. **No single source of truth:** The schema evolved organically. Changes were made to some files (template schema, template inserts.js, template workflow.js) but not propagated to all copies (canonical schema, regenerate.js, parsers, CLI commands, test files, skill reference).

2. **Copy-paste drift:** `mb-cli init` copies template files to new projects. But the template files themselves were only partially updated. The `server-package` directory is an even older copy.

3. **Regenerate.js was never updated:** Both copies of `regenerate.js` still use the original v1.0 column names. This is the most critical bug because it breaks text regeneration — the core feature of the DB-native workflow.

4. **Test files were written for the target, not the reality:** `test-schema.js` and `generate-test-data.js` were written assuming the NEW names were already deployed, but they weren't.

5. **mb-cli init doesn't refresh lib files:** If a project already has `memory-bank/database/lib/` files, `mb init --force` doesn't overwrite them from the template. This means downstream repos are stuck with whatever version they first copied.

---

## 10. Recommended Fix Order

### Phase 1: Choose canonical naming (DONE — v1.1 ratified in `schema-protocol-reference.md`)
- Adopt NEW names: `last_updated`, `session_date`, `session_period`, `focus_task`, `content`
- Add `task_subtasks` table to all schema.sql copies

### Phase 2: Fix the canonical schema
1. Update `memory-bank/database/schema.sql` to v1.1 (NEW names + `task_subtasks`)
2. Update `memory-bank/database/lib/inserts.js` to use NEW names
3. Update `memory-bank/database/lib/workflow.js` to use NEW names
4. Update `memory-bank/database/lib/regenerate.js` to use NEW names
5. Update `memory-bank/database/parse-tasks.js` to use `last_updated`
6. Update `memory-bank/database/parse-sessions.js` to use `session_date`, `session_period`, `focus_task`
7. Update `memory-bank/database/test-schema.js` to match actual schema
8. Update `memory-bank/database/generate-test-data.js` if needed (already uses NEW names, but verify against final schema)

### Phase 3: Fix the template
1. Add `task_subtasks` to `mb-cli/templates/memory-bank/database/schema.sql`
2. Update `mb-cli/templates/memory-bank/database/lib/regenerate.js` to use NEW names (inserts.js and workflow.js are already correct)
3. Update `mb-cli/templates/memory-bank/database/parse-tasks.js` to use `last_updated`
4. Update `mb-cli/templates/memory-bank/database/parse-sessions.js` to use NEW names

### Phase 4: Fix CLI commands
1. Update `mb-cli/src/commands/task.js` to use `last_updated`
2. Update `mb-cli/src/commands/session.js` to use `session_date`, `session_period`, `focus_task`
3. Update `mb-cli/src/commands/db.js` if it has hardcoded column references

### Phase 5: Fix skill reference
1. Update `skills/mb-db-workflow/references/schema.sql` to v1.1
2. Update `skills/mb-db-workflow/references/api-reference.md` if it lists column names

### Phase 6: Fix server package (or delete)
1. Either delete `mb-cli/src/server-package/` entirely (it's a stale snapshot)
2. Or update it to match the template

### Phase 7: Fix downstream repos
1. Delete stale `memory-bank/database/lib/` copies in downstream repos
2. Re-copy from updated template
3. Or document that downstream repos should run `mb db sync` to refresh lib files

### Phase 8: Add CI check
1. Add a pre-commit script that verifies `schema.sql` and `lib/*.js` column name consistency
2. Script idea: parse `schema.sql` for CREATE TABLE column names, then grep `lib/*.js` for any forbidden old names

---

## 11. Files Requiring Changes (Complete List)

### Must Change (Critical Path)
1. `memory-bank/database/schema.sql` — canonical schema to v1.1
2. `memory-bank/database/lib/inserts.js` — `updated` → `last_updated`, `date`/`period`/`focus` → `session_date`/`session_period`/`focus_task`
3. `memory-bank/database/lib/workflow.js` — same as above
4. `memory-bank/database/lib/regenerate.js` — same as above (both copies!)
5. `mb-cli/templates/memory-bank/database/schema.sql` — add `task_subtasks`
6. `mb-cli/templates/memory-bank/database/lib/regenerate.js` — `updated` → `last_updated`, `date`/`period`/`focus` → `session_date`/`session_period`/`focus_task`
7. `memory-bank/database/parse-tasks.js` — both copies: `updated` → `last_updated`
8. `memory-bank/database/parse-sessions.js` — both copies: `date`/`period`/`focus` → `session_date`/`session_period`/`focus_task`
9. `memory-bank/database/test-schema.js` — match actual schema, fix `session_cache` column mismatch
10. `mb-cli/src/commands/task.js` — `updated` → `last_updated`
11. `mb-cli/src/commands/session.js` — `date`/`period`/`focus` → `session_date`/`session_period`/`focus_task`

### Should Change (Consistency)
12. `skills/mb-db-workflow/references/schema.sql` — update to v1.1
13. `mb-cli/src/server-package/` — update or delete
14. `memory-bank/database/generate-test-data.js` — verify against final schema

---

## 12. Verification Checklist After Fix

After all changes, run:

```bash
cd memory-bank/database
node test-schema.js          # Should pass all tests
node test-workflow.js        # Should pass all tests

# In a fresh temp directory:
mb init --database test-project
cd test-project/memory-bank/database
node test-schema.js          # Should pass
mb db workflow --task T1 "Test" --regenerate  # Should not throw "no such column"
```

---

*End of Audit. This document is append-only; new findings should be added as sections, not by editing existing ones.*
