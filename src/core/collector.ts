import traverse from '@babel/traverse';
import {
  isArrowFunctionExpression,
  isFunctionExpression,
  isIdentifier,
  isImportDefaultSpecifier,
  isImportSpecifier,
  isJSXElement,
  isJSXFragment,
} from '@babel/types';

import type { AST, Definition, Name, Node, Path } from '@/types';
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
