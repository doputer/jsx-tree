import {
  isIdentifier,
  isJSXElement,
  isJSXExpressionContainer,
  isJSXFragment,
  isJSXIdentifier,
  isJSXMemberExpression,
  isJSXText,
  JSXMemberExpression,
} from '@babel/types';

import type { Component, Definition, Key, Name, Node, Path, Root } from '@/types';

export const buildHierarchy = (
  sourcePath: Path,
  allDefinitions: Map<Key, Definition>,
  allImports: Map<Key, Path>,
) => {
  const tree: Root = {
    type: 'root',
    components: {},
  };

  for (const [name, definition] of allDefinitions) {
    // root에 정의되지 않은 컴포넌트는 처리하지 않음
    if (sourcePath !== definition.path) continue;

    tree.components[name] = {
      type: 'COMPONENT',
      name,
      path: definition.path,
      render: processNode(definition.node, allDefinitions, allImports),
    };
  }

  return tree;
};

// 컴포넌트의 내부 구조와 자식 컴포넌트를 처리하는 함수
const processNode = (
  node: Node,
  allDefinitions: Map<Key, Definition>,
  allImports: Map<Key, Path>,
): Component | null => {
  if (!node) return null;

  // JSX Text 처리
  if (isJSXText(node)) {
    const text = node.value.trim();

    if (text) {
      return {
        type: 'TEXT',
        value: `TEXT(${text})`,
      };
    }

    return null;
  }

  // JSX Expression 처리
  else if (isJSXExpressionContainer(node)) {
    const expression = node.expression;

    if (isIdentifier(expression) && expression.name === 'children') {
      return {
        type: 'CHILDREN_PLACEHOLDER',
        value: 'children',
      };
    } else {
      return {
        type: 'EXPRESSION',
        value: `EXPRESSION(${expression.type})`,
      };
    }
  }

  // JSX Element 처리
  const name = getJSXName(node);
  const basename = getJSXBaseName(name);
  const originPath = node.extra?.originPath;
  const destinationPath = allImports.get(`${originPath}::${basename}`);

  let definition: Definition | undefined;

  if (destinationPath) definition = allDefinitions.get(`${destinationPath}::${basename}`);
  else if (originPath) definition = allDefinitions.get(`${originPath}::${basename}`);

  if (definition) {
    const childComponents: Component[] = [];

    if ('children' in node && node.children) {
      for (const child of node.children) {
        const childComponent = processNode(child, allDefinitions, allImports);
        if (childComponent) childComponents.push(childComponent);
      }
    }

    let render = definition.node ? processNode(definition.node, allDefinitions, allImports) : null;

    // render 내부에 CHILDREN_PLACEHOLDER가 있을 경우, 실제 children으로 대체
    if (render && 'children' in render && Array.isArray(render.children)) {
      const idx = render.children.findIndex(item => item.type === 'CHILDREN_PLACEHOLDER');

      if (idx !== -1) {
        render = { ...render, children: [...render.children] };
        if (Array.isArray(render.children)) render.children.splice(idx, 1, ...childComponents);
      }
    }

    return {
      type: 'COMPONENT',
      name,
      path: definition.path,
      render,
    };
  }

  // HTML Element 처리
  const htmlNode: Component = {
    type: 'HTML',
    name,
    children: [],
  };

  if ('children' in node && node.children) {
    for (const child of node.children) {
      const childComponent = processNode(child, allDefinitions, allImports);
      if (childComponent) htmlNode.children.push(childComponent);
    }
  }

  return htmlNode;
};

const getJSXBaseName = (name: Name) => name.split('.').at(-1);

const getJSXName = (node: Node) => {
  if (isJSXFragment(node)) return 'Fragment';

  if (isJSXElement(node) && node.openingElement.name) {
    const nameNode = node.openingElement.name;

    // 일반 태그 (예: div, span, Component, ...)
    if (isJSXIdentifier(nameNode)) return nameNode.name;
    // 접근 표현식 (예: React.Component, ...)
    else if (isJSXMemberExpression(nameNode)) return getJSXMemberName(nameNode);
  }

  return 'Unknown';
};

const getJSXMemberName = (node: JSXMemberExpression): Name => {
  const object = node.object;
  const property = node.property;

  const component = isJSXIdentifier(object) ? object.name : getJSXMemberName(object);

  return `${component}.${property.name}`;
};
