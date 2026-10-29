import path from "node:path";
import { fileURLToPath } from "node:url";
import HTMLGeneratorPlugin from "../../helpers/html-generator-plugin.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default {
  mode: "development",
  context: __dirname,
  entry: "./foo.js",
  stats: "none",
  output: {
    path: "/",
  },
  module: {
    rules: [
      {
        test: /\.css$/,
        use: [{ loader: "style-loader" }, { loader: "css-loader" }],
      },
    ],
  },
  infrastructureLogging: {
    level: "info",
    stream: {
      write: () => {},
    },
  },
  plugins: [new HTMLGeneratorPlugin()],
};
