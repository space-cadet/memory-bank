#!/usr/bin/env node

import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, relative, resolve, sep } from 'node:path';

function parseArgs(args) {
  const options = { input: null, output: null };
  for (let index = 0; index < args.length; index += 1) {
    const value = args[index];
    if (value === '--input' || value === '--output') {
      options[value.slice(2)] = args[index + 1];
      index += 1;
    }
  }
  if (!options.input || !options.output) {
    throw new Error('Usage: node project-memory-bank-events.mjs --input <events.jsonl> --output <directory>');
  }
  return options;
}

function compareText(left, right) {
  return left.localeCompare(right);
}

function recordEvents(events) {
  return events
    .filter((event) => event.event_type.endsWith('.recorded'))
    .sort((left, right) => compareText(left.source.path, right.source.path));
}

function safeOutputPath(root, sourcePath) {
  const outputPath = resolve(root, sourcePath);
  if (outputPath !== root && !outputPath.startsWith(`${root}${sep}`)) {
    throw new Error(`Unsafe source path: ${sourcePath}`);
  }
  return outputPath;
}

async function writeFileSafely(path, content) {
  await mkdir(dirname(path), { recursive: true });
  await writeFile(path, content);
}

function table(headers, rows) {
  const escape = (value) => String(value ?? '').replaceAll('|', '\\|').replaceAll('\n', ' ');
  return [
    `| ${headers.map(escape).join(' | ')} |`,
    `| ${headers.map(() => '---').join(' | ')} |`,
    ...rows.map((row) => `| ${row.map(escape).join(' | ')} |`)
  ].join('\n');
}

function taskRows(events) {
  return recordEvents(events)
    .filter((event) => event.entity.type === 'task' && event.entity.id)
    .sort((left, right) => compareText(left.entity.id, right.entity.id))
    .map((event) => [
      event.entity.id,
      event.data.headings?.[0]?.text ?? '',
      event.data.status ?? '',
      event.data.parent ?? '',
      event.data.depends_on ?? '',
      event.source.path
    ]);
}

function countBy(events, key) {
  return Object.fromEntries(events.reduce((counts, event) => {
    const value = key(event);
    counts.set(value, (counts.get(value) ?? 0) + 1);
    return counts;
  }, new Map()));
}

function viewFiles(events) {
  const records = recordEvents(events);
  const projectId = records[0]?.project_id ?? 'unknown';
  const taskEvents = records.filter((event) => event.entity.type === 'task' && event.entity.id);
  const sessionEvents = records.filter((event) => event.entity.type === 'session');
  const editEvents = records.filter((event) => event.entity.type === 'edit');
  const warnings = records.flatMap((event) => event.warnings.map((warning) => `${event.source.path}: ${warning}`));
  const statusCounts = countBy(taskEvents, (event) => event.data.status || 'unknown');

  return {
    'tasks.md': `# Generated Task View\n\nProject: ${projectId}\n\n${table(['ID', 'Title', 'Status', 'Parent', 'Dependencies', 'Source'], taskRows(events))}\n`,
    'sessions.md': `# Generated Session View\n\nProject: ${projectId}\n\n${table(['Source', 'Timestamp'], sessionEvents.map((event) => [event.source.path, event.source.source_timestamp ?? '']))}\n`,
    'context.md': `# Generated Context View\n\nProject: ${projectId}\n\n## Task Status\n\n${table(['Status', 'Count'], Object.entries(statusCounts).sort(([left], [right]) => compareText(left, right)))}\n`,
    'progress.md': `# Generated Progress View\n\nProject: ${projectId}\n\n${table(['Record type', 'Count'], Object.entries(countBy(records, (event) => event.entity.type)).sort(([left], [right]) => compareText(left, right)))}\n`,
    'history.md': `# Generated History View\n\nProject: ${projectId}\n\n${table(['Source', 'Timestamp'], editEvents.map((event) => [event.source.path, event.source.source_timestamp ?? '']))}\n`,
    'warnings.md': `# Projection Warnings\n\n${warnings.length ? warnings.map((warning) => `- ${warning}`).join('\n') : 'None'}\n`
  };
}

export async function projectMemoryBankEvents({ input, output }) {
  const inputPath = resolve(input);
  const outputRoot = resolve(output);
  const sourceRoot = resolve(outputRoot, 'source');
  const viewsRoot = resolve(outputRoot, 'views');
  const events = (await readFile(inputPath, 'utf8'))
    .trim()
    .split('\n')
    .filter(Boolean)
    .map(JSON.parse);
  const records = recordEvents(events);

  for (const event of records) {
    const destination = safeOutputPath(sourceRoot, event.source.path);
    const content = event.raw_content ?? Buffer.from(event.raw_content_base64, 'base64');
    await writeFileSafely(destination, content);
  }
  for (const [name, content] of Object.entries(viewFiles(events))) {
    await writeFileSafely(resolve(viewsRoot, name), content);
  }

  const report = {
    schema_version: 1,
    input: inputPath,
    records_projected: records.length,
    views_written: Object.keys(viewFiles(events)).sort(),
    warnings: records.flatMap((event) => event.warnings.map((warning) => ({ path: event.source.path, warning })))
  };
  await writeFileSafely(resolve(outputRoot, 'projection.json'), `${JSON.stringify(report, null, 2)}\n`);
  return report;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  try {
    const options = parseArgs(process.argv.slice(2));
    const report = await projectMemoryBankEvents(options);
    console.log(`Projected ${report.records_projected} source records and ${report.views_written.length} views.`);
  } catch (error) {
    console.error(`Projection failed: ${error.message}`);
    process.exitCode = 1;
  }
}
