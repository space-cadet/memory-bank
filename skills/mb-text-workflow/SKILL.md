---
name: mb-text-workflow
description: Memory Bank text-based update workflow following integrated-rules v6.12. Use when updating memory bank files manually via markdown editing — creating edit chunks, updating tasks.md, session_cache.md, session files, and task files. NOT for database-native workflows (use mb-db-workflow instead). Triggers on phrases like "update memory bank", "create edit chunk", "update tasks.md", "update session cache", "memory bank update workflow".
---

# Memory Bank Text-Based Update Workflow (v6.12)

## Overview

This skill implements the 8-step manual memory bank update workflow from integrated-rules v6.12. All updates are done by directly editing markdown files — no database involved.

## Documentation Philosophy

The memory bank has two complementary documentation layers:

**Chronological Layer** (tells the story):
- Task files — what was done, when, current status
- Session files — work completed in each session
- Edit history — precise record of every file change
- These answer: "What happened? When? In what order?"

**Knowledge Layer** (stores the understanding):
- Implementation docs — architecture, design decisions, APIs, patterns
- Technical context — system architecture, dependencies, constraints
- Product context — goals, user stories, feature specifications
- These answer: "How does this work? Why was it built this way? How do I use it?"

Both layers are essential. The chronological layer without the knowledge layer becomes an unreadable pile of session logs. The knowledge layer without the chronological layer loses traceability and becomes stale. They must be maintained together.

## When to Use

- Working in projects without the DB-native workflow set up
- Quick edits where DB overhead is unnecessary
- Debugging or fixing DB-generated files
- Projects using the classic text-based memory bank system

## Prerequisites

Before starting, determine:
1. Current system time and timezone (format: `YYYY-MM-DD HH:MM:SS TZ`)
2. Active task ID being worked on
3. Files modified and their change descriptions
4. Whether implementation documentation needs updating (ALWAYS check this)

## Fast path — known current work

If `$mem-scan` already ran in this task, use its task IDs, inspected files, source-change summary, proposed record changes, Memory Bank profile, and rules/template paths. Check only what changed since that scan; do not repeat searches or reopen source unless a specific documentation fact is unclear. When `$commit-message` follows, pass along the final changed paths, central task IDs, validation result, and known follow-ups.

When the current session identifies the task, changed files, and outcome, skip discovery and any full-bank scan. Read only `activeContext.md`, `session_cache.md`, the relevant task, and today's session file. Search `tasks.md` and implementation docs narrowly by task ID or component when needed.

Make a short change plan before editing. Update each record only when its facts changed: the task file for progress, `tasks.md` for registry fields, knowledge docs for durable technical learning, the session file for the session record, and the cache for current focus and next action. Avoid repeating the same narrative in every file. Group edits with stable, verified anchors into a few related patches; avoid one all-or-nothing patch across many files. If a patch fails, reread only the conflicting target sections and retry them, without restarting discovery.

Create one canonical edit chunk for the update round, then refresh `edit_history.md` as its generated view. Validate the changed files once with `git diff --check` and, when available, `node mb-cli/scripts/validate-memory-update.mjs --chunk memory-bank/edits/YYYY-MM-DD/FILE.md --root .`. Generate a commit message only when requested or committing. A documentation-only closeout does not need the full test suite.

## Step 0: Discovery — What Work Needs Documentation?

**Use this step when you do not already have a complete record of what was done in the current session.** If you have been tracking work as it happened (e.g., via edit chunks, session notes, or task updates), you may skip this step and proceed directly to the 8-step workflow.

**Use discovery when:**
- You are resuming after a session restart or context loss
- You were not the agent that performed the work
- The user says "update the memory bank" without specifying what changed
- You suspect work was done that you are not aware of

Start with Git changes since the last update and recent chunks. Search by task ID and changed component. Expand to a full-bank scan only if targeted searches cannot establish ownership or reveal conflicting records.

### 0.1 Check Last Memory-Bank Update

