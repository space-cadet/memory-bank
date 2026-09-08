#!/usr/bin/env node

import { createHash } from 'node:crypto';
import { mkdir, readdir, readFile, stat, writeFile } from 'node:fs/promises';
import { relative, resolve, sep } from 'node:path';

const TEXT_EXTENSIONS = new Set(['.css', '.dot', '.html', '.js', '.json', '.md', '.svg', '.xml', '.yaml', '.yml']);

function parseArgs(args) {
  const options = { project: null, source: null, output: null };
  for (let index = 0; index < args.length; index += 1) {
    const value = args[index];
    if (value === '--project' || value === '--source' || value === '--output') {
      options[value.slice(2)] = args[index + 1];
      index += 1;
    }
  }
  if (!options.project || !options.source || !options.output) {
    throw new Error('Usage: node import-memory-bank-events.mjs --project <id> --source <memory-bank> --output <directory>');
  }
  return options;
}

function hash(value) {
  return createHash('sha256').update(value).digest('hex');
}

function normalizePath(filePath) {
  return filePath.split(sep).join('/');
}

async function listFiles(root) {
  const files = [];
  async function visit(directory) {
    const entries = await readdir(directory, { withFileTypes: true });
    for (const entry of entries.sort((left, right) => left.name.localeCompare(right.name))) {
      const entryPath = resolve(directory, entry.name);
      if (entry.isDirectory()) await visit(entryPath);
      if (entry.isFile()) files.push(entryPath);
    }
  }
  await visit(root);
  return files;
}

function inferRecordType(relativePath) {
  if (relativePath.startsWith('tasks/')) return 'task';
  if (relativePath.startsWith('sessions/')) return 'session';
  if (relativePath.startsWith('edits/')) return 'edit';
  if (relativePath.startsWith('implementation-details/')) return 'implementation_detail';
  return 'artifact';
}

function frontMatter(markdown) {
  const match = markdown.match(/^---\n([\s\S]*?)\n---\n?/);
  if (!match) return {};
  return Object.fromEntries(
    match[1]
      .split('\n')
      .map((line) => line.match(/^([A-Za-z][A-Za-z0-9_-]*):\s*(.*)$/))
      .filter(Boolean)
      .map(([, key, value]) => [key, value])
  );
}

function firstMatch(markdown, patterns) {
  for (const pattern of patterns) {
    const match = markdown.match(pattern);
    if (match) return match[1].trim();
  }
  return null;
}

