import { basename } from 'node:path';

import { cyan, yellow } from 'chalk';

import { Component } from '@/types';

const log = console.log;

const print = (node: Component, indent = '', isPrevLast = true, isRoot = true) => {
  const connector = isRoot ? '' : isPrevLast ? '└── ' : '├── ';
  const name = node.isComponent ? yellow(node.type) : cyan(node.type);
  const path = node.path ? `(${basename(node.path)})` : '';

  log(`${indent}${connector}${name} ${path}`.trimEnd());

  if (node?.isComponent && node.render) {
    const childIndent = isRoot ? '' : indent + (isPrevLast ? '    ' : '│   ');

    print(node.render, childIndent, true, false);
  } else if (node.children) {
    node.children.forEach((child, index, array) => {
      const childIndent = isRoot ? '' : indent + (isPrevLast ? '    ' : '│   ');
      const isLast = array.length - 1 === index;

      print(child, childIndent, isLast, false);
    });
  }
};

export default print;
