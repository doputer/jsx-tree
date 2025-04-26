import { basename } from 'node:path';

import { cyan, white, yellow } from 'chalk';

import { Component } from '@/types';

const log = console.log;

const print = (node: Component, indent = '', isPrevLast = true, isRoot = true) => {
  const connector = isRoot ? '' : isPrevLast ? '└── ' : '├── ';
  const name =
    node.type === 'HTML'
      ? cyan(node.name)
      : node.type === 'COMPONENT'
        ? yellow(node.name)
        : white(node.value);
  const path = node.type === 'COMPONENT' ? `(${basename(node.path)})` : '';

  log(`${indent}${connector}${name} ${path}`.trimEnd());

  if (node.type === 'COMPONENT' && node.render) {
    const childIndent = isRoot ? '' : indent + (isPrevLast ? '    ' : '│   ');

    print(node.render, childIndent, true, false);
  } else if (node.type === 'HTML' && node.children) {
    node.children.forEach((child, index, array) => {
      const childIndent = isRoot ? '' : indent + (isPrevLast ? '    ' : '│   ');
      const isLast = array.length - 1 === index;

      print(child, childIndent, isLast, false);
    });
  }
};

export default print;
