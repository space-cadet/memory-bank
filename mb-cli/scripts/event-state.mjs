function keyFor(event) {
  return `${event.entity.type}:${event.entity.id}:${event.data.field}`;
}

function orderEvents(events) {
  return [...events].sort((left, right) => {
    const leftOrder = left.occurred_at ?? left.event_id;
    const rightOrder = right.occurred_at ?? right.event_id;
    return leftOrder.localeCompare(rightOrder) || left.event_id.localeCompare(right.event_id);
  });
}

export function resolveStateEvents(events) {
  const seen = new Set();
  const state = new Map();
  const applied = [];
  const duplicates = [];
  const conflicts = [];

  for (const event of orderEvents(events)) {
    if (seen.has(event.event_id)) {
      duplicates.push(event.event_id);
      continue;
    }
    seen.add(event.event_id);
    const key = keyFor(event);
    const current = state.get(key) ?? { version: 0, value: null };
    if (event.expected_version !== current.version) {
      conflicts.push({ event_id: event.event_id, key, expected_version: event.expected_version, actual_version: current.version });
      continue;
    }
    const next = { version: current.version + 1, value: event.data.value };
    state.set(key, next);
    applied.push(event.event_id);
  }

  return { state: Object.fromEntries(state), applied, duplicates, conflicts };
}
