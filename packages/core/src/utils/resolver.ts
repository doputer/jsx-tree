import fs from 'node:fs';
import path from 'node:path';

import enhancedResolve from 'enhanced-resolve';
import { loadConfig } from 'tsconfig-paths';

const { ResolverFactory, CachedInputFileSystem } = enhancedResolve;

let resolverInstance: ReturnType<typeof ResolverFactory.createResolver> | null = null;

export const createResolver = () => {
  if (resolverInstance) return resolverInstance;

  const tsconfig = loadConfig();

  if (tsconfig.resultType === 'failed') {
    throw new Error('Failed to load tsconfig');
  }

  const { absoluteBaseUrl, paths } = tsconfig;

  const alias = Object.fromEntries(
    Object.entries(paths).map(([key, [value]]) => [key, path.resolve(absoluteBaseUrl, value)]),
  );

  const resolver = ResolverFactory.createResolver({
    extensions: ['.js', '.jsx', '.ts', '.tsx'],
    fileSystem: new CachedInputFileSystem(fs, 4000),
    useSyncFileSystemCalls: true,
    alias,
  });

  resolverInstance = resolver;

  return resolverInstance;
};
