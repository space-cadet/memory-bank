# Beads and Dolt Multi-Worktree Evaluation

*Created: 2026-09-24 15:41:13 IST*
*Last Updated: 2026-09-24 15:41:13 IST*

## Purpose and scope

Evaluate whether Beads with Dolt can serve as structured shared task state for
Memory Bank work across branches and worktrees, with `mb-core` producing
human-readable Markdown projections. This is a disposable benchmark, not a
production migration. Keep the current text-primary Memory Bank untouched.

Timebox the experiment to one or two focused days. Use a disposable fixture
with representative tasks, dependencies, status, decisions, sessions, and
evidence. Record the Beads/Dolt versions and exact synchronization mode.

## Experiment

### 1. Shared local writers

Create three worktrees over one disposable repository and initialize Beads
with the documented shared-server setup. Exercise:

- Independent changes to different tasks.
- Compatible notes on the same task.
- Concurrent changes to the same status or decision.
- Simultaneous writers, retries, duplicate requests, and a stale worktree.

Record whether writes are visible to every worktree, how same-field conflicts
are reported, and whether any accepted change disappears.

### 2. Branch and database reconciliation

Start two isolated workspaces from the same baseline. Make independent and
conflicting changes, then use the supported Beads and Dolt synchronization
flows to reconcile them. Record merge steps, history, conflict resolution,
and recovery from a failed or interrupted sync. Do not assume that local
shared-server behavior proves branch-level safety.

### 3. Minimal Memory Bank projection

Build a read-only adapter that projects only `tasks.md`, one task record,
`session_cache.md`, one session record, and `edit_history.md`. Test that:

- Repeating the same projection gives byte-identical output.
- Unknown or unsupported source fields are preserved or reported.
- Projection is safe to rerun and does not write back to Beads/Dolt.
- Unresolved same-field conflicts stop or are clearly marked in the output.

Do not redesign the full Memory Bank schema during this experiment.

### 4. Failure and recovery

Interrupt a write or sync, retry it, test a stale worktree, stop the shared
server during activity, and restore from a backup. Run the available
consistency/repair diagnostics. Verify the final records and history against
the input actions.

## Measures and decision thresholds

Record write latency, convergence time, lost independent updates, silent
conflicts, manual merge steps, deterministic projection results, recovery
success, and adapter size/maintenance burden.

Proceed to a more detailed design only if all are true:

- Independent accepted updates converge with no lost records.
- Same-field conflicts are visible and require an explicit resolution.
- Retries are safe and history can be audited.
- Repeated projections are deterministic and preserve the tested information.
- Local writes usually finish within 2 seconds and worktree convergence within
  10 seconds in the disposable local setup.
- Recovery succeeds without hand-editing the canonical database, and the
  adapter remains small enough to maintain.

Otherwise, document the failure and reject or revise the candidate. These
thresholds are experiment targets, not existing product guarantees.

## Candidate context

Beads with Dolt is the closest candidate found for structured task state,
history, and database-level collaboration. PROJECTMEM is closer to agent
memory, but its default event-file arrangement does not directly provide the
multi-worktree Git-authoritative coordination being evaluated. Jujutsu's
concurrency work is relevant VCS machinery, not a memory product. See the
dated assessment and source links in `beads-comparison.md`.

## Related work

- T28: Event-Backed Memory Bank Coordination
- T20: Memory Bank Database Parser
- `memory-bank/implementation-details/event-backed-memory-bank-plan.md`
- `memory-bank/implementation-details/beads-comparison.md`
