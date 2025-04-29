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
  env: {
    node: true,
  },
};
