import path from "node:path";
import { fileURLToPath } from "node:url";
import HTMLGeneratorPlugin from "../../helpers/html-generator-plugin.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default [
  {
    name: "app",
    dependencies: ["worker"],
    devtool: false,
    target: "web",
    entry: "./index.js",
    mode: "development",
    context: __dirname,
    stats: "none",
    output: {
      path: "/",
    },
    infrastructureLogging: {
      level: "info",
      stream: {
        write: () => {},
      },
    },
    plugins: [new HTMLGeneratorPlugin()],
  },
  {
    name: "worker",
    devtool: false,
    target: "webworker",
    entry: "./worker.js",
    mode: "development",
    context: __dirname,
    stats: "none",
    output: {
      path: "/",
      filename: "worker.js",
    },
    infrastructureLogging: {
      level: "info",
      stream: {
        write: () => {},
      },
    },
  },
];
