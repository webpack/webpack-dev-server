"use strict";

module.exports = {
  extends: ["webpack", "prettier"],
  parser: "@babel/eslint-parser",
  parserOptions: {
    sourceType: "script",
    ecmaVersion: 2018,
  },
  env: {
    node: true,
    es6: true,
  },
  rules: {
    curly: "error",
    "consistent-return": "off",
    "no-param-reassign": "off",
    "no-underscore-dangle": "off",
    "prefer-destructuring": ["error", { object: false, array: false }],
    "prefer-rest-params": "off",
    strict: ["error", "safe"],
    "global-require": "off",
  },
  overrides: [
    {
      files: ["client-src/**/*.js"],
      excludedFiles: [
        "client-src/webpack.config.js",
        "client-src/modules/logger/SyncBailHookFake.js",
      ],
      parserOptions: {
        sourceType: "module",
        allowImportExportEverywhere: true,
      },
      env: {
        browser: true,
      },
      rules: {
        "import/extensions": ["error", "always"],
      },
    },
    {
      files: ["test/**/*.js"],
      rules: {
        "no-console": "off",
      },
    },
    {
      files: [
        "test/client/**/*.js",
        "test/e2e/**/*.js",
        "test/fixtures/**/*.js",
        "test/server/liveReload-option.test.js",
      ],
      env: {
        browser: true,
        node: true,
      },
    },
    {
      files: ["examples/**/*.js"],
      env: {
        browser: true,
      },
      rules: {
        "no-console": "off",
      },
    },
  ],
};
