#!/usr/bin/env node

const fs = require('node:fs');
const path = require('node:path');
const chalk = require('chalk');
const { program } = require('commander');

const pkg = JSON.parse(fs.readFileSync(path.resolve(__dirname, '../package.json'), 'utf-8'));
const error = console.error;

const logo = `
     ██╗███████╗██╗  ██╗    ████████╗██████╗ ███████╗███████╗
     ██║██╔════╝╚██╗██╔╝    ╚══██╔══╝██╔══██╗██╔════╝██╔════╝
     ██║███████╗ ╚███╔╝        ██║   ██████╔╝█████╗  █████╗  
██   ██║╚════██║ ██╔██╗        ██║   ██╔══██╗██╔══╝  ██╔══╝  
╚█████╔╝███████║██╔╝ ██╗       ██║   ██║  ██║███████╗███████╗
 ╚════╝ ╚══════╝╚═╝  ╚═╝       ╚═╝   ╚═╝  ╚═╝╚══════╝╚══════╝
`;

program
  .name(pkg.name)
  .description(pkg.description)
  .version(pkg.version)
  .addHelpText('beforeAll', logo)
  .option('-e, --entry <file>', 'entry file to analyze (default: ./index.jsx)');

const options = program.parse(process.argv).opts();

const entryPath = options.entry
  ? path.resolve(process.cwd(), options.entry)
  : path.resolve(process.cwd(), 'index.jsx');

if (!entryPath || !fs.existsSync(entryPath)) {
  error(`${chalk.yellow('Entry file not found: ')}${entryPath}`);
  error(chalk.red(`Please provide a valid path using the -e option.`));
  process.exit(1);
}

require('../dist/core/analyzer.js').default(entryPath);
