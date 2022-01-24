"use strict";

const webpack = require("webpack");

const isWebpack5 = webpack.version.startsWith("5");

module.exports = [
  {
    name: "browser",
    mode: "development",
    context: __dirname,
    stats: "none",
    entry: "./browser.js",
    output: {
      path: "/",
      filename: "browser.js",
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
    name: "server",
    mode: "development",
    context: __dirname,
    target: "node",
    stats: "none",
    entry: "./server.js",
    output: {
      path: "/",
      filename: "server.js",
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
