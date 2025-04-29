const { JAVASCRIPT_FILES } = require('./constant');

module.exports = {
  overrides: [
    {
      files: JAVASCRIPT_FILES,
      parserOptions: {
        project: null,
        ecmaVersion: 'latest',
        sourceType: 'module',
      },
    },
  ],
};
