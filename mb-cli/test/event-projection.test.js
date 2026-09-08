import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import test from 'node:test';
import { importMemoryBank } from '../scripts/import-memory-bank-events.mjs';
import { projectMemoryBankEvents } from '../scripts/project-memory-bank-events.mjs';

function readEvents(path) {
  return readFileSync(path, 'utf8').trim().split('\n').map(JSON.parse);
}

test('projects stable views and preserves record events through a round trip', async () => {
  const workspace = mkdtempSync(join(tmpdir(), 'memory-bank-event-projection-'));
  const source = join(workspace, 'memory-bank');
  const imported = join(workspace, 'imported');
  const projectionOne = join(workspace, 'projection-one');
  const projectionTwo = join(workspace, 'projection-two');
  const roundTrip = join(workspace, 'round-trip');
  try {
    mkdirSync(join(source, 'tasks'), { recursive: true });
    mkdirSync(join(source, 'sessions'), { recursive: true });
    mkdirSync(join(source, 'edits', '2026-09-08'), { recursive: true });
    writeFileSync(join(source, 'tasks', 'T1.md'), '# T1: Projection\n\n*Last Updated: 2026-09-08 16:48:10 IST*\n\n**Status:** 🔄 IN PROGRESS\n\n**Dependencies**: T0\n');
    writeFileSync(join(source, 'sessions', '2026-09-08-afternoon.md'), '# Session\n\n*Created: 2026-09-08 16:48:10 IST*\n');
    writeFileSync(join(source, 'edits', '2026-09-08', '164810-T1.md'), '#### 16:48:10 IST - T1: Projection\n');
    await importMemoryBank({ projectId: 'fixture', source, output: imported });
    const first = await projectMemoryBankEvents({ input: join(imported, 'events.jsonl'), output: projectionOne });
    await projectMemoryBankEvents({ input: join(imported, 'events.jsonl'), output: projectionTwo });
    await importMemoryBank({ projectId: 'fixture', source: join(projectionOne, 'source'), output: roundTrip });

    assert.equal(first.records_projected, 3);
    assert.equal(readFileSync(join(projectionOne, 'views', 'tasks.md'), 'utf8'), readFileSync(join(projectionTwo, 'views', 'tasks.md'), 'utf8'));
    assert.match(readFileSync(join(projectionOne, 'views', 'tasks.md'), 'utf8'), /T1: Projection/);
    const initialRecords = readEvents(join(imported, 'events.jsonl')).filter((event) => event.event_type.endsWith('.recorded'));
    const roundTripRecords = readEvents(join(roundTrip, 'events.jsonl')).filter((event) => event.event_type.endsWith('.recorded'));
    assert.deepEqual(roundTripRecords, initialRecords);
  } finally {
    rmSync(workspace, { recursive: true, force: true });
  }
});
