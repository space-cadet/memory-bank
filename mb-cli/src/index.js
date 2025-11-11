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
  .option('--skip-existing', 'Initialize only missing files (default behavior)')
  .addHelpText('after', `
Examples:
  mb init                  # Initialize new or update existing memory bank
  mb init --dry-run        # Preview changes without making them
  mb init --core           # Initialize only core files
  mb init --database       # Initialize only database files
  mb init --core --templates  # Initialize core files and templates
  mb init --full           # Reinitialize everything
  mb init --force --database  # Force reinitialize database files
  
When a memory bank already exists:
  - Without flags: Shows available options and exits
  - With flags: Initializes only specified components, skipping existing files
  - With --force: Overwrites all specified components
  
Components:
  core: Essential memory bank files (tasks.md, projectbrief.md, etc.)
  templates: File templates in memory-bank/templates/
  database: Prisma setup, database files, and migration scripts
`)
  .action(initCommand);

program.parse();