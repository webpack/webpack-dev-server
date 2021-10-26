"use strict";

const webpack = require("webpack");
const getHashFunction = require("../../helpers/getHashFunction");

const isWebpack5 = webpack.version.startsWith("5");

module.exports = {
  mode: "development",
  context: __dirname,
  entry: "./foo.js",
  stats: "none",
  output: {
    path: "/",
    hashFunction: getHashFunction(),
  },
  module: {
    rules: [
      {
        test: /\.css$/,
        use: [{ loader: "style-loader" }, { loader: "css-loader" }],
      },
    ],
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
};
