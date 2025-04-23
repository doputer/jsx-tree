import type { ParseResult } from '@babel/parser';
import type { File } from '@babel/types';

// type Brand<K, T> = K & { __brand: T };

export type AST = ParseResult<File>;

export type Component = string;

export type Path = string;

export type Definition = { name: Component; components: Component[] };
