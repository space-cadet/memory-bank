# Memory Bank CLI Workflow

*Version: 1.1 | Updated: 2026-06-26*

This guide documents the `mb` CLI for memory bank projects using the SQLite backend. For the full v6.12 protocol rules, see `integrated-rules-v6.12.md`.

## Quick Start

```bash
# 1. Ensure mb CLI is on PATH
which mb  # should print path

# 2. Initialize a new project (or use existing)
cd your-project
mb init --database    # Creates memory-bank/ + database/ + schema

# 3. Start working
mb task create "My feature" --id T1 --priority high
mb session start --focus T1 --period afternoon

# 4. Record work
mb workflow --record --task T1 --description "Implemented core logic" \
  --files "Created:src/index.js,Modified:src/lib.js" \
  --status in_progress --regenerate

# 5. Wrap up
mb session complete --notes "Core logic done, tests next"
mb task update T1 --status completed
```

## Setup

The `mb` CLI is a Node.js script. If you cloned `mb-core`:

```bash
# Symlink to PATH
ln -s $(pwd)/mb-cli/src/index.js ~/.local/bin/mb

# Ensure node_modules resolve. Option A: shared NODE_PATH
export NODE_PATH="$(dirname $(pwd))/node_modules:${NODE_PATH}"
# Option B: install per-project
cd memory-bank/database && pnpm install sql.js

# Verify
mb --version  # 0.1.0
```

## Commands

### `mb workflow` — Record Session Work

The primary command for agents. Records an edit entry, file changes, task status, and optionally regenerates markdown.

```bash
# Record + regenerate in one shot (most common)
mb workflow --record --task T3 \
  --description "Implemented feature X" \
  --files "Created:src/feature.js,Modified:src/app.js" \
  --status in_progress --period afternoon --regenerate

# Record only (no markdown regeneration)
mb workflow --record --task T3 --description "Quick fix" --files "Modified:bug.js"

# Regenerate only (no new entry)
mb workflow --regenerate

# Record + mark task completed
mb workflow --record --task T3 --description "Done" --status completed --regenerate
```

**Flags:**
- `--record` — Insert edit entry + file modifications into DB
- `--regenerate` — Rewrite `tasks.md`, `edit_history.md`, `session_cache.md` from DB
- `--task <id>` — Task being worked on (e.g., T25)
- `--description <text>` — Brief description of work
- `--files <list>` — Comma-separated `action:path` pairs
- `--status <status>` — Update task status: `in_progress`, `completed`, `paused`
- `--period <period>` — `morning`, `afternoon`, `evening`, `night`
- `--output <dir>` — Markdown output directory (default: `memory-bank/`)

**File Change Syntax:**
```
Created:src/index.js
Modified:lib/util.js
Updated:package.json
Deleted:old-file.js
```

### `mb task` — Task Management

```bash
mb task list                          # List all tasks
mb task list --status in_progress     # Filter by status
mb task show T25                      # Show task details
mb task create "Build API" --id T26 --priority high --status in_progress
mb task update T26 --status completed
mb task delete T26 --yes
```

### `mb session` — Session Management

```bash
mb session start --focus T26 --period afternoon   # Start new session
mb session list                                   # List all sessions
mb session show 2026-06-26-afternoon              # Show session details
mb session complete --notes "Done for today"      # Complete current session
mb session cache                                  # Show session cache
```

### `mb db` — Database Operations

```bash
mb db init                            # Create memory_bank.db from schema.sql
mb db query "SELECT * FROM task_items"              # Table output
mb db query "SELECT * FROM edit_entries" --json     # JSON output
mb db sync --all                      # Sync templates from mb-core
mb db sync --libs                     # Sync lib/ files only
mb db sync --dry-run                  # Preview changes
```

## Two-Layer Documentation

The CLI automates the **chronological layer** (edit entries, tasks, sessions). You must still maintain the **knowledge layer** manually:

| Layer | Automated? | Files |
|-------|-----------|-------|
| Chronological | ✅ Yes | `edit_history.md`, `tasks.md`, `session_cache.md` |
| Knowledge | ❌ No | `implementation-details/`, `techContext.md`, `productContext.md`, `systemPatterns.md` |

**Anti-pattern:** "The DB workflow handled the update, so I'm done." It only writes the timeline. The knowledge layer requires manual attention.

## Project Structure

```
project/
├── memory-bank/
│   ├── database/
│   │   ├── memory_bank.db      # SQLite database
│   │   ├── schema.sql          # Canonical schema
│   │   ├── lib/
│   │   │   ├── inserts.js      # DB insert functions
│   │   │   ├── regenerate.js   # Markdown generators
│   │   │   ├── workflow.js     # Agent workflow wrapper
│   │   │   └── sqlite.js       # DB connection
│   │   ├── run-all.sh          # Rebuild DB from markdown
│   │   └── server.js           # Web viewer (optional)
│   ├── activeContext.md        # Current session state
│   ├── tasks.md                # Task registry (auto-generated)
│   ├── session_cache.md        # Session snapshot (auto-generated)
│   ├── edit_history.md         # Chronological edits (auto-generated)
│   ├── tasks/                  # Individual task files
│   ├── sessions/               # Session files
│   └── edits/                  # Edit chunks
```

## Schema Reference

See `references/schema.sql` for the full SQLite schema. Key tables:

- `edit_entries` — Work session records
- `file_modifications` — Files changed per edit
- `task_items` — Task registry
- `sessions` — Work sessions (`date`, `period`, `focus` columns)
- `session_cache` — Current snapshot (`focus_task` column — note: different name!)
- `transaction_log` — Audit trail

## Anti-Patterns

- **NEVER** edit generated markdown directly (`tasks.md`, `edit_history.md`, `session_cache.md`) — overwritten on regeneration
- **NEVER** run DB workflow in projects without `memory-bank/database/schema.sql`
- **NEVER** skip knowledge-layer updates after recording chronological work
- **NEVER** pass `--files` with spaces around the colon — use `action:path` exactly

## Troubleshooting

| Problem | Solution |
|---------|----------|
| No database found | `mb db init` then `mb init --database` |
| Missing lib files | `mb db sync --libs` |
| Schema mismatch | `mb db sync --database-files` |
| `mb` not found | Check PATH and NODE_PATH setup |
| Module resolution error | Install `sql.js` or set NODE_PATH |

## References

- `references/schema.sql` — Full SQLite schema (v1.1)
- `references/api-reference.md` — JS library API (`recordSessionWork`, `regenerateAll`)
- `integrated-rules-v6.12.md` — Complete v6.12 protocol rules
