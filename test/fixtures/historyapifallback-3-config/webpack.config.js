"use strict";

module.exports = {
  mode: "development",
  context: __dirname,
  stats: "none",
  entry: "./foo.js",
  output: {
    path: "/",
  },
  module: {
    rules: [
      {
        test: /\.html$/,
        loader: "file-loader",
        options: { name: "index.html" },
      },
    ],
  },
  infrastructureLogging: {
    level: "warn",
  },
};
