#!/usr/bin/env node

const { existsSync, readFileSync } = require('node:fs');
const { resolve } = require('node:path');
const { yellow } = require('chalk');
const { program } = require('commander');

const pkg = JSON.parse(readFileSync(resolve(__dirname, '../package.json'), 'utf-8'));
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
  .addHelpText('beforeAll', logo);

program
  .argument('[file]', 'Path to the entry file (optional if using -e or default file exists)')
  .option('-e, --entry <file>', 'Path to the entry file (default: ./index.jsx or ./index.tsx)');

program
  .option('-c, --components-only', 'Show only component nodes in the tree (default: false)')
  .option('-H, --html-only', 'Show only HTML tag nodes in the tree (default: false)')
  .option('-t, --show-text', 'Show text nodes in the tree (default: false)')
  .option('-p, --show-path', 'Show the full file path for each node in the tree (default: false)')
  .option('-d, --depth <depth>', 'Limit the tree display to specified depth level');

program.action((entryArg, options) => {
  const cwd = process.cwd();
  const entry = options.entry || entryArg || getDefaultEntry(cwd);

  if (!entry) {
    log('error: the specified entry file does not exist');
    warn('Please provide a valid entry file using the -e option or positional argument.');
    process.exit(1);
  }

  if (!existsSync(entry)) {
    log(`error: the specified entry file does not exist: ${entry}`);
    warn('Please check the file path and try again.');
    process.exit(1);
  }

  require('../dist/core/analyzer.js').default(entry, options);
});

program.parse(process.argv);

function getDefaultEntry(dir) {
  const jsxPath = resolve(dir, 'index.jsx');
  const tsxPath = resolve(dir, 'index.tsx');

  if (existsSync(jsxPath)) return jsxPath;
  if (existsSync(tsxPath)) return tsxPath;

  return null;
}
