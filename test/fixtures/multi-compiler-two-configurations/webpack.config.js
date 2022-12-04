"use strict";

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
    },
    infrastructureLogging: {
      level: "info",
      stream: {
        write: () => {},
      },
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
    },
    infrastructureLogging: {
      level: "info",
      stream: {
        write: () => {},
      },
    },
  },
];
