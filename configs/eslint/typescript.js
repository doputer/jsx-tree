const { resolve } = require('node:path');

const project = resolve(process.cwd(), 'tsconfig.json');
const { TYPESCRIPT_FILES } = require('./constant');

module.exports = {
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
  ],
};
