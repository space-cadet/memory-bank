#!/bin/bash

# Phase A Schema Initialization Helper
# Creates memory_bank.db from schema.sql using sqlite3 CLI

DB_PATH="/Users/deepak/code/mem-banks/t21-workflow-testing/database/memory_bank.db"
SCHEMA_PATH="/Users/deepak/code/mem-banks/t21-workflow-testing/database/schema.sql"

echo ""
echo "🔄 Initializing Phase A Database..."
echo ""

# Remove existing database if it exists
if [ -f "$DB_PATH" ]; then
    echo "⚠️  Removing existing database..."
    rm "$DB_PATH"
fi

# Create database from schema
echo "📋 Creating database from schema..."
sqlite3 "$DB_PATH" < "$SCHEMA_PATH"

if [ $? -eq 0 ]; then
    echo "✅ Database created successfully!"
    echo ""
    
    # Verify tables
    echo "📊 Verifying tables:"
    sqlite3 "$DB_PATH" "SELECT name FROM sqlite_master WHERE type='table' ORDER BY name;" | sed 's/^/  - /'
    
    echo ""
    echo "🔑 Verifying indexes:"
    sqlite3 "$DB_PATH" "SELECT name FROM sqlite_master WHERE type='index' ORDER BY name;" | sed 's/^/  - /'
    
    echo ""
    echo "✅ Phase A Database initialized successfully!"
    echo "📁 Location: $DB_PATH"
    echo ""
else
    echo "❌ Database initialization failed!"
    exit 1
fi
