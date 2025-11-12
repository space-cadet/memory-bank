# Migration Guide: Markdown Files to Database

*Last Updated: April 15, 2025*

This guide explains how to migrate your Memory Bank markdown files to the database system.

## Overview

The Memory Bank system now supports storing all project information in a structured SQLite database using Prisma. This migration process converts all existing markdown files (tasks.md, session_cache.md, edit_history.md, errorLog.md, etc.) to database entries, allowing for better querying, filtering, and management of your project data.

## Prerequisites

1. Ensure you have Node.js installed (v16+)
2. Make sure Prisma CLI is installed globally or available in your project
3. Your database URL should be configured in the `.env` file in the `/memory-bank/database` directory

## Migration Steps

### 1. Generate Prisma Client

First, generate the Prisma client to ensure your database schema is up-to-date:

```bash
cd /Users/deepak/code/memory-bank/memory-bank/database
npx prisma generate
```

### 2. Run Database Migration (if needed)

If this is the first time setting up the database, or if schema changes have been made, run the Prisma migration:

```bash
npx prisma migrate dev --name init
```

### 3. Run the Conversion Script

The conversion script will process all markdown files and convert them to database entries:

```bash
cd /Users/deepak/code/memory-bank/memory-bank/database
node migration-scripts/convert.js
```

## Troubleshooting

### Invalid Date Errors

If you encounter errors related to invalid dates during the migration process, check your markdown files for inconsistent date formats. The script attempts to handle various date formats, but some edge cases may require manual correction.

**Fix:** Update the date in your markdown file to a standard format like "April 15, 2025" or "2025-04-15".

### Duplicate Records

If you run the migration multiple times, you might see some records being skipped due to unique constraints.

**Fix:** This is normal behavior. The script checks for existing records before creating new ones.

### File Not Found Errors

If you see "file not found" messages, the script is looking for standard Memory Bank files that might not exist in your project.

**Fix:** This is not an error, just informational. The script will skip files that don't exist.

## Post-Migration Verification

After migration, verify that your data was transferred correctly:

1. Check the SQLite database file (specified in your `.env` file)
2. Use the database viewer of your choice to inspect the tables
3. Confirm that tasks, sessions, edit history entries, and other data appear correctly

## Backing Up Markdown Files

Although the database now contains all your project information, it's recommended to keep your markdown files as a backup:

1. Create a `backup` directory in your project
2. Copy all markdown files to this directory before making any changes

## Getting Support

If you encounter any issues during migration that aren't covered in this guide, please:

1. Check the error logs for specific error messages
2. Review the `migration-scripts/convert.js` file for insight into the conversion process
3. Consult the project documentation for database schema details

## Next Steps

After successful migration, you can:

1. Start using the database API to access your project data
2. Update your workflows to use the new data access patterns
3. Consider implementing a periodic backup strategy for your database

---

*Remember: The database migration is a one-time process, but your markdown files remain the source of truth until you fully transition to the database system.*
