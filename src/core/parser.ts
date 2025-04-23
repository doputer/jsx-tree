import traverse, { Node } from '@babel/traverse';
import * as type from '@babel/types';

export const getUsedComponents = (node: Node): string[] => {
  const components = new Set<string>();

  traverse(type.file(type.program([])), {
    Program: {
      enter() {
        type.traverseFast(node, child => {
          if (type.isJSXElement(child)) {
            const noed = child.openingElement.name;

            if (type.isJSXIdentifier(noed)) {
              components.add(noed.name);
            }
          }
        });
      },
    },
  });

  return [...components];
};
