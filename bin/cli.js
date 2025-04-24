#!/usr/bin/env node

const fs = require('node:fs');
const path = require('node:path');
const { yellow } = require('chalk');
const { program } = require('commander');

const pkg = JSON.parse(fs.readFileSync(path.resolve(__dirname, '../package.json'), 'utf-8'));
const log = console.log;
const warn = message => console.log(yellow(message));

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
  .argument('[file]', 'Path to the entry file (optional if using -e or default file exists)')
  .option('-e, --entry <file>', 'Entry file to analyze (default: ./index.jsx or ./index.tsx)');

program.action((entryArg, options) => {
  const cwd = process.cwd();
  const entry = options.entry || entryArg || getDefaultEntry(cwd);

  if (!entry) {
    log('error: the specified entry file does not exist');
    warn('Please provide a valid entry file using the -e option or positional argument.');
    process.exit(1);
  }

  if (!fs.existsSync(entry)) {
    log(`error: the specified entry file does not exist: ${entry}`);
    warn('Please check the file path and try again.');
    process.exit(1);
  }

  require('../dist/core/analyzer.js').default(entry);
});

program.parse(process.argv);

function getDefaultEntry(dir) {
  const jsxPath = path.resolve(dir, 'index.jsx');
  const tsxPath = path.resolve(dir, 'index.tsx');

  if (fs.existsSync(jsxPath)) return jsxPath;
  if (fs.existsSync(tsxPath)) return tsxPath;

  return null;
}
