import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const moduleRuleForCustom = {
  test: /\.custom$/,
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
  node: false,
  infrastructureLogging: {
    level: "warn",
  },
  module: {
    rules: [
      {
        ...moduleRuleForCustom,
      },
    ],
  },
};
