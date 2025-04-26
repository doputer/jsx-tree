import type { ParseResult } from '@babel/parser';
import type { File, JSXElement, JSXFragment } from '@babel/types';

// type Brand<K, T> = K & { __brand: T };

export type AST = ParseResult<File>;

export type Name = string;

export type Path = string;

export type Key = `${Path}::${Name}`;

export type Definition = {
  name: Name;
  path?: Path;
  node: Node;
};

export type Node = JSXElement | JSXFragment | null;

export type Root = {
  type: string;
  components: Record<Name, Component | null>;
};

export type Tree = {
  type: string;
  path?: Path;
  children: Component[];
};

export type Component = {
  type: string;
  path?: Path;
  children?: Component[];
  isComponent?: boolean;
  render?: Component | null;
  value?: string;
};
