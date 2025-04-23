import path from 'node:path';

import { getUsedComponents } from '@/core/parser';
import { parseFile, readFileSync } from '@/utils/file';

const entryPath = path.resolve(__dirname, '../../example/index.jsx');

const analyzer = () => {
  const code = readFileSync(entryPath);
  const ast = parseFile(code);
  const components = getUsedComponents(ast);

  console.log(components);
};

export default analyzer;
