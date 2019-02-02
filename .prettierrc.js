module.exports = {
  printWidth: 80,
  tabWidth: 2,
  singleQuote: true,
  trailingComma: 'es5',
  arrowParens: 'always',
  overrides: [
    {
      files: '*.json',
      options: {
        useTabs: false,
      },
    },
  ],
};
