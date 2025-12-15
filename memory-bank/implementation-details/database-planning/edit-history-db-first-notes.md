# Edit History DB-first notes
 
 *Created: 2025-12-15 10:05:00 IST*
 *Last Updated: 2025-12-15 10:06:00 IST*
 
 ## Goal
 - Start DB-first work by focusing only on edit_history.
 - Learn by making one slice consistent end-to-end: markdown format <-> DB schema <-> parser <-> viewer server (later: writes + export).
 
 ## Current source of truth in text
 - File: `memory-bank/edit_history.md`
 - Structure:
   - `# Edit History`
   - Date group: `### YYYY-MM-DD`
   - Entry: `#### HH:MM:SS TZ - [TaskIds:] Description`
     - TaskIds can be multiple: `T19, T21, T13, T20`.
     - Timezone appears in many entries (IST), but not guaranteed.
   - Modifications list:
     - `- Action `relative/path` - description`
 
 ## Current implementation pieces (DB/parsers)
 
 ### 1) schema.sql (`memory-bank/database/schema.sql`)
 - Defines:
   - `edit_entries(id, date, time, timezone, timestamp, task_id, task_description, created_at)`
   - `file_modifications(id, edit_entry_id, action, file_path, description, created_at)`
 - Allows action: `Created`, `Updated`, `Modified`, `Deleted`
 
 ### 2) parse-edits.js (`memory-bank/database/parse-edits.js`)
 - Creates its own schema (drifts from schema.sql):
   - `edit_entries` without `created_at`
   - `file_modifications` with extra column: `date` (denormalized)
   - creates view: `edit_entry_modifications`
 - Parses entry header using regex:
   - `#### time (seconds optional) timezone optional - remainder`
   - If timezone missing: defaults to UTC
   - If seconds missing: adds `:00`
 - Parses task IDs only if remainder matches:
   - `T<digits>(, T<digits>...): description`
   - Otherwise `task_id` is NULL and whole remainder becomes `task_description`
 - Parses modifications only if action is one of:
   - `Created` | `Modified` | `Updated`
   - `Deleted` is NOT parsed today
 
 ### 3) server.js (`memory-bank/database/server.js`)
 - Opens DB readonly.
 - Only provides browse/search endpoints.
 - No write endpoints.
 
 ## Key mismatches to fix (edit_history scope only)
 - `schema.sql` vs `parse-edits.js` do not define identical columns.
 - Deleted support is inconsistent:
   - `schema.sql` allows `Deleted`
   - `parse-edits.js` does not parse `Deleted`
   - rules mention `Deleted` as a valid action
 
 ## Recommended canonical DB contract (minimal)
 
 ### A) edit_entries
 - `id` INTEGER PRIMARY KEY
 - `date` TEXT NOT NULL (YYYY-MM-DD)
 - `time` TEXT NOT NULL (HH:MM:SS)
 - `timezone` TEXT NOT NULL (e.g., IST, UTC)
 - `timestamp` TEXT NOT NULL (ISO 8601)
 - `task_id` TEXT NULL (store raw `T19, T21` if multiple)
 - `task_description` TEXT NOT NULL
 - (optional) `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
 
 ### B) file_modifications
 - `id` INTEGER PRIMARY KEY
 - `edit_entry_id` INTEGER NOT NULL (FK -> edit_entries.id)
 - `action` TEXT NOT NULL (`Created`|`Modified`|`Updated`|`Deleted`)
 - `file_path` TEXT NOT NULL (repo-relative)
 - `description` TEXT NOT NULL
 - (optional) `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
 
 ## Notes
 - Do NOT store denormalized date in `file_modifications` initially.
   - You can join via `edit_entry_id` when you need date.
 - Keep `task_id` as raw string for now (no normalization table yet).
 
 ## Open decisions (need explicit choice)
 
 ### 1) Deleted action
 - Recommended: support `Deleted` in parser and DB.
 - Alternative: forbid `Deleted` and enforce via validation.
 
 ### 2) Missing timezone in entry headers
 - Current parser behavior: default to UTC
 - Alternative: reject (treat as invalid and force user to include timezone)
 
 ## Implementation steps (edit_history only)
 
 ### 1) Choose canonical schema owner
 Option A (recommended): `schema.sql` owns schema
 - init-schema.js creates tables from schema.sql
 - parse-edits.js assumes tables exist and only inserts
 - avoids each parser creating its own drifted schema
 
 Option B: parse-edits.js owns schema
 - but then schema.sql must be kept perfectly in sync anyway
 
 ### 2) Align schema.sql and parse-edits.js
 - Make both agree on the final column set.
 - Update parse-edits.js to parse `Deleted`.
 - Decide whether to keep the view `edit_entry_modifications` (optional).
 
 ### 3) DB-first writes (later, after alignment)
 - Open DB in write mode (server.js).
 - Add endpoints:
   - POST /api/edit-entries
   - PUT /api/edit-entries/:id
   - DELETE /api/edit-entries/:id
   - POST /api/edit-entries/:id/modifications
   - DELETE /api/file-modifications/:id
 - Validate:
   - date/time formats
   - action enum
   - file_path relative
 
 ### 4) DB -> edit_history.md exporter
 - First version: manual export.
 - Output must match canonical markdown format exactly:
   - group by date
   - entries sorted newest-first (decide ordering)
   - preserve action and backtick paths
 
 ### 5) Safety
 - Backup sqlite file before any write/export.
 - Roundtrip test: insert -> export -> parse -> ensure counts match.
