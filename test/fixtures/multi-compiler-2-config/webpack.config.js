"use strict";

module.exports = [
  {
    mode: "development",
    context: __dirname,
    entry: "./foo.js",
    output: {
      path: "/",
    },
    node: false,
    infrastructureLogging: {
      level: "warn",
    },
  },
  {
    mode: "development",
    context: __dirname,
    entry: "./foo.js",
    output: {
      path: "/",
    },
    node: false,
    infrastructureLogging: {
      level: "warn",
    },
  },
];
