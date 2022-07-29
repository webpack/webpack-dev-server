"use strict";

const webpack = require("webpack");
const HTMLGeneratorPlugin = require("../../helpers/trusted-types-html-generator-plugin");

const isWebpack5 = webpack.version.startsWith("5");

module.exports = {
  mode: "development",
  context: __dirname,
  stats: "none",
  entry: "./foo.js",
  output: {
    path: "/",
    trustedTypes: { policyName: "webpack" },
  },
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
};
