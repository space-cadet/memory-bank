import fs from 'fs';
import path from 'path';

/**
 * Scan existing memory bank content
 */
export function scanExistingContent(targetDir, dirs, coreFiles, templateFiles, databaseFiles, parserScripts, viewerFiles, viewerPublicFiles) {
  const mbDir = path.join(targetDir, 'memory-bank');
  
  const scan = {
    exists: fs.existsSync(mbDir),
    dirsExist: [],
    coreFilesExist: [],
    templateFilesExist: [],
    databaseFilesExist: [],
    databaseScriptsExist: [],
    viewerFilesExist: [],
    viewerPublicFilesExist: []
  };

  if (!scan.exists) {
    return scan;
  }

  // Check directories
  for (const dir of dirs) {
    const dirPath = path.join(targetDir, dir);
    if (fs.existsSync(dirPath)) {
      scan.dirsExist.push(dir);
    }
  }

  // Check core files
  for (const file of coreFiles) {
    const filePath = path.join(mbDir, file);
    if (fs.existsSync(filePath)) {
      scan.coreFilesExist.push(file);
    }
  }

  // Check template files
  for (const file of templateFiles) {
    const filePath = path.join(mbDir, 'templates', file);
    if (fs.existsSync(filePath)) {
      scan.templateFilesExist.push(file);
    }
  }

  // Check database files
  for (const file of databaseFiles) {
    const filePath = path.join(mbDir, 'database', file);
    if (fs.existsSync(filePath)) {
      scan.databaseFilesExist.push(file);
    }
  }

  // Check database scripts
  for (const file of parserScripts) {
    const filePath = path.join(mbDir, 'database', file);
    if (fs.existsSync(filePath)) {
      scan.databaseScriptsExist.push(file);
    }
  }

  // Check viewer files
  for (const file of viewerFiles) {
    const filePath = path.join(mbDir, 'database', file);
    if (fs.existsSync(filePath)) {
      scan.viewerFilesExist.push(file);
    }
  }

  // Check viewer public files
  for (const file of viewerPublicFiles) {
    const filePath = path.join(mbDir, 'database', file);
    if (fs.existsSync(filePath)) {
      scan.viewerPublicFilesExist.push(file);
    }
  }

  return scan;
}

/**
 * Validate files required for parsing
 */
export function validateParserFiles(targetDir) {
  const mbDir = path.join(targetDir, 'memory-bank');
  const dbDir = path.join(mbDir, 'database');
  const editHistoryPath = path.join(mbDir, 'edit_history.md');
  const tasksPath = path.join(mbDir, 'tasks.md');
  const sessionsDir = path.join(mbDir, 'sessions');
  const sessionCachePath = path.join(mbDir, 'session_cache.md');
  
  const missingFiles = [];
  if (!fs.existsSync(editHistoryPath)) missingFiles.push('edit_history.md');
  if (!fs.existsSync(tasksPath)) missingFiles.push('tasks.md');
  if (!fs.existsSync(sessionCachePath)) missingFiles.push('session_cache.md');
  if (!fs.existsSync(sessionsDir)) missingFiles.push('sessions/ directory');
  
  return { missingFiles, dbDir, mbDir };
}

/**
 * Validate database directory and parser scripts
 */
export function validateDatabaseSetup(dbDir) {
  if (!fs.existsSync(dbDir)) {
    return { valid: false, error: 'database_dir_missing' };
  }
  
  const parserScripts = ['parse-edits.js', 'parse-tasks.js', 'parse-sessions.js', 'parse-session-cache.js'];
  const missingScripts = parserScripts.filter(script => !fs.existsSync(path.join(dbDir, script)));
  
  if (missingScripts.length > 0) {
    return { valid: false, error: 'missing_scripts', missingScripts };
  }
  
  return { valid: true };
}

/**
 * Validate viewer setup
 */
export function validateViewerSetup(dbDir) {
  const serverPath = path.join(dbDir, 'server.js');
  const dbPath = path.join(dbDir, 'memory_bank.db');
  
  if (!fs.existsSync(serverPath)) {
    return { valid: false, error: 'server_missing', serverPath };
  }
  
  if (!fs.existsSync(dbPath)) {
    return { valid: false, error: 'database_missing', dbPath };
  }
  
  return { valid: true };
}

/**
 * Check if dependencies are installed
 */
export function checkDependenciesInstalled(dbDir) {
  const nodeModulesPath = path.join(dbDir, 'node_modules');
  return fs.existsSync(nodeModulesPath);
}
