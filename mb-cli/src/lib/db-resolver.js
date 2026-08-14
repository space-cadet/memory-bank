import { existsSync } from 'fs';
import { dirname, join, resolve } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const TEMPLATE_LIB = resolve(__dirname, '../../templates/memory-bank/database/lib');

/**
 * Resolve database workflow modules for the project the user is operating on.
 * The generated project is preferred so it can be upgraded independently of
 * the globally installed CLI. The bundled template is the fallback used before
 * a project has been initialized.
 */
export function resolveDbLibBase(cwd = process.cwd()) {
  const projectLib = resolve(cwd, 'memory-bank/database/lib');
  if (existsSync(join(projectLib, 'sqlite.js'))) return projectLib;
  return TEMPLATE_LIB;
}

export async function loadDbModules(cwd = process.cwd()) {
  const base = resolveDbLibBase(cwd);
  const sqlite = await import(join(base, 'sqlite.js'));
  const inserts = await import(join(base, 'inserts.js'));
  const regenerate = await import(join(base, 'regenerate.js'));
  const workflow = await import(join(base, 'workflow.js'));
  return { sqlite, inserts, regenerate, workflow };
}
