# Format Specification System - Implementation Details

*Created: 2025-12-05 17:18:15 IST*
*Last Updated: 2025-12-05 17:18:15 IST*

## Overview

The Format Specification System provides a dual-specification approach to ensure memory bank markdown files are correctly parseable and prevent silent data loss.

**Problem**: Current integrated-rules-v6.11 section 6.5 describes ideal file formats, but actual parsers are more permissive or more restrictive than the rules specify. This creates ambiguity and risk of data loss.

**Solution**: Two complementary specifications that stay synchronized:
1. **Markdown Spec** (human-readable) - What humans SHOULD write
2. **JSON Spec** (machine-readable) - What parsers ENFORCE

## Architecture

```
integrated-rules-v6.12.md
    ↓
    └─→ References format-specification-v1.0.md (human guide)
           ↓
           └─→ Derived from format-specification-v1.0.json (authoritative)

Memory Bank Files (human-written)
    ↓
    └─→ Validated against format-specification-v1.0.json
           ↓
           └─→ Parse via parse-edits.js, parse-tasks.js, etc.
                  ↓
                  └─→ Database (trusted source)
```

## Specifications

### format-specification-v1.0.md

**Purpose**: Human-readable documentation of expected file formats

**Audience**: Developers, humans writing memory bank files, documentation readers

**Contents**:
1. Introduction (purpose, audience, guarantees, version control)
2. Edit History Format (edit_history.md) - COMPLETE
3. Tasks Format (tasks.md) - IN PROGRESS
4. Session Cache Format (session_cache.md) - PENDING
5. Sessions Format (sessions/*.md) - PENDING
6. Validation Rules - PENDING
7. Parsers & Contracts - PENDING

**Format**:
- Markdown with sections and subsections
- Each file format has: structure, requirements, regex patterns, valid/invalid examples
- Requirements describe what parser ACTUALLY accepts (not idealized)
- Examples show flexibility and edge cases
- Linked to specific parser implementations

### format-specification-v1.0.json

**Purpose**: Machine-readable, authoritative specification for validation and tooling

**Audience**: Parsers, validators, test generators, linters

**Structure**:
```json
{
  "format_specification": {
    "version": "1.0",
    "created": "2025-12-05T17:18:15Z",
    "compatibility_level": "v1.0_parsers",
    "files": {
      "edit_history": {
        "path": "memory-bank/edit_history.md",
        "parser": "parse-edits.js",
        "sections": [
          {
            "name": "date_header",
            "pattern": "^### \\d{4}-\\d{2}-\\d{2}$",
            "description": "Date section header",
            "regex_flags": [],
            "requirements": {
              "hash_count": 3,
              "format": "### YYYY-MM-DD"
            },
            "examples_valid": [...],
            "examples_invalid": [...]
          },
          ...
        ]
      },
      "tasks": { ... },
      "sessions": { ... },
      "session_cache": { ... }
    }
  }
}
```

**Features**:
- Exact regex patterns (JavaScript format)
- Valid and invalid examples for each pattern
- Parser reference (which file implements)
- Version tracking (when added/changed)
- Compatibility notes (which projects support)

## Development Phases

### Phase 1: Markdown Specification (IN PROGRESS)
- Sections 1-2 complete (introduction, edit_history)
- Sections 3-7 pending (tasks, sessions, session_cache, validation, parsers)
- Deliverable: format-specification-v1.0.md

### Phase 2: JSON Specification (PENDING)
- Convert markdown to JSON schema
- Ensure 1:1 correspondence with parser implementations
- Add validation logic
- Deliverable: format-specification-v1.0.json

### Phase 3: Parser Validation Layer (PENDING)
- Create validator that checks markdown files against JSON spec
- Implement in Node.js for CLI integration
- Report specific violations before parsing
- Deliverable: validate-memory-bank.js utility

### Phase 4: Test Suite (PENDING)
- Generate test cases from JSON examples
- Create realistic multi-project test data
- Verify cross-project compatibility
- Deliverable: comprehensive test suite with fixtures

## Deviations from v6.11 to v6.12

Format spec revealed these parser/rules misalignments to be corrected in v6.12:

1. **Timezone handling**: v6.11 marks mandatory, parser makes optional (default UTC)
2. **Deleted action**: v6.11 requires, parser doesn't implement
3. **Cancelled status**: v6.11 allows (❌), parser doesn't recognize
4. **Whitespace**: v6.11 specifies exact spacing, parser accepts variable
5. **Time format**: v6.11 requires HH:MM:SS, parser accepts HH:MM

v6.12 will document actual parser behavior. Future parsers will be updated to match v6.12 spec exactly.

## Cross-Project Compatibility

Format spec is designed to work across all projects:
- spin-network-app
- qc-diffusion-code
- arxivite
- digitalocean-server

Each project may have:
- Different timestamp formats (handled via parser flexibility)
- Different task ID prefixes (parser already generic: T\d+)
- Different markdown styles (spec accommodates variations)

Validation will warn but not fail on project-specific variations.

## Integration with T21 Phase B

Format Specification System enables T21 Phase B (Insert Functions):
- T21 writes require validation against format spec
- Write API checks files before database inserts
- Prevents malformed data entering database
- Ensures text regeneration from database produces valid markdown

## Related Tasks

- **T17**: Maintenance of Integrated Rules (v6.12 updates)
- **T21**: Database-Native Memory Bank Update Workflow (uses format spec for validation)
- **T20a**: Adaptive Parser (handles multi-project format variations)
- **META-1**: Memory Bank Maintenance (tracks overall documentation)
