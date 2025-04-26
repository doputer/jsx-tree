import * as type from '@babel/types';

import type { ParseResult } from '@babel/parser';
import type { File } from '@babel/types';

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

export type Node = type.JSXElement | type.JSXFragment | null;
