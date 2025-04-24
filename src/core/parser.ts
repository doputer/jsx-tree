import traverse, { Node } from '@babel/traverse';
import * as type from '@babel/types';

import type { AST, Component, Definition, Path } from '@/types';
import { resolvePath } from '@/utils/path';

const getUsedComponents = (node: Node) => {
  const components = new Set<Component>();

  traverse(type.file(type.program([])), {
    Program: {
      enter() {
        type.traverseFast(node, child => {
          if (type.isJSXElement(child)) {
            const node = child.openingElement.name;

            if (type.isJSXIdentifier(node)) {
              components.add(node.name);
            } else if (type.isJSXMemberExpression(node)) {
              components.add(getJSXMemberComponent(node));
            }
          }
        });
      },
    },
  });

  return [...components];
};

const getJSXMemberComponent = (node: type.JSXMemberExpression): Component => {
  const object = node.object;
  const property = node.property;

  const component = type.isJSXIdentifier(object) ? object.name : getJSXMemberComponent(object);

  return `${component}.${property.name}`;
};

export const getDefinedComponents = (ast: AST) => {
  const definitions: Definition[] = [];

  traverse(ast, {
    FunctionDeclaration({ node }) {
      if (node.id?.name) {
        const name = node.id.name;
        const components = getUsedComponents(node.body);

        definitions.push({ name, components });
      }
    },
    VariableDeclaration({ node }) {
      node.declarations.forEach(decl => {
        if (
          type.isIdentifier(decl.id) &&
          decl.init &&
          (type.isArrowFunctionExpression(decl.init) || type.isFunctionExpression(decl.init))
        ) {
          const name = decl.id.name;
          const components = getUsedComponents(decl.init.body);

          definitions.push({ name, components });
        }
      });
    },
  });

  return definitions;
};

export const getImportMap = (ast: AST, currentPath: Path) => {
  const map = new Map<Component, Path>();

  traverse(ast, {
    ImportDeclaration({ node }) {
      const importSource = node.source.value;
      const resolvedPath = resolvePath(currentPath, importSource);

      if (!resolvedPath) return;

      node.specifiers.forEach(spec => {
        if (type.isImportSpecifier(spec) || type.isImportDefaultSpecifier(spec)) {
          map.set(spec.local.name, resolvedPath);
        }
      });
    },
  });

  return map;
};
