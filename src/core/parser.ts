import { ParseResult } from '@babel/parser';
import traverse, { Node } from '@babel/traverse';
import * as type from '@babel/types';

import { resolvePath } from '@/utils/file';

export const getUsedComponents = (node: Node): string[] => {
  const components = new Set<string>();

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

const getJSXMemberComponent = (node: type.JSXMemberExpression): string => {
  const object = node.object;
  const property = node.property;

  const component = type.isJSXIdentifier(object) ? object.name : getJSXMemberComponent(object);

  return `${component}.${property.name}`;
};

export const getDefinedComponents = (ast: ParseResult<type.File>) => {
  const definitions: { name: string; components: string[] }[] = [];

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

export const getImportMap = (ast: ParseResult<type.File>, currentPath: string) => {
  const map = new Map<string, string>();

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
