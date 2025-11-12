# Adaptive LLM-Based Format Parser System

*Created: 2025-11-12 17:25:21 IST*
*Last Updated: 2025-11-12 17:25:21 IST*

## Executive Summary

T20a implements an intelligent parser system that uses LLM analysis to detect memory bank file formats across different projects and normalize them to a universal database schema. Rather than building a complex regex-based universal parser, the system analyzes the actual file structure and generates appropriate parsers dynamically.

## System Architecture

### Three-Phase Pipeline

```
Phase 1: Format Analysis (LLM-Driven)
  Input: Memory bank files (edit_history.md, tasks.md, session_cache.md)
  Process: Sample first 30-50 lines, send to LLM for format specification
  Output: Format profile document describing actual structure (not project-specific)
  
Phase 2: Parser Generation (Code-Based)
  Input: Format profile from Phase 1
  Process: Select or generate appropriate parser based on detected patterns
  Output: Extracted data in intermediate normalized format
  
Phase 3: Schema Normalization (Database)
  Input: Extracted data from Phase 2
  Process: Map to universal schema, perform type conversions, validate
  Output: Normalized data inserted to project's memory_bank.db
```

### Key Design Principles

1. **Format-Agnostic**: System doesn't classify as "project X format", analyzes actual structure
2. **Single Schema**: All projects use identical database schema regardless of source format
3. **Separate Databases**: Each project maintains its own memory_bank.db file
4. **One-Time Detection**: Format analysis runs during initialization, not on every parse
5. **Graceful Degradation**: Fallback to most lenient parser if format unrecognized

## Universal Database Schema

All projects use identical table structure:

### Table: edit_entries
```sql
- id (PRIMARY KEY)
- date (DATE)
- time (TIME)
- task_id (VARCHAR)
- description (TEXT)
- created_at (TIMESTAMP WITH TZ)
```

### Table: file_modifications
```sql
- id (PRIMARY KEY)
- entry_id (FOREIGN KEY → edit_entries.id)
- action (VARCHAR: Fixed, Updated, Created, Enhanced, Removed, etc.)
- file_path (TEXT)
- change_description (TEXT)
- file_type (VARCHAR: extracted from path)
- created_at (TIMESTAMP WITH TZ)
```

### Table: tasks
```sql
- id (PRIMARY KEY)
- task_id (VARCHAR, UNIQUE)
- title (TEXT)
- status (VARCHAR)
- priority (VARCHAR)
- created_date (DATE)
- dependencies (TEXT: comma-separated task IDs)
- created_at (TIMESTAMP WITH TZ)
```

### Table: task_files
```sql
- id (PRIMARY KEY)
- task_id (VARCHAR)
- file_path (TEXT)
- file_type (VARCHAR)
- created_at (TIMESTAMP WITH TZ)
```

## Phase 1: LLM Format Analysis

### Analysis Prompt

```
Analyze these memory bank file samples and describe the exact format structure found.

SAMPLES:
[First 30-50 lines from each file type]

For each sample, provide:
1. Metadata syntax (how dates/times are formatted, what markdown italics used)
2. Section header structure (how dates/task IDs are formatted)
3. Entry header format (what appears where in entry lines)
4. File modification line structure (action verb patterns, path delimiters)
5. Typical files per entry (average count, range)
6. Task ID format (prefixes, numeric/alphanumeric patterns)
7. Any other notable patterns or variations

Do NOT mention which project this is from.
Return a structured format specification, not project-specific observations.
```

### Format Profile Output

LLM returns structured document describing:
- Metadata format variant (e.g., "*text*" vs "_text_", timezone presence)
- Entry header pattern (regex-like description)
- File modification line pattern
- Task ID format specification
- Path format (absolute vs relative, path depth patterns)
- Any unusual characteristics or inconsistencies within file

### Format Profile Storage

Stored as JSON in project's memory-bank directory:
```json
{
  "detected_at": "2025-11-12 17:25:21 IST",
  "file_type": "edit_history.md",
  "format_variant": "variant_a",
  "characteristics": {
    "metadata_italics": "*text*",
    "timezone_present": true,
    "entry_header_pattern": "HH:MM - TaskID: Description",
    "status_in_header": false,
    "typical_files_per_entry": 3,
    "task_id_format": "T-prefixed numeric"
  }
}
```

## Phase 2: Parser Generation

### Parser Selection Logic

Based on format profile, select from parser library:

1. **Strict Parser** (memory-bank standard)
   - Uses: *text* italics, optional timezone, T-prefixed IDs
   - Format: HH:MM - TaskID: Description

2. **Flexible Parser** (handles variations)
   - Uses: Either *text* or _text_, handles missing timezone
   - Format: HH:MM - TaskID: [Status -] Description

