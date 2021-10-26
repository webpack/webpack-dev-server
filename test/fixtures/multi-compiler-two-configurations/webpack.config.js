"use strict";

const webpack = require("webpack");
const getHashFunction = require("../../helpers/getHashFunction");

const isWebpack5 = webpack.version.startsWith("5");

module.exports = [
  {
    target: "web",
    name: "one",
    mode: "development",
    context: __dirname,
    entry: "./one.js",
    stats: "none",
    output: {
      path: "/",
      filename: "one-[name].js",
      hashFunction: getHashFunction(),
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
    target: "web",
    name: "two",
    mode: "development",
    context: __dirname,
    entry: "./two.js",
    stats: "none",
    output: {
      path: "/",
      filename: "two-[name].js",
      hashFunction: getHashFunction(),
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
