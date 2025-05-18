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
  .option('-f, --force', 'Force initialization even if directory is not empty')
  .option('-d, --dry-run', 'Show what would be created without making any changes')
  .action(initCommand);

program.parse();