import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));const moduleRuleForHTML = {
  test: /\.html$/,
  type: "asset/resource",
  generator: {
    filename: "[name][ext]",
  },
};

export default {
  mode: "development",
  context: __dirname,
  stats: "none",
  entry: "./foo.js",
  output: {
    path: "/",
  },
  module: {
    rules: [
      {
        ...moduleRuleForHTML,
      },
    ],
  },
  infrastructureLogging: {
    level: "warn",
  },
};
