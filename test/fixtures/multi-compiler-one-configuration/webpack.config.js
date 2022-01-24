"use strict";

const webpack = require("webpack");
const HTMLGeneratorPlugin = require("../../helpers/html-generator-plugin");

const isWebpack5 = webpack.version.startsWith("5");

module.exports = [
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
    infrastructureLogging: isWebpack5
      ? {
          level: "info",
          stream: {
            write: () => {},
          },
        }
      : {
          level: "info",
        },
    plugins: [new HTMLGeneratorPlugin()],
  },
];
