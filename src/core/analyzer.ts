import path from 'node:path';

import { getDefinedComponents, getImportMap } from '@/core/parser';
import { parseFile, readFileSync } from '@/utils/file';

const entryPath = path.resolve(__dirname, '../../example/index.jsx');

const analyzer = () => {
  const code = readFileSync(entryPath);
  const ast = parseFile(code);
  const components = getDefinedComponents(ast);
  const importMap = getImportMap(ast, entryPath);

  console.log(components);
  console.log(importMap);
};

export default analyzer;
