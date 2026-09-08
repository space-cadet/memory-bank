import assert from 'node:assert/strict';
import { mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import test from 'node:test';
import { writeImmutableEvent } from '../scripts/event-store.mjs';

test('stores independent events separately and makes identical retries harmless', async () => {
  const root = mkdtempSync(join(tmpdir(), 'memory-bank-event-store-'));
  try {
    const first = { event_id: 'agent_a_001', entity: { type: 'task', id: 'T1' }, data: { value: 'in progress' } };
    const second = { event_id: 'agent_b_001', entity: { type: 'task', id: 'T2' }, data: { value: 'complete' } };
    const [one, two] = await Promise.all([
      writeImmutableEvent({ root, event: first }),
      writeImmutableEvent({ root, event: second })
    ]);
    const retry = await writeImmutableEvent({ root, event: first });
    assert.equal(one.created, true);
    assert.equal(two.created, true);
    assert.deepEqual(retry, { created: false, duplicate: true, path: one.path });
    assert.deepEqual(JSON.parse(readFileSync(one.path, 'utf8')), first);
    assert.deepEqual(JSON.parse(readFileSync(two.path, 'utf8')), second);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test('rejects different events that claim the same ID', async () => {
  const root = mkdtempSync(join(tmpdir(), 'memory-bank-event-collision-'));
  try {
    await writeImmutableEvent({ root, event: { event_id: 'same_id', data: { value: 'first' } } });
    await assert.rejects(
      writeImmutableEvent({ root, event: { event_id: 'same_id', data: { value: 'second' } } }),
      /Event ID collision: same_id/
    );
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});
