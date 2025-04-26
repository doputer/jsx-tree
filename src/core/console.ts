import { basename } from 'node:path';

import { cyan, white, yellow } from 'chalk';

import type { Component } from '@/types';

const log = console.log;

const CONNECTOR_MIDDLE = '├── ';
const CONNECTOR_LAST = '└── ';
const INDENT_MIDDLE = '│   ';
const INDENT_LAST = '    ';

const print = (node: Component, indent = '', isPrevLast = true, isRoot = true) => {
  const connector = isRoot ? '' : isPrevLast ? CONNECTOR_LAST : CONNECTOR_MIDDLE;
  const label = format(node);
  const path = node.type === 'COMPONENT' ? `(${basename(node.path)})` : '';

  log(`${indent}${connector}${label} ${path}`.trimEnd());

  if (node.type === 'COMPONENT' && node.render) {
    const childIndent = isRoot ? '' : indent + (isPrevLast ? INDENT_LAST : INDENT_MIDDLE);

    print(node.render, childIndent, true, false);
  } else if (node.type === 'HTML') {
    node.children.forEach((child, index, array) => {
      const childIndent = isRoot ? '' : indent + (isPrevLast ? INDENT_LAST : INDENT_MIDDLE);
      const isLast = array.length - 1 === index;

      print(child, childIndent, isLast, false);
    });
  }
};

const format = (node: Component) => {
  switch (node.type) {
    case 'HTML':
      return cyan(node.name);
    case 'COMPONENT':
      return yellow(node.name);
    case 'TEXT':
    case 'EXPRESSION':
    case 'CHILDREN_PLACEHOLDER':
      return white(node.value);
    default:
      return 'ERROR';
  }
};

export default print;
