"use strict";

const HTMLGeneratorPlugin = require("../../helpers/html-generator-plugin");

module.exports = {
  devtool: "eval-nosources-cheap-source-map",
  mode: "development",
  context: __dirname,
  stats: "none",
  entry: "./foo.js",
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
};
