# Memory Bank CLI npm Package Publication Plan

*Created: 2026-08-14*
*Last Updated: 2026-08-14*
*Related Task: [T27](../tasks/T27.md)*

## Purpose

Turn the existing `mb-cli/` command-line tool into a dependable public npm package without changing the established Memory Bank workflow or treating incomplete database migration work as generally complete.

## Current Position

The CLI already exposes `mb init`, `mb db`, `mb task`, `mb session`, `mb update`, and `mb workflow`. Its templates and database workflow have been exercised in sibling projects, but the package is still arranged like an internal repository component rather than a public install artifact.

The package currently needs release hardening in four areas:

1. **Identity and metadata** — select a public package name and scope; add repository, issue-tracker, homepage, author, engine, and license metadata.
2. **Artifact control** — use an explicit allowlist so npm publishes only executable code, runtime templates, and public documentation. Do not include backups, local databases, or internal Memory Bank snapshots.
3. **Consumer workflow** — document installation through npm instead of repository symlinks. Decide whether database support remains an explicit second dependency-install step or becomes fully managed by the CLI.
4. **Release evidence** — make the exact packed tarball pass clean-install and end-to-end workflow tests in CI.

## Product Boundary

The initial public package should describe itself as a **Markdown-first project memory and continuity CLI with optional SQLite workflow support**.

The database workflow may be offered for new projects and rapid chronological logging. However, T20/T21 cross-project parsing, backfill, and any database-primary transition remain distinct work. The npm package must not claim universal legacy-project migration support until those tasks have passed their own acceptance criteria.

## Proposed Package Contract

### Installation

Users should be able to install the CLI from npm and invoke `mb` without cloning this repository or creating a manual symlink. The release README should cover both global installation and project-local execution.

### Runtime payload

The tarball should contain only:

- CLI entry point and command modules.
- Runtime libraries.
- Memory Bank templates required by `mb init`.
- Package README, license, and changelog.

It should exclude:

- `*.backup` and `*.prisma-backup` source copies.
- Local `*.db` test or development data.
- Repository-specific Memory Bank state, archives, and internal development records.
- Lint/editor configuration unless intentionally required at runtime.

### Database dependency model

The package must select and document one of these models before prerelease:

1. **Managed bootstrap**: `mb init --database` installs or otherwise supplies the database runtime needed by generated projects.
2. **Explicit project install**: `mb init --database` creates a self-contained generated package and clearly directs the user to install its dependencies before database commands are used.

The initial release may use the explicit model, provided the error messages and README make the boundary unambiguous and the end-to-end test follows it exactly.

## Release Gates

1. Package name availability and npm organization/scope are confirmed.
2. Licensing and public repository metadata are complete and consistent across the CLI and generated database package.
3. `npm pack --dry-run` lists only the intended runtime payload.
4. The packed tarball installs successfully into a clean temporary directory.
5. A clean project can run `mb init` and receives the expected Markdown-first directory structure.
6. The documented optional database setup can initialize its schema and complete the basic task/session/workflow/regeneration path.
7. CI runs the unit, tarball, and clean-project workflow checks for every release candidate.
8. A prerelease is published only with explicit authorization and then accepted in representative user projects.

## Release Sequence

1. Complete package metadata, allowlisting, license, and public README.
2. Repair or remove stale documentation and package artifacts.
3. Add automated package and clean-install tests.
4. Run the release gates against the locally packed tarball.
5. Publish a prerelease and perform external installation checks.
6. Record findings in T27, then decide whether a stable release is warranted.

## Evidence to Record

- Final package name, version, and npm dist-tag.
- `npm pack --dry-run` artifact inventory.
- CI run URL or identifier and test summary.
- Clean-install command/results for the tarball and prerelease.
- Representative project acceptance results.
- Any retained limitation, especially database dependency setup or parser/backfill scope.
