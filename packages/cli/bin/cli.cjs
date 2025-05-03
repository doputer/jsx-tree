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
  .option('-f, --entry <file>', 'Path to the entry file (default: ./index.jsx or ./index.tsx)');

program
  .option('-c, --components-only', 'Display only component nodes (default: false)')
  .option('-H, --html-only', 'Display only HTML tag nodes (default: false)')
  .option('-t, --show-text', 'Display text nodes (default: false)')
  .option('-p, --show-path', 'Display the file path for each node (default: false)')
  .option('-i, --include-tags <tags...>', 'Include only specified tags or components')
  .option('-e, --exclude-tags <tags...>', 'Exclude specified tags or components')
  .option('-d, --depth <depth>', 'Limit the display depth of the tree');

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

  require('../dist/lib/analyzer.js').default(entry, options);
});

program.parse(process.argv);

function getDefaultEntry(dir) {
  const jsxPath = resolve(dir, 'index.jsx');
  const tsxPath = resolve(dir, 'index.tsx');

  if (existsSync(jsxPath)) return jsxPath;
  if (existsSync(tsxPath)) return tsxPath;

  return null;
}
