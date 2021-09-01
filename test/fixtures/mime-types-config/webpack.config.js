"use strict";

const { version } = require("webpack");

let moduleRuleForCustom = {};

if (version.startsWith("5")) {
  moduleRuleForCustom = {
    test: /\.custom$/,
    type: "asset/resource",
    generator: {
      filename: "[name].[ext]",
    },
  };
} else {
  moduleRuleForCustom = {
    test: /\.custom$/,
    use: [
      {
        loader: "file-loader",
        options: {
          name() {
            return "[name].[ext]";
          },
        },
      },
    ],
  };
}

module.exports = {
  mode: "development",
  context: __dirname,
  stats: "none",
  entry: "./foo.js",
  output: {
    path: "/",
  },
  node: false,
  infrastructureLogging: {
    level: "warn",
  },
  module: {
    rules: [
      {
        ...moduleRuleForCustom,
      },
    ],
  },
};
