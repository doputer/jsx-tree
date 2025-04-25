import traverse from '@babel/traverse';
import * as type from '@babel/types';

import { getImportMap } from '@/core/parser';
import { AST, Component, Path } from '@/types';
import { parseFile, readFileSync } from '@/utils/file';

type Node = type.JSXElement | type.JSXFragment | null;

type Definition = {
  name: Component;
  path: Path;
  node: Node;
};

const analyzer = (entry: Path) => {
  const analyzedFiles = new Map<Path, Record<Component, Definition>>();
  const allDefinitions: Record<Component, Definition> = {};

  analyzeFile(entry, analyzedFiles, allDefinitions);

  console.log(allDefinitions);
};

const analyzeFile = (
  path: Path,
  analyzedFiles: Map<Path, Record<Component, Definition>>,
  allDefinitions: Record<Component, Definition>,
) => {
  if (analyzedFiles.has(path)) return analyzedFiles.get(path) || {};

  try {
    const code = readFileSync(path);
    const ast = parseFile(code);
    const importMap = getImportMap(ast, path);
    const definitions = getDefinitions(ast, path);

    Object.entries(definitions).forEach(([name, component]) => {
      allDefinitions[name] = component;
    });

    for (const importPath of importMap.values()) {
      if (analyzedFiles.has(importPath)) continue;

      analyzeFile(importPath, analyzedFiles, allDefinitions);
    }

    return allDefinitions;
  } catch {
    return {};
  }
};

const getDefinitions = (ast: AST, sourcePath: Path) => {
  const components: Record<Component, Definition> = {};

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

        components[name] = { name, path: sourcePath, node };
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

          components[name] = { name, path: sourcePath, node };
        }
      }
    },
  });

  return components;
};

export default analyzer;
