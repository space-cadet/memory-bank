import readline from 'readline';

/**
 * Display scan results and prompt user for selective init
 */
export async function promptForSelectiveInit(scan) {
  const components = [
    { name: 'core', label: 'Core files (tasks.md, session_cache.md, etc.)', exists: scan.coreFilesExist.length },
    { name: 'templates', label: 'Template files', exists: scan.templateFilesExist.length },
    { name: 'database', label: 'Database setup and parser scripts', exists: scan.databaseFilesExist.length + scan.databaseScriptsExist.length },
    { name: 'viewer', label: 'Database viewer (server + UI)', exists: scan.viewerFilesExist.length + scan.viewerPublicFilesExist.length }
  ];

  console.log('\nExisting Memory Bank detected!\n');
  console.log('Components:');
  
  for (const comp of components) {
    if (comp.exists > 0) {
      console.log(`  ✓ ${comp.label} (${comp.exists} files exist)`);
    } else {
      console.log(`  ⬜ ${comp.label} (missing)`);
    }
  }

  console.log('\nOptions for selective initialization:');
  console.log('  --interactive    Interactive setup menu');
  console.log('  --full           Initialize all components (overwrites existing)');
  console.log('  --core           Initialize only core files');
  console.log('  --templates      Initialize only template files');
  console.log('  --database       Initialize only database files');
  console.log('  --setup-viewer   Initialize only viewer files');
  console.log('  --skip-existing  Initialize only missing files (default)');
  console.log('  --force          Override all existing files\n');
}

/**
 * Interactive setup menu
 */
export async function promptForInteractiveSetup(scan, options) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  const question = (prompt) => new Promise((resolve) => {
    rl.question(prompt, resolve);
  });

  console.log('\n╔════════════════════════════════════════╗');
  console.log('║  Memory Bank Interactive Setup         ║');
  console.log('╚════════════════════════════════════════╝\n');

  console.log('What would you like to do?\n');
  console.log('1. Initialize memory bank structure (directories + core files)');
  console.log('2. Set up database (parser scripts + viewer)');
  console.log('3. Set up just the viewer (if database exists)');
  console.log('4. Parse memory bank files into database');
  console.log('5. Start viewer server');
  console.log('6. Full setup (everything)');
  console.log('7. Cancel\n');

  const choice = await question('Enter your choice (1-7): ');
  rl.close();

  const components = {
    core: false,
    templates: false,
    database: false,
    viewer: false,
    directories: false,
    parse: false,
    startViewer: false
  };

  switch (choice.trim()) {
    case '1':
      components.directories = true;
      components.core = true;
      components.templates = true;
      break;
    case '2':
      components.directories = true;
      components.database = true;
      components.viewer = true;
      break;
    case '3':
      components.viewer = true;
      break;
    case '4':
      components.parse = true;
      break;
    case '5':
      components.startViewer = true;
      break;
    case '6':
      components.directories = true;
      components.core = true;
      components.templates = true;
      components.database = true;
      components.viewer = true;
      break;
    case '7':
      console.log('Setup cancelled.');
      return null;
    default:
      console.log('Invalid choice. Please try again.');
      return await promptForInteractiveSetup(scan, options);
  }

  return components;
}

/**
 * Confirm initialization
 */
export async function confirmInitialization() {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  const confirmed = await new Promise((resolve) => {
    rl.question('Proceed with initialization? (yes/no): ', (answer) => {
      rl.close();
      resolve(answer.toLowerCase() === 'yes' || answer.toLowerCase() === 'y');
    });
  });

  return confirmed;
}
