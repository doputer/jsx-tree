import fs from 'node:fs';

import { parse } from '@babel/parser';

export const readFileSync = (path: string) => {
  return fs.readFileSync(path, 'utf-8');
};

export const parseFile = (file: string) => {
  return parse(file, { sourceType: 'module', plugins: ['jsx'] });
};
