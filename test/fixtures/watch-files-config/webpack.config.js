import path from "node:path";
import { fileURLToPath } from "node:url";
import HTMLGeneratorPlugin from "../../helpers/html-generator-plugin.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default {
  mode: "development",
  devtool: false,
  context: __dirname,
  stats: "none",
  entry: "./foo.js",
  output: {
    publicPath: "/",
  },
  infrastructureLogging: {
    level: "warn",
  },
  plugins: [new HTMLGeneratorPlugin()],
};
