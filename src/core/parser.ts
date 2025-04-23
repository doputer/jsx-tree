import traverse, { Node } from '@babel/traverse';
import * as type from '@babel/types';

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
