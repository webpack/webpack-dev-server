"use strict";

const HTMLGeneratorPlugin = require("../../helpers/html-generator-plugin");

module.exports = [
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