3. **Permissive Parser** (handles edge cases)
   - Uses: Any italics syntax, optional status, various ID formats
   - Regex-based with multiple fallback patterns

4. **Legacy Parser** (older format variants)
   - Uses: Extra verbosity, absolute paths
   - Format: HH:MM - TaskID: Status - Multi-line descriptions

### Parser Output

Each parser returns normalized intermediate format:

```typescript
interface ExtractedEntry {
  date: string;              // YYYY-MM-DD
  time: string;              // HH:MM
  taskId: string;            // T20, C16a, etc.
  description: string;       // Normalized description
  files: FileModification[];
}

interface FileModification {
  action: string;            // Fixed, Updated, Created, etc.
  filePath: string;          // Normalized path
  description: string;       // Change description
}
```

### Parser Implementation

Each parser is clean and focused:
- No ambiguity, no fallbacks, just extract
- Optimized for its specific format
- Fast (no multiple pattern attempts)
- Easy to test and debug

## Phase 3: Schema Normalization

### Normalization Functions

1. **Normalize Timestamp**
   - Parse extracted date/time
   - Ensure IST timezone
   - Convert to TIMESTAMP WITH TZ

2. **Normalize Task ID**
   - Extract prefix and numeric/alphanumeric parts
   - Standardize format for storage

3. **Normalize File Paths**
   - Detect absolute vs relative
   - Convert to project-relative paths
   - Extract file type from extension

4. **Normalize Descriptions**
   - Trim whitespace
   - Handle multi-line descriptions
   - Validate non-empty

### Data Insertion

```sql
-- Insert entry
INSERT INTO edit_entries (date, time, task_id, description, created_at)
VALUES (?, ?, ?, ?, ?)

-- Insert file modifications
INSERT INTO file_modifications (entry_id, action, file_path, change_description, file_type, created_at)
VALUES (?, ?, ?, ?, ?, ?)
```

## Format Variations Handled

Based on T20 format analysis, handles:

1. **Metadata syntax** - *text* vs _text_ for italics
2. **Timezone presence** - Optional IST timezone in timestamps
3. **Entry headers** - Status words in different positions or absent
4. **Task ID formats** - T-prefix vs C-prefix, numeric vs alphanumeric suffixes
5. **File paths** - Absolute vs relative, project-specific variations
6. **Description length** - Single phrase to multi-sentence details
7. **Entry length** - 1-2 files to dozens of files per entry
8. **Path styles** - Various project directory structures

## Implementation Phases

### Phase 1: LLM Analysis & Format Profile (T20a-P1)
- [ ] Design and test LLM prompt
- [ ] Implement format profile extraction
- [ ] Create format profile storage
- [ ] Test across 4+ projects

### Phase 2: Parser Library (T20a-P2)
- [ ] Implement 4 parser variants
- [ ] Parser selection logic
- [ ] Intermediate format conversion
- [ ] Unit tests per parser

### Phase 3: Schema Normalization (T20a-P3)
- [ ] Implement normalization functions
- [ ] Data type conversions
- [ ] Validation logic
- [ ] Error handling

### Phase 4: Integration & Testing (T20a-P4)
- [ ] Integrate with T20 database init
- [ ] End-to-end testing across projects
- [ ] Error recovery mechanisms
- [ ] Performance optimization

### Phase 5: Multi-Project Processing (T20a-P5)
- [ ] Batch format analysis
- [ ] Parallel parser execution
- [ ] Database initialization for multiple projects
- [ ] Verification and reporting

## Benefits

1. **Flexibility** - Handles format variations without complex regex
2. **Maintainability** - Each parser is simple and focused
3. **Extensibility** - Easy to add new format variants
4. **Accuracy** - LLM understands semantic intent
5. **Robustness** - Graceful handling of edge cases
6. **Unified Schema** - All projects use identical structure
7. **Isolation** - Each project maintains separate database

## Risks & Mitigations

| Risk | Mitigation |
|------|-----------|
| LLM analysis incorrect | Test prompt thoroughly, validate output, manual review option |
| Parser complexity | Keep parsers simple, one per format variant |
| Data loss/corruption | Validation layer, dry-run mode, backup before migration |
| Performance | One-time initialization, batch processing, async execution |
| New format variants | Flexible parser as fallback, easy to add new variants |

## Success Criteria

- ✅ Format analysis works on 4+ projects
- ⬜ All detected formats successfully parse
- ⬜ Data normalized to schema without loss
- ⬜ Cross-project queries work correctly
- ⬜ System handles 95%+ of format variations
- ⬜ New projects can auto-detect format

## Next Steps

1. Design and test LLM format analysis prompt
2. Implement format profile extraction and storage
3. Build parser variant library with selection logic
4. Create normalization layer
5. Implement batch processing for multiple projects
6. End-to-end testing and validation
