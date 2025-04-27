import {
  jsxClosingFragment,
  jsxElement,
  jsxFragment,
  jsxIdentifier,
  jsxMemberExpression,
  jsxOpeningElement,
  jsxOpeningFragment,
} from '@babel/types';

export const createFragmentNode = () => {
  const node = jsxFragment(jsxOpeningFragment(), jsxClosingFragment(), []);

  return node;
};

export const createHTMLElementNode = (name: string) => {
  const node = jsxElement(jsxOpeningElement(jsxIdentifier(name), []), null, []);

  return node;
};

export const createJSXMemberExpressionNode = (object: string, property: string) => {
  const node = jsxElement(
    jsxOpeningElement(jsxMemberExpression(jsxIdentifier(object), jsxIdentifier(property)), []),
    null,
    [],
  );

  return node;
};
