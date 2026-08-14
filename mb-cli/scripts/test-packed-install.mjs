import assert from 'node:assert/strict';
import { execFileSync, spawnSync } from 'node:child_process';
import { existsSync, mkdirSync, mkdtempSync, readdirSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const workspace = mkdtempSync(join(tmpdir(), 'memory-bank-packed-install-'));
const packageDir = join(workspace, 'package');
const consumerDir = join(workspace, 'consumer');

function run(command, args, options = {}) {
  return execFileSync(command, args, {
    encoding: 'utf8',
    stdio: 'pipe',
    ...options
  });
}

function runMb(mb, args) {
  const result = spawnSync(mb, args, {
    cwd: consumerDir,
    encoding: 'utf8',
    input: 'yes\n'
  });
  assert.equal(result.status, 0, `${args.join(' ')}\n${result.stderr}`);
}

try {
  mkdirSync(packageDir);
  mkdirSync(consumerDir);
  run('npm', ['pack', '--pack-destination', packageDir], { cwd: process.cwd() });
  const tarballName = readdirSync(packageDir).find((name) => name.endsWith('.tgz'));
  assert.ok(tarballName, 'npm pack did not produce a tarball');
  const tarball = join(packageDir, tarballName);

  run('npm', ['install', '--ignore-scripts', tarball], { cwd: consumerDir });

  const mb = join(consumerDir, 'node_modules', '.bin', 'mb');
  runMb(mb, ['init', '--full']);
  assert.ok(existsSync(join(consumerDir, 'memory-bank', 'integrated-rules-v6.12.md')));
  assert.ok(existsSync(join(consumerDir, 'memory-bank', 'protocols', 'memory-bank-update-workflow.md')));

  const databaseDir = join(consumerDir, 'memory-bank', 'database');
  const databasePath = join(databaseDir, 'memory_bank.db');
  run('npm', ['install', '--ignore-scripts'], { cwd: databaseDir });
  runMb(mb, ['db', 'init', '--db', databasePath]);
  runMb(mb, ['task', 'create', 'Tarball workflow task', '--id', 'T1', '--db', databasePath]);
  runMb(mb, ['session', 'start', '--focus', 'T1', '--period', 'afternoon', '--db', databasePath]);
  runMb(mb, [
    'workflow', '--record', '--regenerate', '--task', 'T1', '--db', databasePath,
    '--description', 'Verified the packed database workflow', '--files', 'Created:src/example.js',
    '--status', 'in_progress', '--period', 'afternoon'
  ]);

  assert.ok(existsSync(databasePath));
  assert.ok(existsSync(join(consumerDir, 'memory-bank', 'tasks', 'T1.md')));
  assert.ok(existsSync(join(consumerDir, 'memory-bank', 'edit_history.md')));

  console.log('Packed-install verification passed.');
} finally {
  rmSync(workspace, { recursive: true, force: true });
}
