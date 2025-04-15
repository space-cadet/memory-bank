# Error Log

*Last Updated: April 15, 2025*

This file tracks errors encountered during development, their causes, and resolutions. It serves as a reference for debugging and avoiding similar issues in the future.

## 2025-04-15 13:15 UTC: SQLite Native Type Validation Errors with Prisma

**File:** `/Users/deepak/code/memory-bank/memory-bank/database/schema.prisma`

**Error Message:**
```
Error: Prisma schema validation - (validate wasm)
Error code: P1012
error: Native type Text is not supported for sqlite connector.
  -->  schema.prisma:142
   |
141 |   filePath          String?
142 |   errorDescription  String   @db.Text
   |
error: Native type Text is not supported for sqlite connector.
  -->  schema.prisma:143
   |
142 |   errorDescription  String   @db.Text
143 |   errorMessage      String?  @db.Text
   |
// ...additional validation errors...

Validation Error Count: 9
[Context: validate]
```

**Cause:**
The Prisma schema was using the `@db.Text` native type annotation with SQLite, but SQLite doesn't support this type specification. This occurs because SQLite handles text data differently than other databases - it has a TEXT type but doesn't need (or support) the specific `@db.Text` directive that Prisma uses for other database providers like PostgreSQL or MySQL.

**Fix:**
1. Removed all `@db.Text` annotations from the Prisma schema file
2. SQLite handles all `String` fields appropriately without needing a specific type annotation
3. Modified a total of 9 fields across multiple models:
   - `Error` model: `errorDescription`, `errorMessage`, `cause`, `fix`, `keyCodeChanges`
   - `ActiveContext` model: `implementationFocus`
   - `ProjectBrief` model: `overview`, `architecture`
   - `CustomDocument` model: `content`

**Key Code Changes:**
```prisma
// Before
errorDescription  String   @db.Text

// After
errorDescription  String
```

**Affected Files:**
- `/Users/deepak/code/memory-bank/memory-bank/database/schema.prisma`

## 2025-04-15 12:30 UTC: Database Migration Issues with Invalid Dates

**File:** `/Users/deepak/code/memory-bank/memory-bank/database/migration-scripts/convert.js`

**Error Message:**
```
Invalid `prisma.changelogEntry.create()` invocation in
/Users/deepak/code/memory-bank/memory-bank/database/migration-scripts/convert.js:811:37

  date: new Date("Invalid Date"),
        ~~~~~~~~~~~~~~~~~~~~~~~~

Invalid value for argument `date`: Provided Date object is invalid. Expected Date.
```

**Cause:**
The database migration script was failing when attempting to extract and parse dates from changelog entries. The script was trying to create a `ChangelogEntry` record with an invalid date (specifically `new Date("Invalid Date")`), causing Prisma validation errors. The `extractDate` function wasn't properly handling invalid date strings.

**Fix:**
1. Enhanced the `extractDate` function to validate dates and provide a fallback current date when invalid
2. Added specific validation in the changelog conversion process
3. Implemented a retry mechanism with current date when date validation fails
4. Added better error handling throughout the date parsing process

**Key Code Changes:**
```javascript
// Improved extractDate function
function extractDate(dateString) {
  if (!dateString) return null;
  
  try {
    const date = new Date(dateString);
    
    // Check if date is valid
    if (isNaN(date.getTime())) {
      console.warn(`Invalid date string: "${dateString}", using current date instead`);
      return new Date(); // Return current date as fallback
    }
    
    return date;
  } catch (error) {
    console.error(`Error parsing date: ${dateString}`, error);
    return new Date(); // Return current date as fallback
  }
}

// Added validation before database insert
if (isNaN(date.getTime())) {
  date = new Date(); // Ensure we have a valid date
}
```

**Affected Files:**
- `/Users/deepak/code/memory-bank/memory-bank/database/migration-scripts/convert.js`
- Created `/Users/deepak/code/memory-bank/memory-bank/database/migration-scripts/migration_guide.md`

## 2025-04-14 16:30 UTC: T1 - Context Loss When Switching Tasks

**File:** `memory-bank/session_cache.md`

**Error Description:**
When switching between multiple tasks, context about other ongoing changes was being lost because the session cache was structured around a single task.

**Cause:**
The session_cache.md template was designed with a single "Current Task" and "Current Step" structure, without support for preserving context across multiple concurrent tasks.

**Fix:**
1. Implemented a multi-task design for session_cache.md
2. Created a task registry (tasks.md) to track all tasks
3. Updated templates and files to include task ID references
4. Modified workflows to preserve context when switching between tasks

**Key Changes:**
```markdown
# Before:
## Current Task
[Single task description]

## Current Step
[Single step description]

# After:
## Overview
- Active Tasks: [Count]
- Last Task Focus: [Task ID]

## Active Tasks
### [Task ID 1]: [Task Title]
[Task-specific context]

### [Task ID 2]: [Task Title]
[Task-specific context]
```

**Affected Files:**
- `integrated-rules-v4.md`
- `memory-bank/tasks.md`
- `memory-bank/session_cache.md`
- `memory-bank/edit_history.md`
- `memory-bank/activeContext.md`
- `memory-bank/progress.md`
- `memory-bank/templates/*`

**Related Task:** T1

---
*(Add new error entries above this line, keeping the most recent error at the top)*
