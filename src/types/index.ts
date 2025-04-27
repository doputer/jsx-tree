import type { ParseResult } from '@babel/parser';
import type {
  File,
  JSXElement,
  JSXExpressionContainer,
  JSXFragment,
  JSXSpreadChild,
  JSXText,
} from '@babel/types';

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

export type Node =
  | JSXText
  | JSXElement
  | JSXFragment
  | JSXSpreadChild
  | JSXExpressionContainer
  | null;

export type Root = {
  type: string;
  components: Record<Name, Component>;
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
  // FIXME: COMPONENT의 children은 출력용이고, 기존 트리 구조에서 존재하지 않음
  children?: Component[];
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

export type FilterOptions = {
  componentsOnly?: boolean;
  htmlOnly?: boolean;
  showText?: boolean;
  showPath?: boolean;
  depth?: number;
};
