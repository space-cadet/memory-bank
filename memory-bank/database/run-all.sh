#!/usr/bin/env bash
set -euo pipefail

# Run from memory-bank/database
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$SCRIPT_DIR"

if command -v pnpm >/dev/null 2>&1; then
  echo "==> Installing dependencies (pnpm install)"
  pnpm install

  echo "==> Approving build scripts (pnpm approve-builds)"
  # Auto-answer yes to all prompts
  # When there is nothing to approve, pnpm exits quickly and `yes` may get SIGPIPE.
  # With `set -o pipefail`, that would stop the script early. Neutralize that.
  (yes | pnpm approve-builds) || true
else
  echo "ERROR: pnpm not found in PATH"
  exit 1
fi

echo "==> Running parsers"
node parse-edits.js
node parse-tasks.js
node parse-sessions.js
node parse-session-cache.js

echo "==> Done. Start viewer with: node server.js"
