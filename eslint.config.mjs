import { defineConfig, globalIgnores } from "eslint/config";
import config from "eslint-config-webpack";
import configs from "eslint-config-webpack/configs.js";

export default defineConfig([
  globalIgnores(["client/**/*", "examples/**/*"]),
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
  },
]);
