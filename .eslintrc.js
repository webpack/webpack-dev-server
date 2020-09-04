'use strict';

module.exports = {
  extends: ['webpack', 'prettier'],
  globals: {
    document: true,
    window: true,
  },
  parserOptions: {
    sourceType: 'script',
    ecmaVersion: 10,
  },
  rules: {
    curly: 'error',
    'consistent-return': 'off',
    'no-param-reassign': 'off',
    'no-underscore-dangle': 'off',
    'prefer-destructuring': ['error', { object: false, array: false }],
    'prefer-rest-params': 'off',
    strict: ['error', 'safe'],
    'global-require': 'off',
  },
  overrides: [
    {
      files: ['test/**/*.js'],
      rules: {
        'no-console': 'off',
      },
    },
    {
      files: ['examples/**/*.js'],
      env: {
        browser: true,
      },
      rules: {
        'no-console': 'off',
      },
    },
  ],
};
