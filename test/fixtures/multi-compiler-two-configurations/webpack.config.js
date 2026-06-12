import path from "node:path";
import { fileURLToPath } from "node:url";
import HTMLGeneratorPlugin from "../../helpers/html-generator-plugin.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default [
  {
    target: "web",
    name: "one",
    mode: "development",
    context: __dirname,
    entry: "./one.js",
    stats: "none",
    output: {
      path: "/",
      filename: "one-[name].js",
    },
    plugins: [new HTMLGeneratorPlugin()],
    infrastructureLogging: {
      level: "info",
      stream: {
        write: () => {},
      },
    },
  },
  {
    target: "web",
    name: "two",
    mode: "development",
    context: __dirname,
    entry: "./two.js",
    stats: "none",
    output: {
      path: "/",
      filename: "two-[name].js",
    },
    plugins: [new HTMLGeneratorPlugin()],
    infrastructureLogging: {
      level: "info",
      stream: {
        write: () => {},
      },
    },
  },
];
