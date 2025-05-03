import { createRequire } from 'node:module';

import commonjs from '@rollup/plugin-commonjs';
import json from '@rollup/plugin-json';
import resolve from '@rollup/plugin-node-resolve';
import typescript from '@rollup/plugin-typescript';

const require = createRequire(import.meta.url);
const pkg = require('./package.json');

export default {
  input: 'src/lib/analyzer.ts',
  output: { file: 'dist/index.js', format: 'esm', banner: '#!/usr/bin/env node' },
  plugins: [commonjs(), json(), resolve(), typescript()],
  external: [...Object.keys(pkg.dependencies || {})],
};