Read `memory-bank/edit_history.md` or `memory-bank/session_cache.md` to find the last update timestamp. This tells you how far back to look.

### 0.2 Examine Git History (if needed)

```bash
cd <project-root>
git log --since="<last-memory-bank-update-date>" --oneline
```

This shows all commits since the last documentation update. Each commit represents work that may need to be recorded.

### 0.3 Check Uncommitted Changes (if needed)

```bash
git status
git diff --stat
```

Uncommitted changes are work-in-progress that should be documented. Note:
- Files modified but not yet committed
- New files created
- Files deleted
- Any merge conflicts or stashed work

### 0.4 Review Existing Edit Chunks

Check `memory-bank/edits/` for recent chunks to avoid duplicating work already documented:

```bash
ls -la memory-bank/edits/
cat memory-bank/edits/YYYY-MM-DD/HHMMSS-*.md
```

### 0.5 Build Work Summary

From the above, build a list of work items to document:

| Task ID | Description | Files Changed | Status |
|---------|-------------|---------------|--------|
| Txx | What was done | file1, file2 | in_progress / completed |

**If you cannot determine what work was done**, check:
- Recent session files in `memory-bank/sessions/`
- Task files in `memory-bank/tasks/` for status changes
- Any TODO or NOTES files in the project
- The user's recent messages or instructions

**Anti-pattern:** Documenting only what you remember without verifying completeness. This misses work and creates an incomplete memory bank.

## The 8-Step Workflow

Use only the applicable documentation steps below after the fast path or discovery. Leave records unchanged when their facts did not change.

### Step 1: Update Individual Task File

File: `memory-bank/tasks/Txx.md`

If the task file exists, append meaningful progress updates. Create a task only when the work lacks an existing owner; a direct user request to update the Memory Bank authorizes the needed records unless a substantive task choice is unresolved.

Template:
```markdown
# Txx: [Title]

*Created: YYYY-MM-DD HH:MM:SS TZ*
*Last Updated: YYYY-MM-DD HH:MM:SS TZ*

**Status**: 🔄 **IN PROGRESS**
**Priority**: HIGH

## Details
[Brief description and context]

## Progress
1. ✅ [Completed item]
2. 🔄 [Current item]
3. ⬜ [Next item]

## Files
- `[file1]` - Description
- `[file2]` - Description
```

**Status emojis (STRICT):**
- 🔄 = In Progress
- ✅ = Completed
- ⏸️ = Paused
- ❌ = Cancelled

### Step 2: Update tasks.md Registry

File: `memory-bank/tasks.md`

Update the master task registry table only when status, title, priority, dependency, or membership changed. MUST use exact schema:

```markdown
| ID | Title | Status | Priority | Started | Dependencies | Details |
|----|-------|--------|----------|---------|--------------|---------|
| T1 | [Title] | 🔄 | HIGH | 2025-04-10 | - | [Details](tasks/T1.md) |
```

**Rules:**
- Details column MUST be a link: `[Details](tasks/Txx.md)` or `[Details](archive/Txx.md)`
- Status MUST use standard emojis only
- Keep active tasks at top, completed below

### Step 3: Check Implementation Documentation

Check whether durable technical knowledge changed. Update the relevant implementation documentation when it did; do not create or touch implementation docs for routine status-only updates.

Update relevant files in `memory-bank/implementation-details/` and other knowledge-layer files:

**When to update:**
- New feature or capability added → document how it works
- API changed → update usage examples and signatures
- Architecture decision made → document the rationale
- Bug fixed with non-obvious root cause → document for future reference
- Pattern or convention established → document as project standard

**Files to consider:**
- `implementation-details/` — technical deep-dives, architecture decisions
- `techContext.md` — system architecture, dependencies, constraints
- `productContext.md` — goals, user stories, feature specifications
- `systemPatterns.md` — established patterns and conventions
- `activeContext.md` — current focus and recent decisions

