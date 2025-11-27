#!/usr/bin/env node

import { Command } from 'commander';
import { initCommand } from './commands/init.js';

const program = new Command();

program
  .name('mb')
  .description('Memory Bank CLI')
  .version('0.1.0');

program
  .command('init')
  .description('Initialize a new Memory Bank project')
  .option('-f, --force', 'Override all existing files')
  .option('-d, --dry-run', 'Show what would be created without making any changes')
  .option('--full', 'Initialize all components (equivalent to --force)')
  .option('--core', 'Initialize only core files (tasks.md, session_cache.md, etc.)')
  .option('--templates', 'Initialize only template files')
  .option('--database', 'Initialize only database files and migration scripts')
  .option('--setup-viewer', 'Initialize only viewer files (server + UI)')
  .option('--skip-existing', 'Initialize only missing files (default behavior)')
  .option('--interactive', 'Interactive setup menu')
  .addHelpText('after', `
Examples:
  mb init                      # Initialize new or update existing memory bank
  mb init --dry-run            # Preview changes without making them
  mb init --interactive        # Step-by-step interactive setup
  mb init --core               # Initialize only core files
  mb init --database --setup-viewer  # Initialize database + viewer
  mb init --full               # Reinitialize everything
  mb init --dry-run --full     # Preview full reinitialization
  
When a memory bank already exists:
  - Without flags: Shows available options and exits
  - With flags: Initializes only specified components, skipping existing files
  - With --force: Overwrites all specified components
  - With --interactive: Interactive menu to choose what to do
  
Components:
  core: Essential memory bank files (tasks.md, projectbrief.md, etc.)
  templates: File templates in memory-bank/templates/
  database: SQLite setup, database files, and parser scripts
  viewer: Web viewer server and UI files
  
Dry Run:
  - Use --dry-run with any flags to preview changes
  - Shows what files would be created/overwritten
  - Does not make any actual changes
`)
  .action(initCommand);

program.parse();