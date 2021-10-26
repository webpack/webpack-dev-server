"use strict";

const { version } = require("webpack");
const getHashFunction = require("../../helpers/getHashFunction");

let moduleRuleForHTML = {};

if (version.startsWith("5")) {
  moduleRuleForHTML = {
    test: /\.html$/,
    type: "asset/resource",
    generator: {
      filename: "index.html",
    },
  };
} else {
  moduleRuleForHTML = {
    test: /\.html$/,
    loader: "file-loader",
    options: { name: "index.html" },
  };
}

module.exports = {
  mode: "development",
  context: __dirname,
  stats: "none",
  entry: "./foo.js",
  output: {
    path: "/",
    hashFunction: getHashFunction(),
  },
  module: {
    rules: [
      {
        ...moduleRuleForHTML,
      },
    ],
  },
  infrastructureLogging: {
    level: "warn",
  },
};
