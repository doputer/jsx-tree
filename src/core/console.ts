import { basename } from 'node:path';

import { cyan, white, yellow } from 'chalk';

import type { Component, FilterOptions } from '@/types';

const log = console.log;

const CONNECTOR_MIDDLE = '├── ';
const CONNECTOR_LAST = '└── ';
const INDENT_MIDDLE = '│   ';
const INDENT_LAST = '    ';

const defaultOptions: FilterOptions = {
  componentsOnly: false,
  htmlOnly: false,
  showText: false,
};

const print = (
  node: Component,
  indent = '',
  isPrevLast = true,
  isRoot = true,
  options: FilterOptions = defaultOptions,
) => {
  if (!isRoot && !shouldShow(node, options)) {
    if (node.type === 'COMPONENT' && node.render) {
      print(node.render, indent, isPrevLast, false, options);

      return;
    } else if (node.type === 'HTML') {
      node.children.forEach((child, index, array) => {
        const isLast = array.length - 1 === index;

        print(child, indent, isLast, false, options);
      });

      return;
    }

    return;
  }

  const connector = isRoot ? '' : isPrevLast ? CONNECTOR_LAST : CONNECTOR_MIDDLE;
  const label = format(node);
  const path = node.type === 'COMPONENT' ? `(${basename(node.path)})` : '';

  log(`${indent}${connector}${label} ${path}`.trimEnd());

  if (node.type === 'COMPONENT' && node.render) {
    const childIndent = isRoot ? '' : indent + (isPrevLast ? INDENT_LAST : INDENT_MIDDLE);

    print(node.render, childIndent, true, false, options);
  } else if (node.type === 'HTML') {
    node.children.forEach((child, index, array) => {
      const childIndent = isRoot ? '' : indent + (isPrevLast ? INDENT_LAST : INDENT_MIDDLE);
      const isLast = array.length - 1 === index;

      print(child, childIndent, isLast, false, options);
    });
  }
};

const shouldShow = (node: Component, options: FilterOptions) => {
  const { componentsOnly, htmlOnly, showText } = options;
  const { type } = node;

  const isTextType = type === 'TEXT' || type === 'EXPRESSION' || type === 'CHILDREN_PLACEHOLDER';

  if (isTextType) {
    return !!showText;
  }

  if (componentsOnly) {
    return type === 'COMPONENT';
  }

  if (htmlOnly) {
    return type === 'HTML';
  }

  return type === 'COMPONENT' || type === 'HTML' || true;
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

const printTree = (root: Component, options: FilterOptions = {}) => {
  const mergedOptions = { ...defaultOptions, ...options };

  if (mergedOptions.componentsOnly && mergedOptions.htmlOnly) {
    mergedOptions.componentsOnly = false;
    mergedOptions.htmlOnly = false;
  }

  print(root, '', true, true, mergedOptions);
};

export default printTree;
