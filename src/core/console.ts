import { basename } from 'path';

import { cyan, yellow } from 'chalk';

import { Node } from '@/types';

const log = console.log;

const print = (node: Node, indent = '', isPrevLast = true, isRoot = true) => {
  const connector = isRoot ? '' : isPrevLast ? '└── ' : '├── ';
  const name = node.internal ? yellow(node.name) : cyan(node.name);
  const path = node.internal ? '' : `(${basename(node.path)})`;

  log(`${indent}${connector}${name} ${path}`.trimEnd());

  const values = Object.values(node.children);

  values.forEach((child, index) => {
    const childIndent = isRoot ? '' : indent + (isPrevLast ? '    ' : '│   ');
    const isLast = values.length - 1 === index;

    print(child, childIndent, isLast, false);
  });
};

export default print;
