import { defineConfig, globalIgnores } from "eslint/config";
import config from "eslint-config-webpack";
import configs from "eslint-config-webpack/configs.js";

export default defineConfig([
  globalIgnores([
    "client/**/*",
    "client-src/**/*",
    "examples/**/*",
    "examples/client/trusted-types-overlay/app.js",
  ]),
  {
    extends: [config],
    rules: {
      // TODO fix me
      "prefer-destructuring": "off",

      "jsdoc/require-property-description": "off",
    },
  },
  {
    files: ["test/**/*"],
    extends: [configs["browser/recommended"]],
    rules: {
      // TODO improve me in the default eslint configuration
      "import/extensions": "off",
      "jsdoc/check-tag-names": "off",

      "jsdoc/require-jsdoc": "off",
      "jsdoc/require-returns": "off",
      "jsdoc/require-param-description": "off",
      "jsdoc/require-param-type": "off",
      "jsdoc/require-property-description": "off",
      "jsdoc/require-returns-description": "off",
    },
  },
]);
