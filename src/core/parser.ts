import traverse from '@babel/traverse';
import {
  isArrowFunctionExpression,
  isFunctionExpression,
  isIdentifier,
  isImportDefaultSpecifier,
  isImportSpecifier,
  isJSXElement,
  isJSXExpressionContainer,
  isJSXFragment,
  isJSXIdentifier,
  isJSXMemberExpression,
  isJSXText,
  JSXMemberExpression,
} from '@babel/types';

import type { AST, Component, Definition, Name, Node, Path, Root } from '@/types';
import { parseFile, readFileSync } from '@/utils/file';
import { resolvePath } from '@/utils/path';

export const analyzeFile = (entry: Path) => {
  const analyzedFiles = new Set<Path>();
  const allDefinitions = new Map<Name, Definition>();

  const traverseFile = (path: Path) => {
    if (analyzedFiles.has(path)) return;

    try {
      const code = readFileSync(path);
      const ast = parseFile(code);
      const importPaths = getImportPaths(ast, path);
      const definitions = getDefinitions(ast, path);

      analyzedFiles.add(path);

      definitions.forEach((component, name) => {
        allDefinitions.set(name, component);
      });

      for (const importPath of importPaths) {
        traverseFile(importPath);
      }
    } catch {
      console.error('Failed to analyze', path);
    }
  };

  traverseFile(entry);

  return allDefinitions;
};

const getImportPaths = (ast: AST, currentPath: Path) => {
  const set = new Set<Path>();

  traverse(ast, {
    ImportDeclaration({ node }) {
      const importSource = node.source.value;
      const resolvedPath = resolvePath(currentPath, importSource);

      if (!resolvedPath) return;

      node.specifiers.forEach(spec => {
        if (isImportSpecifier(spec) || isImportDefaultSpecifier(spec)) {
          set.add(resolvedPath);
        }
      });
    },
  });

  return set;
};

const getDefinitions = (ast: AST, sourcePath: Path) => {
  const components = new Map<Name, Definition>();

  traverse(ast, {
    FunctionDeclaration(path) {
      const name = path.node.id?.name;

      if (name) {
        let node: Node = null;

        path.traverse({
          ReturnStatement(retPath) {
            const argument = retPath.node.argument;

            if (isJSXElement(argument) || isJSXFragment(argument)) {
              node = argument;
            }
          },
        });

        components.set(name, { name, path: sourcePath, node });
      }
    },
    VariableDeclarator(path) {
      const id = path.node.id;
      const name = isIdentifier(id) ? id.name : null;

      if (name) {
        const init = path.node.init;

        if (isArrowFunctionExpression(init) || isFunctionExpression(init)) {
          let node: Node = null;

          if (isJSXElement(init.body) || isJSXFragment(init.body)) {
            node = init.body;
          } else {
            path.traverse({
              ReturnStatement(retPath) {
                const argument = retPath.node.argument;

                if (isJSXElement(argument) || isJSXFragment(argument)) {
                  node = argument;
                }
              },
            });
          }

          components.set(name, { name, path: sourcePath, node });
        }
      }
    },
  });

  return components;
};

export const buildHierarchy = (sourcePath: Path, allDefinitions: Map<Name, Definition>) => {
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
      render: processNode(definition.node, allDefinitions),
    };
  }

  return tree;
};

// 컴포넌트의 내부 구조와 자식 컴포넌트를 처리하는 함수
const processNode = (node: Node, allDefinitions: Map<Name, Definition>): Component | null => {
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
  const definition = allDefinitions.get(name);

  if (definition) {
    const childComponents: Component[] = [];

    if ('children' in node && node.children) {
      for (const child of node.children) {
        const childComponent = processNode(child, allDefinitions);
        if (childComponent) childComponents.push(childComponent);
      }
    }

    let render = definition.node ? processNode(definition.node, allDefinitions) : null;

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
      const childComponent = processNode(child, allDefinitions);
      if (childComponent) htmlNode.children.push(childComponent);
    }
  }

  return htmlNode;
};

export const getJSXName = (node: Node) => {
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
