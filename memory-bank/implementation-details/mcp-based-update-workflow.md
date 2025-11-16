# MCP-Based Memory Bank Update Workflow

*Created: 2025-11-16 21:44:58 IST*
*Last Updated: 2025-11-16 21:44:58 IST*

## Executive Summary

This document outlines how to use an **existing MCP server** to enable direct database updates to the Memory Bank from Claude Desktop or other LLM interfaces at the end of every session. Instead of building a custom MCP server, we leverage the actively-maintained **`jparkerweb/mcp-sqlite`** server.

**Key Decision**: Use existing `mcp-sqlite` server rather than building custom solution.

## Selected MCP Server: jparkerweb/mcp-sqlite

### Why This Server?

**Repository**: https://github.com/jparkerweb/mcp-sqlite
**Version**: v1.0.7 (June 2, 2025)
**Status**: Actively maintained (23 commits, recent releases)
**License**: Open source

**Advantages**:
1. **Actively Maintained**: Latest release in June 2025
2. **Complete Feature Set**: All CRUD operations + custom SQL
3. **Battle-Tested**: Used by community, documented issues/fixes
4. **Simple Setup**: Single npm package installation
5. **No Custom Code**: Leverages existing, tested implementation
6. **Security**: Community-reviewed codebase

**Comparison to Alternatives**:
- Official `@modelcontextprotocol/server-sqlite`: **Archived** (no longer maintained)
- `executeautomation/mcp-database-server`: Multi-database overhead, more complex
- Custom server: Requires maintenance, testing, security reviews

### Available Tools

The server provides 8 tools that map perfectly to memory bank needs:

| Tool | Purpose | Memory Bank Use Case |
|------|---------|---------------------|
| `db_info` | Database metadata | Validate schema, check table counts |
| `list_tables` | List all tables | Verify 8-table schema exists |
| `get_table_schema` | Schema details | Validate table structure |
| `create_record` | Insert new record | Log work, create sessions, track errors |
| `read_records` | Query with filtering | Get current session, query task status |
| `update_records` | Update matching records | Update task status, complete sessions |
| `delete_records` | Delete matching records | Clean up test data (rare use) |
| `query` | Custom SQL | Complex queries, transaction support |

## Installation and Configuration

### Step 1: Install MCP Server

```bash
# Global installation (recommended)
npm install -g mcp-sqlite

# Or use npx (no installation required)
# npx will download on first use
```

### Step 2: Configure Claude Desktop

**Location**:
- macOS: `~/Library/Application Support/Claude/claude_desktop_config.json`
- Windows: `%APPDATA%\Claude\claude_desktop_config.json`
- Linux: `~/.config/Claude/claude_desktop_config.json`

**Configuration**:

```json
{
  "mcpServers": {
    "memory-bank": {
      "command": "npx",
      "args": [
        "-y",
        "mcp-sqlite",
        "/home/user/memory-bank/memory-bank/database/memory_bank.db"
      ]
    }
  }
}
```

**For Windows** (use full path to avoid connection errors):
```json
{
  "mcpServers": {
    "memory-bank": {
      "command": "C:\\Program Files\\nodejs\\npx.cmd",
      "args": [
        "-y",
        "mcp-sqlite",
        "C:\\path\\to\\memory-bank\\database\\memory_bank.db"
      ]
    }
  }
}
```

### Step 3: Restart Claude Desktop

After configuration:
1. Close Claude Desktop completely
2. Restart Claude Desktop
3. Look for the hammer icon (🔨) in the UI
4. Click to see available MCP servers
5. Verify "memory-bank" appears in the list

## End-of-Session Workflow

### Manual Workflow (User-Initiated)

When completing a work session, users can ask Claude to log the session:

**Example Conversation**:
```
User: "I've finished working on T21 Phase B. Please log this session to the memory bank."

Claude: I'll log this session using the memory bank database tools.

[Uses read_records to check current session state]
[Uses create_record to insert edit_entry]
[Uses create_record to insert file_modifications]
[Uses update_records to update task status]
[Uses create_record or update_records for session completion]

✅ Session logged successfully!
- Edit entry #48 created
- 3 file modifications tracked
- Task T21 status updated to "in_progress"
- Session 2025-11-16-night completed
```

### Automated Workflow (Future Enhancement)

Add to `.cursorrules` or integrated rules to prompt Claude at session end:

