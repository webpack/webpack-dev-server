import { defineConfig, globalIgnores } from "eslint/config";
import config from "eslint-config-webpack";
import configs from "eslint-config-webpack/configs.js";

export default defineConfig([
  globalIgnores(["client/**/*", "examples/**/*"]),
  {
    extends: [config],
    ignores: ["client-src/**/*", "!client-src/webpack.config.js"],
    languageOptions: {
      // ES2025 needed for import attributes (`import(x, { with: ... })`).
      // eslint-config-webpack pins ecmaVersion to 2024 for Node 22.
      ecmaVersion: "latest",
    },
    rules: {
      // TODO fix me
      "prefer-destructuring": "off",
      "jsdoc/require-property-description": "off",
    },
  },
  {
    files: ["client-src/**/*"],
    ignores: ["client-src/webpack.config.js"],
    extends: [configs["browser-outdated-recommended"]],
  },
  {
    files: ["test/**/*"],
    extends: [configs["universal-recommended"]],
    rules: {
      // Tests use experimental node:test APIs intentionally
      // (mock.module, mock.timers, snapshot.*). The package's engines field
      // is wider than where these are stable, so silence the linter here.
      "n/no-unsupported-features/node-builtins": "off",
      // Test callbacks (it/test/subtest arrow functions) don't need JSDoc.
      "jsdoc/require-jsdoc": "off",
      // Tests legitimately log diagnostics (retry attempts, etc.).
      "no-console": "off",
      // node:test callbacks receive `t` (TestContext) as a parameter.
      "id-length": "off",
    },
  },
  {
    files: ["scripts/node-test-setup.mjs", "scripts/run-tests.mjs"],
    rules: {
      "n/no-unsupported-features/node-builtins": "off",
    },
  },
]);