**Documentation quality check:**
- Would a new developer understand how to use this feature from the docs alone?
- Are the examples current and runnable?
- Is the rationale for design decisions captured?
- Are there links between related docs?

**Anti-pattern:** "I'll document it later." Later never comes. Document while the context is fresh.

### Step 4: Handle Session File

File: `memory-bank/sessions/YYYY-MM-DD-PERIOD.md`

Check if current session file exists. If yes, append to it. If no, create it.

Template:
```markdown
# Session: YYYY-MM-DD [Period]

**Started**: YYYY-MM-DD HH:MM:SS TZ
**Focus Task**: Txx: [Title]
**Status**: 🔄 ACTIVE

## Work Done
- [Description of work completed]

## Decisions
- [Key decisions made]

## Next Steps
- [What to do next]
```

Periods: morning, afternoon, evening, night

### Step 5: Update Session Cache

File: `memory-bank/session_cache.md`

Keep the live cache focused on the current session, task, and next action. Do not copy the full session log into it.

Template:
```markdown
# Session Cache
*Created: YYYY-MM-DD HH:MM:SS TZ*
*Last Updated: YYYY-MM-DD HH:MM:SS TZ*

## Current Session
**Started**: [Timestamp]
**Focus Task**: [Task ID]
**Session File**: `sessions/YYYY-MM-DD-PERIOD.md`

## Next Action
- [One concrete next step]
```

### Step 6: Update Other Memory Bank Files

- `activeContext.md` — if focus task or current context changed
- `errorLog.md` — if errors were encountered and fixed
- `progress.md` — if milestones were completed
- `changelog.md` — if features or bugs were addressed
- `implementation-details/*.md` — see Step 3 for when to update

### Step 7: Create Edit Chunk

File: `memory-bank/edits/YYYY-MM-DD/HHMMSS-Txx-edit-chunk.md`

This is the canonical record. `edit_history.md` is a GENERATED VIEW — never edit it directly.

Template:
```markdown
---
kind: edit_chunk
id: [unique-id]
created_at: YYYY-MM-DD HH:MM:SS TZ
task_ids: [Txx]
source_branch: [branch-name]
source_commit: [40-char-sha]
---

#### HH:MM:SS TZ - Txx: Description
- Modified `file/path` - Specific technical change description
- Created `file/path` - What was created and why
```

**STRICT Format Requirements:**
- Header: `#### HH:MM:SS TZ - TaskID: Description` (timezone MANDATORY)
- Bullets: `- Action \`filepath\` - Description`
- Action MUST be one of: `Created`, `Modified`, `Updated`, `Deleted`
- Filepath MUST be in backticks AND relative to project root
- No summary statements or evaluative content

### Step 8: Regenerate edit_history.md

File: `memory-bank/edit_history.md`

This is a GENERATED VIEW from chunk files. Newest entries on top. Use the project's generator when available; otherwise add the new chunk entry without changing historical entries.

```markdown
# Edit History
*Created: YYYY-MM-DD HH:MM:SS TZ*
*Last Updated: YYYY-MM-DD HH:MM:SS TZ*

### YYYY-MM-DD

#### HH:MM:SS TZ - Txx: Description
- Modified `file/path` - Description
```

## Commit Message Format

```
(type)TID: Headline - Details (% complete)
```

Types: feat, fix, docs, refactor, test
Example: `(feat)T3: Database Migration Complete - Added user table, seed data (90%)`

## Anti-Patterns

- NEVER edit `edit_history.md` directly — always create chunk files
- Use absolute paths for tool operations; use project-relative paths inside edit chunks
- Do not use database regeneration on text-primary projects until backfill and round-trip equivalence are verified
- NEVER skip the edit chunk step — it's the canonical record
- NEVER delete session files — append-only

## References

- [v6.12 Full Rules](references/integrated-rules-v6.12.md) — Complete integrated rules
- [Templates](references/templates.md) — All file templates in one place
