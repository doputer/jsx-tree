import type { ParseResult } from '@babel/parser';
import type { File, JSXElement, JSXFragment } from '@babel/types';

// type Brand<K, T> = K & { __brand: T };

export type AST = ParseResult<File>;

export type Name = string;

export type Path = string;

export type Key = `${Path}::${Name}`;

export type Definition = {
  name: Name;
  path: Path;
  node: Node;
};

export type Node = JSXElement | JSXFragment | null;

export type Root = {
  type: string;
  components: Record<Name, Component | null>;
};

export type Component = HtmlNode | ComponentNode | TextNode | PlaceholderNode | ExpressionNode;

type HtmlNode = {
  type: 'HTML';
  name: Name;
  children: Component[];
};

type ComponentNode = {
  type: 'COMPONENT';
  name: Name;
  path: Path;
  render: Component | null;
};

type TextNode = {
  type: 'TEXT';
  value: string;
};

type PlaceholderNode = {
  type: 'CHILDREN_PLACEHOLDER';
  value: 'children';
};

type ExpressionNode = {
  type: 'EXPRESSION';
  value: string;
};

// type CircularReferenceNode = {
//   type: 'CIRCULAR_REFERENCE';
//   value: string;
// };
