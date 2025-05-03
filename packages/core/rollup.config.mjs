import { createRequire } from 'node:module';

import resolve from '@rollup/plugin-node-resolve';
import typescript from '@rollup/plugin-typescript';

const require = createRequire(import.meta.url);
const pkg = require('./package.json');

export default {
  input: 'src/index.ts',
  output: { file: 'dist/index.js', format: 'esm' },
  plugins: [resolve(), typescript()],
  external: [...Object.keys(pkg.dependencies || {})],
};
