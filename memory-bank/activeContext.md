# Active Context

*Last Updated: 2026-05-11 21:19:00 IST*

## Current Tasks
1. **[T26]**: Hopf-LQG Paper — Braided Hopf Algebra on Framed Spin Networks (HIGH priority)
   - Status: 🔄 IN PROGRESS — Draft Complete
   - Current Focus: 12-page LaTeX draft compiled and delivered. Remaining: intuitive explanations, diagrams, illustrations, bibliography expansion.
   - Literature Review: Markopoulou (no direct Hopf algebra on spin networks), Crane-Frenkel (Hopf categories for 4D TQFT), Kreimer/Tanasa (renormalization on spin foams)
   - Key Decision: Braided Hopf algebra (not Hopf category) is correct level for spin networks
   - Files: `hopf-spin-network.tex`, `hopf-spin-network.pdf`, `hopf-lqg.bib`

2. **[META-1]**: Memory Bank Update and Maintenance (HIGH priority)
   - Status: 🔄 IN PROGRESS
   - Current Focus: Session maintenance and tracking updates for parser/init changes
   - Recent Achievement: Recorded parser/runtime fixes, init bootstrap enhancements, synchronized task/session tracking files, and refreshed implementation documentation

2. **[T21]**: Database-Native Memory Bank Update Workflow (HIGH priority)
   - Status: 🔄 IN PROGRESS (Phases A, B, C Complete — Implemented in Sage Workspace)
   - Current Focus: Insert + Regenerate functions now implemented and passing 60 integration tests in Sage workspace
   - Recent Achievement: Phase B (inserts) and Phase C (regeneration) completed with 2ms workflow performance. Ready for port to canonical repo.
   - Note: Implementation lives in sage-workspace repo; to be promoted to canonical after review.

3. **[T19]**: Memory Bank Viewer Web Interface (HIGH priority)
   - Status: 🔄 IN PROGRESS (Phase 3 Setup Wizard Complete)
   - Current Focus: Phase 3 includes setup wizard, write capabilities, and DB management
   - Recent Achievement: Comprehensive 4-step setup wizard integrated as default entry point for new projects. Web interface now handles complete initialization without CLI.

4. **[T13]**: Implement Memory Bank CLI (HIGH priority)
   - Status: 🔄 IN PROGRESS
   - Current Focus: Init bootstrap completeness (integrated rules, protocols, commit template) and up-to-date setup messaging.

5. **[T24]**: Migrate from better-sqlite3 to sql.js (HIGH priority)
   - Status: 🔄 IN PROGRESS
   - Current Focus: Parser compatibility fixes and propagation to canonical/template packages.

6. **[T25]**: Standalone Node Package (Browser-First) (HIGH priority)
   - Status: 🔄 IN PROGRESS
   - Current Focus: Browser-first imports hardened (tasks/sessions/session_cache + task file subtasks) and separated Import Data UX; export/writeback still pending

7. **[T22]**: AdminJS Database Management Interface (HIGH priority)
   - Status: ❌ CANCELLED (2025-11-22)
   - Reason: Excessive complexity/dependency hell. Shelved in favor of extending T19.

8. **[T17]**: Maintenance and Upkeep of Integrated Rules (MEDIUM priority)
   - Status: 🔄 IN PROGRESS
   - Current Focus: Rules documentation v6.8 → v6.10

## Completed Tasks (Recent)
1. **[T19 Phase 2 Refactor]**:
   - Status: ✅ COMPLETED (2025-11-22)
   - Output: Modular Viewer architecture in `t21-workflow-testing/database/public/`.

## Implementation Focus - Current Session (T24 + T13 + META-1)
**T24 parser/runtime corrections:**
- ✅ Fixed async/undefined-`db` patterns in `parse-edits.js`, `parse-tasks.js`, `parse-sessions.js`, and `parse-session-cache.js`
- ✅ Validated parser scripts and syntax checks in `memory-bank/database`
- ✅ Propagated fixed parser scripts to `mb-cli/src/server-package/` and regenerated `mb-cli/templates/memory-bank/database/`

**T13 init coverage updates:**
- ✅ Updated `mb-cli/src/commands/init.js` setup messaging to use current parser workflow (`./run-all.sh`)
- ✅ Added copy of `integrated-rules-v6.12.md` during core initialization
- ✅ Added creation/copy of `memory-bank/protocols/` workflow files during core initialization
- ✅ Added `commit_message_template.md` to template initialization

**Implementation documentation alignment:**
- ✅ Updated `memory-bank/implementation-details/modular-viewer-architecture.md` for `sql.js` stack and `run-all.sh` workflow
- ✅ Updated `memory-bank/implementation-details/database-parser-plan.md` for current dependency and parser run sequence
- ✅ Updated `memory-bank/implementation-details/cli-implementation-details.md` with latest init bootstrap/session notes
- ✅ Updated `memory-bank/implementation-details/web-interface-setup-wizard.md` with current context notes

## Next Steps (Hopf-LQG Paper)
1. Add intuitive explanations for comultiplication in physical settings
2. Create diagrams for graph decompositions (non-linear chains: triangles, stars, cycles)
3. Add illustrations: ribbon graph crossings, framed edges, spin network braiding
4. Expand bibliography with graph Hopf algebra and recoupling theory references
5. Check all proofs and add more examples
6. Submit to arXiv (hep-th or gr-qc)

## Next Steps (Memory Bank CLI)
- Run clean install tests in:
  - fresh repo (pnpm install && pnpm start inside memory-bank/database)
  - pnpm monorepo (ensure local workspace marker scopes install)
- Confirm mb init requires viewer files (use --setup-viewer or full init) when expecting memory-bank/database/server.js
- Verify no unwanted default DB creation when switching DBs in the editor
- Confirm parsers/query scripts behave correctly with sql.js adapter (persistence + async flow)
- Execute fresh-project `mb init` end-to-end test to verify integrated rules + protocols + commit template bootstrap

## Current Decisions
1. **Setup Wizard as Default**: All new projects see wizard first
2. **Skip Wizard for Existing**: Auto-detect initialized projects, skip to viewer
3. **Modular Architecture**: setup.js is standalone module, non-breaking
4. **No CLI Required**: Complete no-CLI workflow now possible
5. **Security First**: All paths validated, directory traversal prevented
6. **Backward Compatible**: mb init CLI still works, produces same results

## System Status
- **Database**: ✅ Operational (Phase A Schema)
- **Viewer (T19)**: ✅ Modular, Bug-free (Read-only mode)
- **Editor (T19)**: ✅ DB management, edit_history import, tasks/sessions/session_cache import
- **Setup Wizard (T19)**: ✅ Complete 4-step initialization flow
- **Template Creation**: ✅ All core files auto-generated
- **Management UI**: 🔄 Write capabilities pending (Phase 3 Part 2)
