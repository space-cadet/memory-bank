import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import test from 'node:test';
import { importMemoryBank } from '../scripts/import-memory-bank-events.mjs';
import { resolveStateEvents } from '../scripts/event-state.mjs';

test('imports a Memory Bank without changing its source files', async () => {
  const workspace = mkdtempSync(join(tmpdir(), 'memory-bank-event-import-'));
  const source = join(workspace, 'memory-bank');
  const output = join(workspace, 'events');
  try {
    mkdirSync(join(source, 'tasks'), { recursive: true });
    writeFileSync(join(source, 'tasks', 'T1.md'), '# T1: Example\n\n*Last Updated: 2026-09-08 16:26:03 IST*\n\n**Status:** 🔄 IN PROGRESS\n\n- [ ] Import safely\n');
    const before = readFileSync(join(source, 'tasks', 'T1.md'), 'utf8');
    const report = await importMemoryBank({ projectId: 'fixture', source, output });
    const events = readFileSync(join(output, 'events.jsonl'), 'utf8').trim().split('\n').map(JSON.parse);
    const record = events.find((event) => event.event_type === 'task.recorded');
    const status = events.find((event) => event.event_type === 'task.status_observed');
    assert.equal(report.events_written, 2);
    assert.equal(record.entity.id, 'T1');
    assert.equal(record.data.status, '🔄 IN PROGRESS');
    assert.equal(record.data.checklists.length, 1);
    assert.equal(record.raw_content, before);
    assert.equal(status.data.status, '🔄 IN PROGRESS');
    assert.equal(readFileSync(join(source, 'tasks', 'T1.md'), 'utf8'), before);
  } finally {
    rmSync(workspace, { recursive: true, force: true });
  }
});

test('extracts task links and decisions as separate observed events', async () => {
  const workspace = mkdtempSync(join(tmpdir(), 'memory-bank-event-import-semantics-'));
  const source = join(workspace, 'memory-bank');
  const output = join(workspace, 'events');
  try {
    mkdirSync(join(source, 'tasks'), { recursive: true });
    writeFileSync(join(source, 'tasks', 'T9.md'), [
      '# T9: Semantic import',
      '',
      '*Last Updated: 2026-09-08 16:35:22 IST*',
      '',
      '**Status:** 🔄 IN PROGRESS',
      '**Parent Task**: T1',
      '**Dependencies**: T2, T3',
      '',
      '## Decisions',
      '- Keep raw text for T9.',
      '',
      '**Decision**: Reject shared snapshots.'
    ].join('\n'));
    await importMemoryBank({ projectId: 'fixture', source, output });
    const events = readFileSync(join(output, 'events.jsonl'), 'utf8').trim().split('\n').map(JSON.parse);
    assert.equal(events.filter((event) => event.event_type === 'task.status_observed').length, 1);
    assert.deepEqual(
      events.filter((event) => event.event_type === 'task.parent_observed').map((event) => event.data.parent_task_id),
      ['T1']
    );
    assert.deepEqual(
      events.filter((event) => event.event_type === 'task.dependency_observed').map((event) => event.data.dependency_task_id),
      ['T2', 'T3']
    );
    assert.deepEqual(
      events.filter((event) => event.event_type === 'decision.observed').map((event) => event.data.statement),
      ['Keep raw text for T9.', 'Reject shared snapshots.']
    );
  } finally {
    rmSync(workspace, { recursive: true, force: true });
  }
});

test('keeps independent updates, ignores retries, and reports same-field conflicts', () => {
  const event = (event_id, id, field, value, expected_version = 0) => ({
    event_id,
    occurred_at: '2026-09-08T11:00:00.000Z',
    entity: { type: 'task', id },
    data: { field, value },
    expected_version
  });
  const status = event('status-t1', 'T1', 'status', 'complete');
  const concurrent = [
    status,
    status,
    event('owner-t1', 'T1', 'owner', 'agent-a'),
    event('status-t1-conflict', 'T1', 'status', 'blocked'),
    event('owner-t1-conflict', 'T1', 'owner', 'agent-b'),
    event('decision-a', 'D1', 'outcome', 'event files'),
    event('decision-b', 'D1', 'outcome', 'shared JSONL')
  ];
  const result = resolveStateEvents(concurrent);
  assert.deepEqual(result.applied.sort(), ['decision-a', 'owner-t1', 'status-t1']);
  assert.deepEqual(result.duplicates, ['status-t1']);
  assert.equal(result.conflicts.length, 3);
  assert.deepEqual(result.conflicts.map((conflict) => conflict.event_id).sort(), ['decision-b', 'owner-t1-conflict', 'status-t1-conflict']);
  assert.deepEqual(result.state['task:T1:status'], { version: 1, value: 'complete' });
  assert.deepEqual(result.state['task:T1:owner'], { version: 1, value: 'agent-a' });
  const reversed = resolveStateEvents([...concurrent].reverse());
  assert.deepEqual(reversed.state, result.state);
  assert.deepEqual(reversed.conflicts, result.conflicts);
});

test('preserves non-text files as base64 without parsing them as Markdown', async () => {
  const workspace = mkdtempSync(join(tmpdir(), 'memory-bank-event-import-binary-'));
  const source = join(workspace, 'memory-bank');
  const output = join(workspace, 'events');
  try {
    mkdirSync(join(source, 'assets'), { recursive: true });
    const image = Buffer.from([0, 255, 1, 128]);
    writeFileSync(join(source, 'assets', 'diagram.bin'), image);
    await importMemoryBank({ projectId: 'fixture', source, output });
    const event = JSON.parse(readFileSync(join(output, 'events.jsonl'), 'utf8'));
    assert.equal(event.raw_content, null);
    assert.equal(event.raw_content_base64, image.toString('base64'));
    assert.deepEqual(event.warnings, ['non_text_artifact']);
  } finally {
    rmSync(workspace, { recursive: true, force: true });
  }
});

test('rejects an output folder inside the source Memory Bank', async () => {
  const source = mkdtempSync(join(tmpdir(), 'memory-bank-event-import-source-'));
  try {
    await assert.rejects(
      importMemoryBank({ projectId: 'fixture', source, output: resolve(source, 'events') }),
      /Output must be outside the source Memory Bank/
    );
  } finally {
    rmSync(source, { recursive: true, force: true });
  }
});
