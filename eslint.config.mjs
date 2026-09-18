import { defineConfig, globalIgnores } from "eslint/config";
import config from "eslint-config-webpack";
import configs from "eslint-config-webpack/configs.js";

export default defineConfig([
  globalIgnores(["client/**/*", "dist/**/*", "examples/**/*"]),
  {
    extends: [config],
    ignores: ["client-src/**/*", "!client-src/webpack.config.js"],
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
  {
    // `@changesets/get-github-info` is ESM-only and exposes itself through an
    // `exports` map with no `main`, which the import resolver cannot follow.
    files: [".changeset/changelog-generator.mjs"],
    rules: {
      "import/no-unresolved": "off",
    },
  },
]);
