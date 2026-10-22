#!/usr/bin/env node
// Focused validation for one text-primary Memory Bank update round.
import { readFileSync, existsSync } from 'node:fs';
import { resolve, relative, isAbsolute } from 'node:path';

const args = process.argv.slice(2);
const option = (name) => {
  const index = args.indexOf(name);
  return index < 0 ? null : args[index + 1];
};
const root = resolve(option('--root') || '.');
const chunkArg = option('--chunk');
if (!chunkArg) {
  console.error('Usage: node validate-memory-update.mjs --chunk memory-bank/edits/YYYY-MM-DD/file.md [--root project-root]');
  process.exit(2);
}
const errors = [];
const chunkPath = resolve(root, chunkArg);
if (!chunkPath.startsWith(root + '/') || !existsSync(chunkPath)) {
  console.error('Edit chunk must exist inside the project root.');
  process.exit(2);
}
const chunk = readFileSync(chunkPath, 'utf8');
const frontmatter = chunk.match(/^---\n([\s\S]*?)\n---\n/);
if (!frontmatter) errors.push('Missing YAML frontmatter');
for (const field of ['source_branch', 'source_commit']) {
  if (!new RegExp(`^${field}:\\s*\\S+`, 'm').test(frontmatter?.[1] || '')) errors.push(`Missing ${field}`);
}
if (!/^source_commit:\s*[0-9a-f]{40}\s*$/m.test(frontmatter?.[1] || '')) errors.push('source_commit must be a full Git SHA');
const headers = [...chunk.matchAll(/^#### (\d{2}:\d{2}:\d{2}) ([A-Z]{2,5}) - ([A-Za-z0-9-]+): .+$/gm)];
if (headers.length !== 1) errors.push('Expected one timestamped task header');
const bullets = chunk.split('\n').filter(line => line.startsWith('- '));
if (!bullets.length) errors.push('No file actions found');
for (const bullet of bullets) {
  const match = bullet.match(/^- (Created|Modified|Updated|Deleted) `([^`]+)` - .+$/);
  if (!match) { errors.push(`Invalid action: ${bullet}`); continue; }
  const file = match[2];
  if (isAbsolute(file) || file.startsWith('../') || file.includes('/../')) errors.push(`Path must be project-relative: ${file}`);
  if (match[1] !== 'Deleted' && file !== relative(root, chunkPath) && !existsSync(resolve(root, file))) errors.push(`Referenced file is missing: ${file}`);
}
const registryPath = resolve(root, 'memory-bank/tasks.md');
if (existsSync(registryPath) && bullets.some(line => line.includes('`memory-bank/tasks.md`'))) {
  const registry = readFileSync(registryPath, 'utf8');
  if (!registry.includes('| ID | Title | Status | Priority | Started | Dependencies | Details |')) errors.push('Task registry header does not match v6.12');
  for (const row of registry.split('\n').filter(line => /^\|\s*[A-Za-z][A-Za-z0-9-]*\s*\|/.test(line) && !line.startsWith('| ID |'))) {
    const cells = row.split('|').slice(1, -1).map(cell => cell.trim());
    // Older completed-task sections have an additional Completed column.
    if (![7, 8].includes(cells.length) || !['🔄', '✅', '⏸️', '❌'].includes(cells[2]) || !/^\[Details\]\((tasks|archive)\/[^)]+\.md\)$/.test(cells.at(-1))) errors.push(`Invalid task registry row: ${cells[0] || row}`);
  }
}
const cachePath = resolve(root, 'memory-bank/session_cache.md');
if (existsSync(cachePath) && bullets.some(line => line.includes('`memory-bank/session_cache.md`'))) {
  const cache = readFileSync(cachePath, 'utf8');
  const session = cache.match(/\*\*Session File\*\*:\s*`([^`]+)`/);
  if (session && !existsSync(resolve(root, 'memory-bank', session[1]))) errors.push(`Session cache link is missing: ${session[1]}`);
}
if (errors.length) {
  for (const error of errors) console.error(`FAIL ${error}`);
  process.exit(1);
}
console.log(`OK: ${relative(root, chunkPath)} (${bullets.length} actions)`);