```markdown
## Session Completion Protocol

When the user indicates session completion (e.g., "done", "finished", "that's all"):
1. Summarize work completed in this session
2. Identify files changed (check git status/diff if available)
3. Ask: "Would you like me to log this session to the memory bank?"
4. If approved, use MCP tools to update database:
   - create_record → edit_entries
   - create_record → file_modifications (for each file)
   - update_records → task_items (if status changed)
   - update_records → sessions (complete current session)
```

## Database Operations Using MCP Tools

### 1. Log Work (Edit Entry + File Modifications)

```javascript
// Step 1: Create edit entry
create_record({
  table: "edit_entries",
  record: {
    date: "2025-11-16",
    time: "21:44:58",
    timezone: "IST",
    timestamp: "2025-11-16T16:14:58.000Z",
    task_id: "T21",
    task_description: "MCP-based workflow implementation documentation"
  }
})
// Returns: { id: 48 }

// Step 2: Insert file modifications
create_record({
  table: "file_modifications",
  record: {
    edit_entry_id: 48,
    action: "Created",
    file_path: "memory-bank/implementation-details/mcp-based-update-workflow.md",
    description: "Documented MCP server selection and configuration"
  }
})
```

### 2. Update Task Status

```javascript
update_records({
  table: "task_items",
  where: { id: "T21" },
  values: {
    status: "in_progress",
    last_updated: "2025-11-16T16:14:58.000Z",
    details: "Phase B modified: Using existing mcp-sqlite server instead of custom build"
  }
})
```

### 3. Create Session

```javascript
create_record({
  table: "sessions",
  record: {
    session_date: "2025-11-16",
    session_period: "night",
    focus_task: "T21",
    start_time: "2025-11-16T16:00:00.000Z",
    status: "in_progress"
  }
})
// Returns: { id: 15 }
```

### 4. Complete Session

```javascript
update_records({
  table: "sessions",
  where: { id: 15 },
  values: {
    end_time: "2025-11-16T16:14:58.000Z",
    status: "completed",
    notes: "MCP workflow documentation complete, using jparkerweb/mcp-sqlite"
  }
})
```

### 5. Update Session Cache

```javascript
// First, get current task counts
read_records({
  table: "task_items",
  where: { status: "in_progress" }
})
// Count results

// Update cache
update_records({
  table: "session_cache",
  where: { id: 1 },
  values: {
    current_session_id: 15,
    current_focus_task: "T21",
    active_count: 11,
    paused_count: 1,
    completed_count: 7,
    last_updated: "2025-11-16T16:14:58.000Z"
  }
})
```

### 6. Log Errors (If Applicable)

```javascript
create_record({
  table: "error_logs",
  record: {
    timestamp: "2025-11-16T16:14:58.000Z",
    task_id: "T21",
    file_path: "memory-bank/database/memory_bank.db",
    error_message: "SQLITE_ERROR: no such table: transaction_log",
    cause: "transaction_log table not yet created in production database",
    fix_applied: "Added to Phase B implementation checklist"
  }
})
```

### 7. Complex Queries with Transaction Support

For atomic operations, use custom SQL:

```javascript
query({
  sql: `
    BEGIN TRANSACTION;

    INSERT INTO edit_entries (date, time, timezone, timestamp, task_id, task_description)
    VALUES ('2025-11-16', '21:44:58', 'IST', '2025-11-16T16:14:58.000Z', 'T21', 'MCP workflow docs');

    INSERT INTO file_modifications (edit_entry_id, action, file_path, description)
    VALUES (last_insert_rowid(), 'Created', 'memory-bank/implementation-details/mcp-based-update-workflow.md', 'MCP documentation');

    UPDATE task_items
    SET status = 'in_progress', last_updated = '2025-11-16T16:14:58.000Z'
    WHERE id = 'T21';

    COMMIT;
  `
})
```

## Integration with Existing Workflow

### Current Text-First Workflow (Section 6.5)

The existing Section 6.5 workflow remains valid but can be **enhanced** with MCP:

**Before MCP**:
1. Manually update task files
2. Manually update implementation docs
3. Manually create/update session file
4. Manually update session_cache.md
5. Manually update other files (activeContext, errorLog, etc.)
6. Manually prepend to edit_history.md
7. Generate commit message

**With MCP (Hybrid Approach)**:
1. Use MCP to insert database records (atomic, fast, validated)
2. *Optional*: Regenerate text files from database (future Phase C)
3. Generate commit message

