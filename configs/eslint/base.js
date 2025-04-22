const { resolve } = require('node:path');

const project = resolve(process.cwd(), 'tsconfig.json');
const { JAVASCRIPT_FILES, TYPESCRIPT_FILES } = require('./constant');

module.exports = {
  extends: ['plugin:prettier/recommended', 'eslint:recommended'],
  plugins: ['prettier'],
  rules: {
    'no-console': 'off',
    'prettier/prettier': [
      'error',
      {
        endOfLine: 'auto',
      },
    ],
  },
  overrides: [
    {
      files: TYPESCRIPT_FILES,
      parser: '@typescript-eslint/parser',
      extends: ['plugin:@typescript-eslint/recommended'],
      plugins: ['@typescript-eslint'],
      parserOptions: {
        project,
        ecmaVersion: 'latest',
        sourceType: 'module',
        tsconfigRootDir: __dirname,
      },
    },
    {
      files: JAVASCRIPT_FILES,
      parserOptions: {
        project: null,
        ecmaVersion: 'latest',
        sourceType: 'module',
      },
    },
  ],
  env: {
    node: true,
  },
};
