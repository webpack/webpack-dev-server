import { defineConfig } from "eslint/config";
import config from "eslint-config-webpack";

export default defineConfig([
    {
        ignores: ["client/**/*", "types/**/*", "examples/**/main.js", "examples/client/trusted-types-overlay/app.js"]
    },
    {
        extends: [config],
    },
    {
        files: ["test/**/*"],
        rules: {
            "jsdoc/require-jsdoc": "off",
            "jsdoc/require-returns": "off",
            "jsdoc/require-param-description": "off",
            "jsdoc/require-param-type": "off",
            "jsdoc/require-property-description": "off",
            "jsdoc/require-returns-description": "off",
        }
    }
]);
