"use strict";

const webpack = require("webpack");

const isWebpack5 = webpack.version.startsWith("5");

module.exports = [
  {
    name: "one",
    mode: "development",
    context: __dirname,
    entry: "./one.js",
    stats: "none",
    output: {
      path: "/",
      filename: "one-[name].js",
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
  },
  {
    name: "two",
    mode: "development",
    context: __dirname,
    entry: "./two.js",
    stats: "none",
    output: {
      path: "/",
      filename: "two-[name].js",
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
  },
];
