'use strict';

module.exports = {
  extends: ['webpack', 'prettier'],
  parserOptions: {
    sourceType: 'script',
    ecmaVersion: 2018
  },
  env: {
    node: true,
    es6: true
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
      files: ['client-src/**/*.js'],
      env: {
        browser: true,
      },
    },
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
