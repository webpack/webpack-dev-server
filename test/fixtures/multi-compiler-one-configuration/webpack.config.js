import path from "node:path";
import { fileURLToPath } from "node:url";
import HTMLGeneratorPlugin from "../../helpers/html-generator-plugin.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default [
  {
    target: "web",
    mode: "development",
    context: __dirname,
    stats: "none",
    entry: "./foo.js",
    output: {
      path: "/",
    },
    node: false,
    infrastructureLogging: {
      level: "info",
      stream: {
        write: () => {},
      },
    },
    plugins: [new HTMLGeneratorPlugin()],
  },
];
