import type { ParseResult } from '@babel/parser';
import type { File } from '@babel/types';

// type Brand<K, T> = K & { __brand: T };

export type AST = ParseResult<File>;

export type Component = string;

export type Path = string;

export type Key = `${Path}::${Component}`;

export type Definition = {
  name: Component;
  components: Component[];
};

export type Node = {
  name: Component;
  path: Path;
  internal?: true;
  children: Record<Component, Node>;
};

export type Link = [parentKey: Key, parentPath: Path, childName: Component];
