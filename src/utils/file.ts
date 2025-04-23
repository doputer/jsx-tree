import fs from 'node:fs';
import { dirname } from 'node:path';

import { parse } from '@babel/parser';
import { CachedInputFileSystem, ResolverFactory } from 'enhanced-resolve';

export const readFileSync = (path: string) => {
  return fs.readFileSync(path, 'utf-8');
};

export const parseFile = (file: string) => {
  return parse(file, { sourceType: 'module', plugins: ['jsx'] });
};

const resolver = ResolverFactory.createResolver({
  extensions: ['.jsx'],
  fileSystem: new CachedInputFileSystem(fs, 4000),
  useSyncFileSystemCalls: true,
});

export const resolvePath = (path: string, request: string) => {
  try {
    return resolver.resolveSync({}, dirname(path), request);
  } catch {
    return null;
  }
};
