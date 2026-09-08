import { randomUUID } from 'node:crypto';
import { link, mkdir, readFile, unlink, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';

function eventPath(root, eventId) {
  if (!/^[A-Za-z0-9_-]+$/.test(eventId)) throw new Error(`Unsafe event ID: ${eventId}`);
  return resolve(root, 'events', eventId.slice(0, 2), `${eventId}.json`);
}

export async function writeImmutableEvent({ root, event }) {
  if (!event?.event_id) throw new Error('Event must include event_id.');
  const destination = eventPath(resolve(root), event.event_id);
  const directory = resolve(destination, '..');
  const serialized = `${JSON.stringify(event)}\n`;
  await mkdir(directory, { recursive: true });
  const temporary = resolve(directory, `.${event.event_id}.${randomUUID()}.tmp`);
  await writeFile(temporary, serialized, { flag: 'wx' });
  try {
    await link(temporary, destination);
    await unlink(temporary);
    return { created: true, duplicate: false, path: destination };
  } catch (error) {
    await unlink(temporary).catch(() => {});
    if (error.code !== 'EEXIST') throw error;
    const existing = await readFile(destination, 'utf8');
    if (existing === serialized) return { created: false, duplicate: true, path: destination };
    throw new Error(`Event ID collision: ${event.event_id}`);
  }
}
