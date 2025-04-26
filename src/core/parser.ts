/* eslint-disable @typescript-eslint/no-explicit-any */

import traverse from '@babel/traverse';
import * as type from '@babel/types';

import type { AST, Component, Definition, Key, Node, Path } from '@/types';
import { parseFile, readFileSync } from '@/utils/file';
import { resolvePath } from '@/utils/path';

export const analyzeFile = (entry: Path) => {
  const analyzedFiles = new Set<Path>();
  const allDefinitions = new Map<Component, Definition>();

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
        if (type.isImportSpecifier(spec) || type.isImportDefaultSpecifier(spec)) {
          set.add(resolvedPath);
        }
      });
    },
  });

  return set;
};

const getDefinitions = (ast: AST, sourcePath: Path) => {
  const components = new Map<Component, Definition>();

  traverse(ast, {
    FunctionDeclaration(path) {
      const name = path.node.id?.name;
      if (name) {
        let node: Node = null;

        path.traverse({
          ReturnStatement(retPath) {
            const argument = retPath.node.argument;

            if (type.isJSXElement(argument) || type.isJSXFragment(argument)) {
              node = argument;
            }
          },
        });

        components.set(name, { name, path: sourcePath, node });
      }
    },
    VariableDeclarator(path) {
      const id = path.node.id;
      const name = type.isIdentifier(id) ? id.name : null;

      if (name) {
        const init = path.node.init;

        if (type.isArrowFunctionExpression(init) || type.isFunctionExpression(init)) {
          let node: Node = null;

          if (type.isJSXElement(init.body) || type.isJSXFragment(init.body)) {
            node = init.body;
          } else {
            path.traverse({
              ReturnStatement(retPath) {
                const argument = retPath.node.argument;

                if (type.isJSXElement(argument) || type.isJSXFragment(argument)) {
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

export const buildHierarchy = (sourcePath: Path, allDefinitions: Map<Component, Definition>) => {
  const tree = {
    type: 'root',
    components: {} as Record<Component, any>,
  };

  for (const [name, definition] of allDefinitions) {
    // root에 정의되지 않은 컴포넌트는 처리하지 않음
    if (sourcePath !== definition.path) continue;

    const key = `${definition.path}::${name}` as const;
    const processedComponents = new Set<Key>();

    processedComponents.add(key);

    tree.components[name] = {
      type: name,
      path: definition.path,
      children: processComponent(definition.node, allDefinitions, processedComponents),
    };
  }

  return tree;
};

// 컴포넌트의 내부 구조와 자식 컴포넌트를 처리하는 함수
export const processComponent = (
  node: Node,
  allDefinitions: Map<Component, Definition>,
  processedComponents: Set<Key>,
) => {
  if (!node) return null;

  const nodeName = getNodeName(node);
  const treeNode = {
    type: nodeName,
    children: [] as any[],
  };

  if ('children' in node && node.children) {
    for (const child of node.children) {
      // 텍스트 노드 처리
      if (type.isJSXText(child)) {
        const text = child.value.trim();

        if (text) {
          treeNode.children.push({ type: 'TEXT', value: text });
        }
      }

      // JSX 표현식 처리
      else if (type.isJSXExpressionContainer(child)) {
        const expression = child.expression;

        if (type.isIdentifier(expression) && expression.name === 'children') {
          treeNode.children.push({
            type: 'CHILDREN_PLACEHOLDER',
            value: 'children',
          });
        } else {
          treeNode.children.push({
            type: 'EXPRESSION',
            value: `EXPRESSION(${expression.type})`,
          });
        }
      }

      // 자식 JSX 요소 처리
      else if (type.isJSXElement(child)) {
        const childNodeName = getNodeName(child);
        const definition = allDefinitions.get(childNodeName);

        if (definition) {
          const key = `${definition.path}::${childNodeName}` as const;

          // if (processedComponents.has(key)) {
          //   treeNode.children.push({
          //     type: childNodeName,
          //     path: definition.path,
          //     isComponent: true,
          //     render: {
          //       type: 'CIRCULAR_REFERENCE',
          //       value: childNodeName,
          //     },
          //   });

          //   continue;
          // }

          const newProcessedComponents = new Set(processedComponents);
          newProcessedComponents.add(key);

          // 자식 컴포넌트의 자식 요소들 처리
          const childChildren = processComponent(child, allDefinitions, newProcessedComponents);

          // 컴포넌트 정의에서 렌더링 구조 가져오기
          let render = null;
          if (definition.node) {
            render = processComponent(definition.node, allDefinitions, newProcessedComponents);

            // children placeholder 찾아서 실제 자식으로 대체
            if (render) {
              const childrenIndex = render.children.findIndex(
                (item: any) => item.type === 'CHILDREN_PLACEHOLDER',
              );

              if (childrenIndex !== -1) {
                render = { ...render, children: [...render.children] };
                render.children.splice(childrenIndex, 1, ...(childChildren?.children || []));
              }
            }
          }

          treeNode.children.push({
            type: childNodeName,
            path: definition.path,
            isComponent: true,
            render,
          });
        }
        // 일반 HTML 요소
        else {
          const childNode = processComponent(child, allDefinitions, processedComponents);
          if (childNode) treeNode.children.push(childNode);
        }
      }
      // JSX Fragment
      else if (type.isJSXFragment(child)) {
        const childNode = processComponent(child, allDefinitions, processedComponents);
        if (childNode) treeNode.children.push(childNode);
      }
    }
  }

  return treeNode;
};

const getNodeName = (node: Node) => {
  if (type.isJSXFragment(node)) return 'Fragment';

  if (type.isJSXElement(node) && node.openingElement.name) {
    const nameNode = node.openingElement.name;

    // 일반 태그 (예: div, span, Component, ...)
    if (type.isJSXIdentifier(nameNode)) return nameNode.name;
    // 접근 표현식 (예: React.Component, ...)
    else if (type.isJSXMemberExpression(nameNode)) return getJSXMemberComponent(nameNode);
  }

  return 'Unknown';
};

const getJSXMemberComponent = (node: type.JSXMemberExpression): Component => {
  const object = node.object;
  const property = node.property;

  const component = type.isJSXIdentifier(object) ? object.name : getJSXMemberComponent(object);

  return `${component}.${property.name}`;
};
