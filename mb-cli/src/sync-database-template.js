#!/usr/bin/env node

import { rm, cp, mkdir, stat } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SRC_DIR = path.resolve(__dirname, 'server-package');
const DEST_DIR = path.resolve(__dirname, '..', 'templates', 'memory-bank', 'database');

async function ensureDirExists(dirPath) {
  if (!existsSync(dirPath)) {
    await mkdir(dirPath, { recursive: true });
  }
}

async function main() {
  const srcStats = await stat(SRC_DIR);
  if (!srcStats.isDirectory()) {
    throw new Error(`Source is not a directory: ${SRC_DIR}`);
  }

  await ensureDirExists(path.dirname(DEST_DIR));

  await rm(DEST_DIR, { recursive: true, force: true });
  await mkdir(DEST_DIR, { recursive: true });

  await cp(SRC_DIR, DEST_DIR, {
    recursive: true,
    force: true,
    preserveTimestamps: false
  });

  console.log(`Synced database template:\n  from: ${SRC_DIR}\n  to:   ${DEST_DIR}`);
}

main().catch((err) => {
  console.error(err && err.stack ? err.stack : err);
  process.exit(1);
});