**Coexistence Strategy**:
- Database updates via MCP are **additive** (don't replace text workflow)
- Text files remain authoritative until Phase C (text regeneration) is implemented
- Both workflows can be used in parallel during transition
- Once Phase C is complete, database becomes authoritative

### Git Integration (Auto-Detect File Changes)

Claude can automatically detect file changes using git:

```markdown
User: "Log this session to memory bank"

Claude: Let me check what files you changed...
[Executes: git status --porcelain]
[Executes: git diff --name-only]

I see you modified:
- memory-bank/implementation-details/mcp-based-update-workflow.md
- memory-bank/tasks/T21.md

I'll log these to the database...
[Uses MCP tools to insert records]

Done! Would you like me to also update the text files (edit_history.md, session file)?
```

## Text Regeneration (Phase C - Future)

While not required immediately, Phase C would regenerate text files from database:

**Approach Options**:

### Option 1: External Script (Recommended)
- Create standalone Node.js script: `regenerate-text-files.js`
- Run after MCP updates: `node regenerate-text-files.js`
- Uses same database queries as T21 Phase C design
- Keep text and database in sync

### Option 2: MCP Server Extension
- Fork `jparkerweb/mcp-sqlite`
- Add custom tools: `regenerate_edit_history`, `regenerate_tasks`, etc.
- Integrate regeneration into MCP workflow
- More complex, requires maintenance

### Option 3: CLI Integration (Part of T13)
- Add to mb-cli: `mb sync`
- Command regenerates all text files from database
- User runs manually or in git hooks
- Clean separation of concerns

**Recommendation**: Start with Option 1 (external script), migrate to Option 3 (CLI) as T13 progresses.

## Security Considerations

### Database Access Control

1. **File Permissions**: Ensure `memory_bank.db` has appropriate permissions
   ```bash
   chmod 600 memory-bank/database/memory_bank.db
   ```

2. **Read-Only Mode**: For viewing only, use SQLite URI:
   ```json
   "args": ["-y", "mcp-sqlite", "file:/path/to/db.db?mode=ro"]
   ```

3. **Backup Before Writes**: Create backups before destructive operations
   ```bash
   cp memory_bank.db memory_bank.backup-$(date +%Y%m%d-%H%M%S).db
   ```

### SQL Injection Prevention

The `mcp-sqlite` server uses parameterized queries internally, but when using the `query` tool with custom SQL:

**Don't**:
```javascript
query({ sql: `SELECT * FROM tasks WHERE id = '${userInput}'` })
```

**Do**:
```javascript
read_records({
  table: "tasks",
  where: { id: userInput }
})
```

### Validation Before Commits

Before finalizing database updates:

1. **Check row counts**: Verify expected number of records inserted
2. **Validate foreign keys**: Ensure referenced records exist
3. **Test rollback**: Use transactions for multi-step operations
4. **Verify schema**: Check table structure matches expectations

## Troubleshooting

### MCP Server Not Appearing in Claude Desktop

**Symptoms**: Hammer icon missing or server not listed

**Solutions**:
1. Check config file syntax (valid JSON)
2. Verify database file path exists
3. Use full path to npx on Windows
4. Check Claude Desktop logs: `~/Library/Logs/Claude/` (macOS)
5. Restart Claude Desktop completely

### Database Locked Errors

**Symptoms**: `SQLITE_BUSY` or `database is locked`

**Causes**:
- Another process has database open
- SQLite WAL mode not enabled
- Concurrent write attempts

**Solutions**:
```sql
-- Enable WAL mode for better concurrency
PRAGMA journal_mode=WAL;

-- Check current mode
PRAGMA journal_mode;
```

### Schema Mismatch

**Symptoms**: Tools fail with "no such table" or "no such column"

**Solutions**:
1. Verify database schema:
   ```javascript
   list_tables()
   get_table_schema({ table: "edit_entries" })
   ```

2. Compare to expected schema:
   - Production: `memory-bank/database/schema.sql` (4 tables)
   - Test: `t21-workflow-testing/database/schema.sql` (8 tables)

3. Migrate schema if needed:
   ```bash
   sqlite3 memory_bank.db < t21-workflow-testing/database/schema.sql
   ```

### Permission Errors

**Symptoms**: Cannot read/write database file

**Solutions**:
```bash
# Check file permissions
ls -l memory-bank/database/memory_bank.db

# Fix permissions
chmod 600 memory-bank/database/memory_bank.db

# Check directory permissions
chmod 755 memory-bank/database/
```

## Implementation Roadmap

### Phase 1: Basic Setup (Est: 30 minutes)
- [ ] Install `mcp-sqlite` package
- [ ] Configure Claude Desktop
- [ ] Verify connection (list_tables, db_info)
- [ ] Test basic operations (read_records on existing data)

### Phase 2: Session Logging (Est: 1 hour)
- [ ] Test create_record for edit_entries
- [ ] Test create_record for file_modifications
- [ ] Test update_records for task_items
- [ ] Create end-of-session template for users
- [ ] Document in integrated rules

### Phase 3: Schema Expansion (Est: 2 hours)
- [ ] Add missing tables to production DB (sessions, session_cache, error_logs, transaction_log)
- [ ] Migrate existing data if needed
- [ ] Verify indexes created
- [ ] Test all 8 tables accessible via MCP

### Phase 4: Workflow Integration (Est: 2 hours)
- [ ] Create session completion prompts
- [ ] Add git integration for auto-file-detection
- [ ] Test complete session workflow
- [ ] Update integrated rules v6.10 with MCP workflow

### Phase 5: Text Regeneration (Est: 4 hours, Optional)
- [ ] Create `regenerate-text-files.js` script
- [ ] Implement 6 regeneration functions (edit_history, tasks, session_cache, etc.)
- [ ] Test text output matches manual format
- [ ] Add to mb-cli as `mb sync` command

**Total Estimated Time**: 9.5 hours (5.5 hours without Phase 5)

## Success Criteria

- [ ] MCP server connects successfully to Claude Desktop
- [ ] All 8 tables accessible via MCP tools
- [ ] Can log complete session (edit entry + files + task update)
- [ ] Can update task status via MCP
- [ ] Can create and complete sessions
- [ ] Database inserts are atomic (use transactions)
- [ ] Schema validation passes
- [ ] No database corruption after operations
- [ ] Workflow documented in integrated rules
- [ ] Users can complete session logging in < 2 minutes

## Comparison: Custom vs Existing Server

| Aspect | Custom MCP Server | jparkerweb/mcp-sqlite |
|--------|-------------------|----------------------|
| Development Time | ~22 hours | 0 hours (ready to use) |
| Maintenance | Ongoing (you own it) | Community-maintained |
| Testing | Required | Already tested |
| Security | Need to audit | Community-reviewed |
| Features | Exactly what we need | All CRUD + more |
| Documentation | Need to write | Already documented |
| Updates | Manual | npm update |
| Risk | Bugs, edge cases | Proven, stable |
| **Total Cost** | **High** | **Low** |

**Decision**: Use existing server - faster, safer, lower maintenance.

## Related Files

- `memory-bank/implementation-details/database-update-workflow-plan.md` - Original T21 workflow design
- `t21-workflow-testing/database/schema.sql` - 8-table schema (Phase A)
- `memory-bank/database/schema.sql` - Production 4-table schema
- `integrated-rules-v6.10.md` - Section 6.5 Memory Bank Update Workflow

## Related Tasks

- **T21**: Database-Native Memory Bank Update Workflow (this implements Phase B with existing tools)
- **T20**: Database Parser (can leverage MCP for queries)
- **T13**: CLI Implementation (mb sync command for text regeneration)
- **T17**: Integrated Rules Maintenance (add MCP workflow to Section 6.5)

## Next Steps

1. **User Review**: Review this implementation plan
2. **Approval**: Approve MCP server selection and approach
3. **Phase 1**: Install and configure `mcp-sqlite`
4. **Phase 2**: Test session logging workflow
5. **Phase 3**: Expand production database schema
6. **Phase 4**: Integrate into daily workflow
7. **Phase 5**: (Optional) Implement text regeneration

## Conclusion

By leveraging the existing `jparkerweb/mcp-sqlite` MCP server instead of building custom infrastructure, we achieve:

- **Faster implementation**: Hours instead of days
- **Lower risk**: Battle-tested, community-reviewed code
- **Less maintenance**: External team maintains server
- **Same functionality**: All required operations supported
- **Future-proof**: Active development, regular updates

This approach aligns with the KIRSS principle (Keep It Really Simple, Stupid) by using existing, proven tools rather than reinventing the wheel.
