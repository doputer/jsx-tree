import traverseCJS from '@babel/traverse';
import {
  isArrowFunctionExpression,
  isFunctionExpression,
  isIdentifier,
  isImportDefaultSpecifier,
  isImportNamespaceSpecifier,
  isImportSpecifier,
  isJSXElement,
  isJSXFragment,
} from '@babel/types';

import type { AST, Definition, Key, Name, Node, Path } from '@/types';
import { parseFile, readFileSync } from '@/utils/file';
import { resolvePath } from '@/utils/path';

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-expect-error
const traverse = traverseCJS.default as typeof traverseCJS;

export const analyzeFile = (entry: Path) => {
  const analyzedFiles = new Set<Path>();
  const allImports = new Map<Key, Path>();
  const allDefinitions = new Map<Key, Definition>();

  const traverseFile = (path: Path) => {
    if (analyzedFiles.has(path)) return;

    try {
      const code = readFileSync(path);
      const ast = parseFile(code);
      const { set: importPaths, map: importMaps } = getImportPaths(ast, path);
      const definitions = getDefinitions(ast, path);

      analyzedFiles.add(path);

      importMaps.forEach((value, key) => allImports.set(key, value));
      definitions.forEach((component, name) => allDefinitions.set(`${path}::${name}`, component));

      for (const importPath of importPaths) {
        traverseFile(importPath);
      }
    } catch (error) {
      console.log(error);

      console.error('Failed to analyze', path);
    }
  };

  traverseFile(entry);

  return { allImports, allDefinitions };
};

const getImportPaths = (ast: AST, currentPath: Path) => {
  const set = new Set<Path>();
  const map = new Map<Key, Path>();

  traverse(ast, {
    ImportDeclaration({ node }) {
      const importSource = node.source.value;
      const resolvedPath = resolvePath(currentPath, importSource);

      if (!resolvedPath) return;

      node.specifiers.forEach(spec => {
        if (
          isImportSpecifier(spec) ||
          isImportDefaultSpecifier(spec) ||
          isImportNamespaceSpecifier(spec)
        ) {
          set.add(resolvedPath);

          // Import Origin :: Import Name -> Import Destination
          map.set(`${currentPath}::${spec.local.name}`, resolvedPath);
        }
      });
    },
    ExportNamedDeclaration({ node }) {
      if (!node.source) return;

      const exportSource = node.source.value;
      const resolvedPath = resolvePath(currentPath, exportSource);

      if (resolvedPath) {
        set.add(resolvedPath);
      }
    },
    ExportAllDeclaration({ node }) {
      const exportSource = node.source.value;
      const resolvedPath = resolvePath(currentPath, exportSource);

      if (resolvedPath) {
        set.add(resolvedPath);
      }
    },
  });

  return { set, map };
};

const getDefinitions = (ast: AST, sourcePath: Path) => {
  const components = new Map<Name, Definition>();

  traverse(ast, {
    JSXElement(path) {
      path.node.extra = { ...(path.node.extra || {}), originPath: sourcePath };
    },
    JSXFragment(path) {
      path.node.extra = { ...(path.node.extra || {}), originPath: sourcePath };
    },
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
