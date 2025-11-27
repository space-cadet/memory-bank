import { spawnSync } from 'child_process';
import path from 'path';

/**
 * Install pnpm dependencies
 */
export function installDependencies(dbDir) {
  console.log('Installing dependencies...');
  
  const result = spawnSync('pnpm', ['install'], {
    cwd: dbDir,
    stdio: 'inherit',
    shell: true
  });
  
  if (result.status !== 0) {
    return { success: false, error: 'install_failed' };
  }
  
  console.log('✓ Dependencies installed\n');
  return { success: true };
}

/**
 * Execute all parser scripts
 */
export function runParsers(dbDir) {
  console.log('Running parsers...\n');
  
  const parsers = [
    { script: 'parse-edits.js', name: 'Edit History' },
    { script: 'parse-tasks.js', name: 'Tasks' },
    { script: 'parse-sessions.js', name: 'Sessions' },
    { script: 'parse-session-cache.js', name: 'Session Cache' }
  ];
  
  const results = [];
  
  for (const parser of parsers) {
    console.log(`\n${'='.repeat(60)}`);
    console.log(`Parsing ${parser.name}...`);
    console.log('='.repeat(60) + '\n');
    
    const result = spawnSync('node', [parser.script], {
      cwd: dbDir,
      stdio: 'inherit',
      shell: true
    });
    
    results.push({
      parser: parser.name,
      success: result.status === 0
    });
    
    if (result.status !== 0) {
      console.error(`\n❌ Failed to parse ${parser.name}`);
    }
  }
  
  const allSuccess = results.every(r => r.success);
  
  return { allSuccess, results };
}

/**
 * Display parsing completion message
 */
export function displayParserResults(allSuccess, dbDir) {
  if (allSuccess) {
    console.log('\n' + '='.repeat(60));
    console.log('✓ All parsers completed successfully!');
    console.log('='.repeat(60));
    console.log(`\nDatabase location: ${path.join(dbDir, 'memory_bank.db')}`);
    console.log('\nTo start the viewer:');
    console.log(`  cd ${dbDir}`);
    console.log('  node server.js\n');
  } else {
    console.error('\n❌ Some parsers failed. Check the output above for details.\n');
  }
  
  return allSuccess;
}
