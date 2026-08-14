# @space-cadet/memory-bank

Memory Bank is a Markdown-first CLI for preserving project context, tasks, sessions, and chronological work records across long-running projects and AI-assisted sessions.

## Install

Requires Node.js 20 or later.

```bash
npm install --global @space-cadet/memory-bank
mb --help
```

Alternatively, run it in a project without a global installation:

```bash
npx @space-cadet/memory-bank init --interactive
```

Upgrade a global installation with:

```bash
npm update --global @space-cadet/memory-bank
```

Remove it with:

```bash
npm uninstall --global @space-cadet/memory-bank
```

## Start a Memory Bank

From the root of an existing or new project:

```bash
mb init --interactive
```

The interactive menu lets you choose among Markdown files and templates, the optional SQLite database/parser setup, and the optional browser viewer. For a full unattended setup, use:

```bash
mb init --full
```

## Common commands

```bash
mb task create "Build the feature" --id T1 --priority high
mb session start --focus T1 --period afternoon
mb workflow --record --task T1 --description "Implemented the first pass" --regenerate
```

Run `mb --help` or `mb <command> --help` for the complete command reference.

## Optional SQLite workflow

Selecting the database or viewer option creates a self-contained package at `memory-bank/database/`. Install its dependencies before running database-backed commands:

```bash
cd memory-bank/database
pnpm install
```

The initial public release supports Markdown-first Memory Banks and optional SQLite workflows for new projects. Cross-project parser/backfill migration remains experimental and is not a general legacy-project migration promise.

## Documentation

See the [CLI workflow guide](https://github.com/space-cadet/memory-bank/blob/main/docs/cli-workflow.md) for examples, operating boundaries, and troubleshooting.

## License

[MIT](LICENSE)
