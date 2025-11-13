# T21 Phase A Schema - Setup

## Quick Start

```bash
cd /Users/deepak/code/memory-bank/t21-workflow-testing
nvm use
pnpm install
node database/init-schema-sqljs.js
```

## Two Options

- **sql.js**: Pure JavaScript, recommended
- **better-sqlite3**: Native SQLite (use `init-schema.js`)

Both create identical schema. Database file: `database/memory_bank.db`

## Schema: 8 Tables

edit_entries, file_modifications, task_items, task_dependencies, sessions, session_cache, error_logs, transaction_log
