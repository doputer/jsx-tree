import { basename, dirname } from 'node:path';

import { cyan, white, yellow } from 'chalk';

import type { Component, FilterOptions } from '@jsx-tree/core';

const log = console.log;

const CONNECTOR_MIDDLE = '├── ';
const CONNECTOR_LAST = '└── ';
const INDENT_MIDDLE = '│   ';
const INDENT_LAST = '    ';

const defaultOptions: FilterOptions = {
  componentsOnly: false,
  htmlOnly: false,
  showText: false,
  showPath: false,
  includeTags: [],
  excludeTags: [],
  depth: 0,
} satisfies Required<FilterOptions>;

const print = (node: Component, indent = '', isPrevLast = true, isRoot = true) => {
  const connector = isRoot ? '' : isPrevLast ? CONNECTOR_LAST : CONNECTOR_MIDDLE;
  const label = format(node);
  const path =
    'path' in node && node.path ? `(${basename(dirname(node.path))}/${basename(node.path)})` : '';

  log(`${indent}${connector}${label} ${path}`.trimEnd());

  if ((node.type === 'HTML' || node.type === 'COMPONENT') && Array.isArray(node.children)) {
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

const printTree = (root: Component, options: FilterOptions = {}) => {
  const mergedOptions = { ...defaultOptions, ...options };

  if (mergedOptions.componentsOnly && mergedOptions.htmlOnly) {
    mergedOptions.componentsOnly = false;
    mergedOptions.htmlOnly = false;
  }

  const filteredRoot = filterNode(root, mergedOptions);

  print(filteredRoot);
};

const filterNode = (node: Component, options: FilterOptions, depth = 0): Component => {
  const allChildren = getFilteredChildren(node);

  const flattenChildren = (child: Component, depth: number): Component[] => {
    const children = getFilteredChildren(child);
    const shouldDisplay = shouldShow(child, options);
    const maxDepth = options?.depth ?? 0;

    if (child.type === 'COMPONENT' && !options.showPath) child.path = '';

    if ((maxDepth !== 0 && depth > maxDepth) || !shouldDisplay) {
      return children.flatMap(child => flattenChildren(child, depth + 1));
    }

    if (children.length > 0) {
      const flattened = children.flatMap(child => flattenChildren(child, depth + 1));

      if (child.type === 'HTML' || child.type === 'COMPONENT') {
        return [{ ...child, children: flattened }];
      }
    }

    return [child];
  };

  const filteredAllChildren = allChildren.flatMap(child => flattenChildren(child, depth + 1));

  if (node.type === 'HTML' || node.type === 'COMPONENT') node.children = filteredAllChildren;

  return node;
};

const getFilteredChildren = (node: Component) => {
  if (node.type === 'HTML' && node.children && node.children.length > 0) {
    return node.children;
  } else if (node.type === 'COMPONENT' && node.render) {
    return Array.isArray(node.render) ? node.render : [node.render];
  }
  return [];
};

const shouldShow = (node: Component, options: FilterOptions) => {
  const { componentsOnly, htmlOnly, showText, includeTags, excludeTags } = options;
  const { type } = node;
  const isTextType = type === 'TEXT' || type === 'EXPRESSION' || type === 'CHILDREN_PLACEHOLDER';

  if (isTextType) {
    return !!showText;
  }

  if (htmlOnly && type !== 'HTML') {
    return false;
  }

  if (componentsOnly && type !== 'COMPONENT') {
    return false;
  }

  if (includeTags && includeTags.length > 0) {
    if (!includeTags.includes(node.name)) {
      return false;
    }
  }

  if (excludeTags && excludeTags.length > 0) {
    if (excludeTags.includes(node.name)) {
      return false;
    }
  }

  return type === 'HTML' || type === 'COMPONENT' || true;
};

export default printTree;
