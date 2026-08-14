import assert from 'node:assert/strict';
import { execFileSync, spawnSync } from 'node:child_process';
import { existsSync, mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import test from 'node:test';

const cli = resolve('src/index.js');

function runCli(args, cwd, input = '') {
  return spawnSync(process.execPath, [cli, ...args], {
    cwd,
    encoding: 'utf8',
    input
  });
}

test('shows the public command surface', () => {
  const result = runCli(['--help'], process.cwd());
  assert.equal(result.status, 0, result.stderr);
  assert.match(result.stdout, /Memory Bank CLI/);
  assert.match(result.stdout, /init \[options\]/);
  assert.match(result.stdout, /workflow \[options\]/);
});

test('initializes core Markdown files in a clean project', () => {
  const project = mkdtempSync(join(tmpdir(), 'memory-bank-cli-test-'));
  try {
    const result = runCli(['init', '--core'], project, 'yes\n');
    assert.equal(result.status, 0, result.stderr);
  assert.ok(existsSync(join(project, 'memory-bank', 'tasks.md')));
  assert.ok(existsSync(join(project, 'memory-bank', 'session_cache.md')));
  assert.ok(existsSync(join(project, 'memory-bank', 'integrated-rules-v6.12.md')));
  assert.ok(existsSync(join(project, 'memory-bank', 'protocols', 'memory-bank-update-workflow.md')));
  } finally {
    rmSync(project, { recursive: true, force: true });
  }
});

test('initializes every bundled template in a clean project', () => {
  const project = mkdtempSync(join(tmpdir(), 'memory-bank-cli-template-test-'));
  try {
    const result = runCli(['init', '--templates'], project, 'yes\n');
    assert.equal(result.status, 0, result.stderr);
    assert.ok(existsSync(join(project, 'memory-bank', 'templates', 'commit_message_template.md')));
  } finally {
    rmSync(project, { recursive: true, force: true });
  }
});

test('published artifact excludes repository-only files', () => {
  const output = execFileSync('npm', ['pack', '--dry-run', '--json'], {
    cwd: process.cwd(),
    encoding: 'utf8',
    env: { ...process.env, npm_config_cache: join(tmpdir(), 'memory-bank-npm-cache') }
  });
  const [{ files }] = JSON.parse(output);
  const paths = files.map(({ path }) => path);

  assert.ok(paths.includes('README.md'));
  assert.ok(paths.includes('LICENSE'));
  assert.ok(paths.includes('src/lib/db-resolver.js'));
  assert.ok(!paths.some((path) => path.endsWith('.backup') || path.endsWith('.prisma-backup')));
  assert.ok(!paths.some((path) => path.endsWith('.db')));
  assert.ok(paths.includes('memory-bank/integrated-rules-v6.12.md'));
  assert.ok(paths.includes('memory-bank/protocols/memory-bank-update-workflow.md'));
  assert.ok(!paths.some((path) => path.startsWith('memory-bank/') && !path.startsWith('memory-bank/protocols/') && path !== 'memory-bank/integrated-rules-v6.12.md'));
});
