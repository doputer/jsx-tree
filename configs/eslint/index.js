module.exports = {
  extends: [
    ...['./base.js', './javascript.js', './typescript.js', './import.js'].map(require.resolve),
  ],
};
