# AdminJS Viewer Implementation Plan

*Created: 2025-11-22 16:45:00 IST*
*Last Updated: 2025-11-22 17:08:00 IST*
*Status: ❌ Shelved / Cancelled*

## Decision to Shelve (2025-11-22)
This implementation plan was attempted as **Task T22** but was abandoned due to excessive complexity. The dependency stack (AdminJS v7 vs v6, NPM vs PNPM workspaces, ESM vs CommonJS modules) proved too brittle for an internal tool. The project has reverted to refactoring the existing lightweight Viewer (T19) into a modular structure instead.

## Overview (Archived)
Replace the manual `explorer.html` prototype with **AdminJS** to provide a robust, standardized, and maintainable interface for the T21 Database-Native Workflow. This approach shifts from a "Read-Only Explorer" to a full "Management Console" capable of handling Phase B (Database Writes) without writing custom forms or API endpoints.

## Architecture
*   **Server:** Express (Node.js) - *Existing*
*   **Admin Interface:** AdminJS - *New*
*   **ORM Layer:** Objection.js + Knex.js - *New (Required Adapter)*
*   **Database:** SQLite (better-sqlite3) - *Existing*

## Why AdminJS?
1.  **Instant CRUD**: Solves T21 Phase B (Insert Functions) immediately. AdminJS provides auto-generated forms for Creating, Updating, and Deleting records.
2.  **Zero UI Code**: Eliminates the maintenance burden of 1,300+ lines of custom HTML/JS.
3.  **Backend-Native**: Plugs directly into the existing Express/Node environment without requiring a separate React frontend build pipeline.
4.  **Standardization**: Provides professional filtering, sorting, pagination, and relationship navigation out of the box.

## Implementation Strategy

### 1. Workspace Setup
Create a new isolated POC directory to avoid disrupting the current `explorer.html`.
*   **Path:** `t21-workflow-testing/admin-poc/`

### 2. Dependencies
The stack requires an ORM adapter because AdminJS doesn't speak raw SQL.
*   `adminjs` (Core)
*   `@adminjs/express` (Server middleware)
*   `@adminjs/objection` (Database adapter)
*   `objection` (Model layer)
*   `knex` (Query builder for SQLite)
*   `better-sqlite3` (Driver)

### 3. Database Layer (The Adapter Gap)
Since the current system uses raw SQL, we must define **Models** for AdminJS to understand the schema.
*   **Knex Config:** Connect to `test_memory_bank.db`.
*   **Objection Models:** Define Javascript classes for the 8 core tables:
    *   `Task` (tasks)
    *   `TaskDependency` (task_dependencies)
    *   `Session` (sessions)
    *   `SessionCache` (session_cache)
    *   `EditEntry` (edit_entries)
    *   `FileModification` (file_modifications)
    *   `ErrorLog` (error_logs)
    *   `TransactionLog` (transaction_log)

### 4. Configuration
*   **Resources:** Map models to AdminJS resources.
*   **Sidebar:** Group resources logically (e.g., "Workflow", "System", "Logs").
*   **Properties:** Customize visible columns (hide raw JSON blobs in list view, show them in detail view).

## Comparison with Alternatives

| Feature | Current (Custom Explorer) | React-Admin | AdminJS |
| :--- | :--- | :--- | :--- |
| **Type** | Custom SPA | Frontend Framework | Backend Plugin |
| **Phase B (Writes)** | ❌ Needs manual Forms/APIs | ❌ Needs REST API build | ✅ **Built-in** |
| **Maintenance** | High (Monolith file) | Medium (React App + API) | **Low** (Config only) |
| **Setup** | Existing | Complex (App + Server) | Moderate (Adapter setup) |

## Success Criteria
1.  Server starts without errors.
2.  Admin panel is accessible at `/admin`.
3.  All 8 tables are browsable.
4.  **Create/Update/Delete** operations work for a test Task.
