# Memory Bank Format Specification v1.0

*Created: 2025-12-05 17:18:15 IST*
*Last Updated: 2025-12-05 17:18:15 IST*
*Status: IN PROGRESS*

## Purpose

This document specifies the exact machine-readable formats for all memory bank markdown files. It defines what parsers EXPECT and what humans MUST write to ensure correct parsing and data integrity.

This is the contract between human-written memory bank files and the automated parsers that populate the database.

## Table of Contents

1. [Introduction](#1-introduction)
2. [Edit History Format (edit_history.md)](#2-edit-history-format)
3. [Tasks Format (tasks.md)](#3-tasks-format)
4. [Session Cache Format (session_cache.md)](#4-session-cache-format)
5. [Sessions Format (sessions/*.md)](#5-sessions-format)
6. [Validation Rules](#6-validation-rules)
7. [Parsers & Contracts](#7-parsers--contracts)

## 1. Introduction

### Audience

- **Humans**: Follow the exact examples and rules in each section when writing memory bank files
- **Parsers**: Implement the exact regex patterns specified in each section
- **Validators**: Use the validation rules to check files before parsing

### Guarantees

If humans follow the formats specified here exactly:
- Parsers will correctly extract all data
- Database will contain accurate records
- No silent data loss occurs
- Multi-project compatibility maintained

If humans deviate from these formats:
- Data may be silently skipped
- Parsers may misinterpret content
- Database records may be incomplete
- Compatibility breaks

### Version Control

- Format Specification v1.0 = Database Schema v1.0
- Changes to parsers require version bump
- All projects must use same version for cross-project compatibility

---

## 2. Edit History Format

**File**: `memory-bank/edit_history.md`
**Parser**: `parse-edits.js`
**Database**: `edit_entries` + `file_modifications` tables

### 2.1 Overall Structure

```markdown
# Edit History
*Created: YYYY-MM-DD HH:MM:SS TZ*
*Last Updated: YYYY-MM-DD HH:MM:SS TZ*

### YYYY-MM-DD

#### HH:MM:SS TZ - TaskID: Brief Description
- Action `file/path` - What changed and why

#### HH:MM:SS TZ - TaskID: Another Description
- Action `file/path` - What changed

### YYYY-MM-DD

#### HH:MM:SS TZ - TaskID: More work
- Action `file/path` - What changed
```

### 2.2 Date Header (Section)

**Format**: `### YYYY-MM-DD`

**Exact Requirements**:
- Exactly 3 hash symbols
- Exactly 1 space after `###`
- Date in YYYY-MM-DD format (ISO 8601)
- Nothing else on line
- Blank line after header (parser expects)

**Valid Examples**:
```markdown
### 2025-12-05
### 2025-01-10
### 2025-11-28
```

**Invalid Examples** (will fail):
```markdown
## 2025-12-05          ← Wrong hash count
#### 2025-12-05        ← Wrong hash count
### 12-05-2025         ← Wrong date format
### 2025-12-5          ← Missing leading zero in month/day
### 2025/12/05         ← Wrong separator
```

### 2.3 Edit Entry Header

**Format**: `#### [spaces] HH:MM[SS] [spaces] [TZ] [spaces] - [spaces] [TaskID:] Description`

**Requirements** (what parser actually accepts):
- Exactly 4 hash symbols
- 1+ spaces after `####` (variable whitespace OK)
- Time in HH:MM or HH:MM:SS format (seconds optional, parser normalizes to HH:MM:SS)
- 1+ spaces after time
- Timezone abbreviation (IST, UTC, EST, PST, etc.) - OPTIONAL (defaults to UTC if missing)
- 1+ spaces after timezone (if present)
- Dash character: `-`
- 1+ spaces around dash
- Task ID with pattern `T\d+` (T1, T2, T20, T101, etc.) - OPTIONAL
- Colon after task ID - OPTIONAL (if task ID present)
- Brief description (required)

**Regex Pattern**:
```regex
^#### \s+(\d{1,2}:\d{2}(?::\d{2})?) \s+(?:([A-Z]{3,4}) \s+)?- \s+(.+)$
```

**Valid Examples** (all parse correctly):
```markdown
#### 14:30:15 IST - T21: File Viewer Implementation
#### 14:30:15  IST  -  T21:  File Viewer Implementation
####  14:30:15 IST - T21: File Viewer Implementation
#### 14:30 IST - T21: File Viewer Implementation
#### 14:30:15 - T21: File Viewer Implementation
#### 14:30:15 - Description (no task ID)
#### 14:30:15 IST - Description (no task ID, with timezone)
```

**Invalid Examples** (will fail):
```markdown
####14:30:15 IST - T21: No spaces after hashes
#### 2:30 IST - T21: Time without leading zero (parser OK but violates convention)
#### 14:30:15 IST- T21: No space before dash
#### 14:30:15 IST T21: Missing dash separator
#### 14:30:15 IST -- T21: Double dash
```

### 2.4 File Modification Lines

**Format**: `- [spaces] Action [spaces] `filepath` [spaces] - [spaces] Description`

**Requirements** (what parser actually accepts):
- Dash character at start (exact): `-`
- 1+ spaces after dash (variable whitespace OK)
- Action verb (MUST be exactly one of): `Created`, `Modified`, `Updated` (NOT Deleted - parser doesn't support)
- 1+ spaces after verb
- File path wrapped in exactly 2 backticks: `` ` ``
- File path MUST be relative to project root
- File path CAN contain spaces, dots, hyphens, underscores, slashes
- 1+ spaces after closing backtick
- Dash character: `-` (exact)
- 1+ spaces after dash
- Description (what changed, why it changed) - required

**Regex Pattern**:
```regex
^- \s+(Created|Modified|Updated) \s+`([^`]+)` \s+- \s+(.+)$
```

**Valid Examples** (all parse correctly):
```markdown
- Created `tasks/T21.md` - New task file for database workflow
- Created  `tasks/T21.md`  -  New task file
-  Created `tasks/T21.md` - New task file
- Modified `memory-bank/edit_history.md` - Updated timestamp format
- Updated `t21-workflow-testing/database/server.js` - Added file browser endpoints
- Created `implementation-details/parser-contracts/spec.md` - New specification
- Modified `memory-bank/session_cache.md` - Updated counts
```

**Invalid Examples** (will fail):
```markdown
- Created tasks/T21.md - Missing backticks
- Create `tasks/T21.md` - Wrong verb (not in: Created|Modified|Updated)
- Deleted `tasks/T21.md` - Deleted not supported by parser
- Created `tasks/T21.md` No dash before description
- Created`tasks/T21.md` - No space after dash at start
- Modified `tasks/T21.md`-Description - No space around dash
```

**Parser Limitation**: 
- `Deleted` action is NOT supported (despite being in database schema). Use `Modified` to document removal or skip recording deletion.

### 2.5 Complete Valid Example

```markdown
# Edit History
*Created: 2025-11-10 12:00:00 IST*
*Last Updated: 2025-12-05 17:18:15 IST*

### 2025-12-05

#### 17:18:15 IST - T21: File Viewer Complete
- Modified `t21-workflow-testing/database/server.js` - Added /api/memory-bank/files endpoints
- Modified `t21-workflow-testing/database/public/index.html` - Added tab navigation
- Created `t21-workflow-testing/database/public/js/ui.js` - File browser UI components
- Updated `memory-bank/session_cache.md` - Current session metadata

#### 16:30:00 IST - T17: Rules Update
- Created `integrated-rules-v6.11.md` - Schema enforcement version
- Updated `memory-bank/tasks.md` - T17 status change

### 2025-12-04

#### 15:45:22 UTC - T13: Parser Integration
- Modified `mb-cli/src/commands/init.js` - Parser execution logic
- Created `mb-cli/src/lib/parsers.js` - Modular parser module
```

---

## 3. Tasks Format

**File**: `memory-bank/tasks.md`
**Parser**: `parse-tasks.js`
**Database**: `task_items` + `task_dependencies` tables

### 3.1 Overall Structure

(To be continued in Step 2)

---

## 4. Session Cache Format

(To be continued in Step 3)

---

## 5. Sessions Format

(To be continued in Step 4)

---

## 6. Validation Rules

(To be continued in Step 6)

---

## 7. Parsers & Contracts

(To be continued in Step 7)