function taskIdFrom(relativePath, markdown) {
  const fileName = relativePath.split('/').pop().replace(/\.md$/, '');
  if (/^(?:T\d+[a-z]?|META-\d+[a-z]?|INFRA-[A-Z0-9-]+|SEC-\d{4}-\d{2}-\d{2})$/i.test(fileName)) return fileName;
  return firstMatch(markdown, [/^#\s+(T\d+[a-z]?|META-\d+[a-z]?|INFRA-[A-Z0-9-]+)/im]);
}

function parseMarkdown(relativePath, markdown) {
  const headings = [...markdown.matchAll(/^(#{1,6})\s+(.+)$/gm)].map(([, marks, text]) => ({ level: marks.length, text: text.trim() }));
  const taskReferences = [...new Set([...markdown.matchAll(/\b(?:T\d+[a-z]?|META-\d+[a-z]?|INFRA-[A-Z0-9-]+|SEC-\d{4}-\d{2}-\d{2})\b/gi)].map(([value]) => value))].sort();
  const checklists = [...markdown.matchAll(/^\s*- \[([ xX])\]\s+(.+)$/gm)].map(([, checked, text]) => ({ checked: checked !== ' ', text: text.trim() }));
  const status = firstMatch(markdown, [/^\*\*Status\*\*:\s*(.+)$/im, /^\*\*Status:\*\*\s*(.+)$/im]);
  const parent = firstMatch(markdown, [/^\*\*Parent(?: Task)?(?::)?\*\*:?s*(.+)$/im]);
  const dependsOn = firstMatch(markdown, [
    /^\s*-?\s*\*\*(?:Depends On|Dependencies)(?::)?\*\*:?s*(.+)$/im,
    /^\s*-\s*Depends On:\s*(.+)$/im
  ]);
  const sourceTimestamp = firstMatch(markdown, [/^\*Last Updated:\s*([^*]+)\*$/im, /^\*Created:\s*([^*]+)\*$/im]);
  const type = inferRecordType(relativePath);
  return {
    type,
    entity_id: type === 'task' ? taskIdFrom(relativePath, markdown) : null,
    metadata: frontMatter(markdown),
    source_timestamp: sourceTimestamp,
    status,
    parent,
    depends_on: dependsOn,
    headings,
    task_references: taskReferences,
    checklists
  };
}

function taskIds(value) {
  return [...new Set([...value.matchAll(/\b(?:T\d+[a-z]?|META-\d+[a-z]?|INFRA-[A-Z0-9-]+|SEC-\d{4}-\d{2}-\d{2})\b/gi)].map(([id]) => id))].sort();
}

function decisionStatements(markdown) {
  const statements = [];
  const seen = new Set();
  const add = (text) => {
    const statement = text.trim();
    if (statement && !seen.has(statement)) {
      seen.add(statement);
      statements.push(statement);
    }
  };

  const lines = markdown.split('\n');
  let inDecisionSection = false;
  for (const line of lines) {
    const heading = line.match(/^#{1,6}\s+(.+)$/);
    if (heading) {
      inDecisionSection = /\bdecision/i.test(heading[1]);
      continue;
    }
    const explicitDecision = line.match(/^\*\*Decision\*\*:\s*(.+)$/i);
    if (explicitDecision) add(explicitDecision[1]);
    if (!inDecisionSection) continue;
    const listItem = line.match(/^\s*(?:[-*]|\d+\.)\s+(.+)$/);
    if (listItem) add(listItem[1]);
  }
  return statements;
}

function eventFor({ projectId, sourceRoot, filePath, content }) {
  const relativePath = normalizePath(relative(sourceRoot, filePath));
  const contentHash = hash(content);
  const extension = relativePath.slice(relativePath.lastIndexOf('.')).toLowerCase();
  const isText = TEXT_EXTENSIONS.has(extension);
  const textContent = isText ? content.toString('utf8') : null;
  const parsed = isText ? parseMarkdown(relativePath, textContent) : { type: inferRecordType(relativePath) };
  const warning = isText ? [] : ['non_text_artifact'];
  if (isText && !parsed.source_timestamp) warning.push('missing_source_timestamp');
  if (parsed.type === 'task' && !parsed.entity_id) warning.push('missing_task_id');
  return {
    schema_version: 1,
    event_id: `import-${hash(`${projectId}\0${relativePath}\0${contentHash}`)}`,
    project_id: projectId,
    event_type: `${parsed.type}.recorded`,
    entity: { type: parsed.type, id: parsed.entity_id },
    occurred_at: null,
    actor_id: null,
    expected_version: null,
    source: {
      path: relativePath,
      content_hash: `sha256:${contentHash}`,
      branch: parsed.metadata?.source_branch ?? null,
      commit: parsed.metadata?.source_commit ?? null,
      source_timestamp: parsed.source_timestamp ?? null
    },
    data: parsed,
    raw_content: textContent,
    raw_content_base64: isText ? null : content.toString('base64'),
    warnings: warning
  };
}

function observedEvent(recordEvent, eventType, entity, data, rawContent) {
  return {
    schema_version: 1,
    event_id: `import-${hash(`${recordEvent.event_id}\0${eventType}\0${JSON.stringify(data)}`)}`,
    project_id: recordEvent.project_id,
    event_type: eventType,
    entity,
    occurred_at: null,
    actor_id: null,
    expected_version: null,
    source: recordEvent.source,
    data: { ...data, source_event_id: recordEvent.event_id },
    raw_content: rawContent,
    raw_content_base64: null,
    warnings: recordEvent.warnings
  };
}

function semanticEventsFor(recordEvent) {
  if (recordEvent.entity.type !== 'task' || !recordEvent.entity.id) {
    if (recordEvent.raw_content === null) return [];
    return decisionStatements(recordEvent.raw_content).map((statement, index) => observedEvent(
      recordEvent,
      'decision.observed',
      { type: 'decision', id: `decision-${hash(`${recordEvent.event_id}\0${index}\0${statement}`)}` },
      { statement, task_references: taskIds(statement) },
      statement
    ));
  }

  const events = [];
  const { entity, data } = recordEvent;
  if (data.status) {
    events.push(observedEvent(recordEvent, 'task.status_observed', entity, { status: data.status }, data.status));
  }
  if (data.parent) {
    const [parent] = taskIds(data.parent);
    if (parent) events.push(observedEvent(recordEvent, 'task.parent_observed', entity, { parent_task_id: parent }, data.parent));
  }
  for (const dependency of taskIds(data.depends_on ?? '')) {
    events.push(observedEvent(recordEvent, 'task.dependency_observed', entity, { dependency_task_id: dependency }, dependency));
  }
  for (const [index, statement] of decisionStatements(recordEvent.raw_content ?? '').entries()) {
    events.push(observedEvent(
      recordEvent,
      'decision.observed',
      { type: 'decision', id: `decision-${hash(`${recordEvent.event_id}\0${index}\0${statement}`)}` },
      { statement, task_references: taskIds(statement) },
      statement
    ));
  }
  return events;
}

export async function importMemoryBank({ projectId, source, output }) {
  const sourceRoot = resolve(source);
  const outputRoot = resolve(output);
  if (outputRoot === sourceRoot || outputRoot.startsWith(`${sourceRoot}${sep}`)) {
    throw new Error('Output must be outside the source Memory Bank.');
  }
  if (!(await stat(sourceRoot)).isDirectory()) throw new Error(`Source directory not found: ${sourceRoot}`);

  const files = await listFiles(sourceRoot);
  const events = [];
  for (const filePath of files) {
    const content = await readFile(filePath);
    const recordEvent = eventFor({ projectId, sourceRoot, filePath, content });
    events.push(recordEvent, ...semanticEventsFor(recordEvent));
  }
  const byEventType = Object.fromEntries(events.reduce((counts, event) => {
    counts.set(event.event_type, (counts.get(event.event_type) ?? 0) + 1);
    return counts;
  }, new Map()));
  const warnings = events
    .filter((event) => event.event_type.endsWith('.recorded'))
    .flatMap((event) => event.warnings.map((warning) => ({ path: event.source.path, warning })));
  const report = {
    schema_version: 1,
    project_id: projectId,
    source: sourceRoot,
    files_read: files.length,
    events_written: events.length,
    by_event_type: byEventType,
    warnings
  };

  await mkdir(outputRoot, { recursive: true });
  await writeFile(resolve(outputRoot, 'events.jsonl'), `${events.map((event) => JSON.stringify(event)).join('\n')}\n`);
  await writeFile(resolve(outputRoot, 'coverage.json'), `${JSON.stringify(report, null, 2)}\n`);
  return report;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  try {
    const options = parseArgs(process.argv.slice(2));
    const report = await importMemoryBank({ projectId: options.project, source: options.source, output: options.output });
    console.log(`Imported ${report.events_written} events from ${report.files_read} files.`);
    console.log(`Warnings: ${report.warnings.length}`);
  } catch (error) {
    console.error(`Import failed: ${error.message}`);
    process.exitCode = 1;
  }
}
