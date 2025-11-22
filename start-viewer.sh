#!/bin/bash

# Memory Bank Viewer Launcher
# Syncs the database from markdown files and starts the viewer

# 1. Sync: Update Database from Markdown (Destructive Rebuild)
echo "🔄 Syncing Memory Bank Database..."
echo "   - Parsing Edit History..."
node memory-bank/database/parse-edits.js
echo "   - Parsing Tasks..."
node memory-bank/database/parse-tasks.js
echo "   - Parsing Sessions..."
node memory-bank/database/parse-sessions.js
echo "   - Parsing Session Cache..."
node memory-bank/database/parse-session-cache.js

# 2. Launch: Start Viewer Server with Real Database
echo "🚀 Starting Viewer..."
DB_PATH="./memory-bank/database/memory_bank.db"
echo "   - Database: $DB_PATH"
node t21-workflow-testing/database/server.js --db "$DB_PATH"
