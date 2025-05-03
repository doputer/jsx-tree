import { dirname } from 'node:path';

import { createResolver } from '@/utils/resolver';

export const resolvePath = (path: string, request: string) => {
  try {
    return createResolver().resolveSync({}, dirname(path), request);
  } catch {
    return null;
  }
};
