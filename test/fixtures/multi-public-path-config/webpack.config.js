import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const moduleRuleForHTML = {
  test: /\.html$/,
  type: "asset/resource",
  generator: {
    filename: "path/to/file.html",
  },
};

export default [
  {
    mode: "development",
    context: __dirname,
    stats: "none",
    entry: "./foo.js",
    output: {
      path: __dirname,
      filename: "foo.js",
      publicPath: "/bundle1/",
    },
    infrastructureLogging: {
      level: "warn",
    },
    module: {
      rules: [
        {
          ...moduleRuleForHTML,
        },
      ],
    },
  },
  {
    mode: "development",
    context: __dirname,
    stats: "none",
    entry: "./bar.js",
    output: {
      path: path.join(__dirname, "named"),
      filename: "bar.js",
      publicPath: "/bundle2/",
    },
    name: "named",
    infrastructureLogging: {
      level: "warn",
    },
  },
  {
    mode: "development",
    context: __dirname,
    entry: "./bar.js",
    output: {
      path: path.join(__dirname, "dist"),
      filename: "bar.js",
      publicPath: "auto",
    },
    name: "other",
    stats: false,
  },
];
