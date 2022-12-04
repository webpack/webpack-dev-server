"use strict";

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
    infrastructureLogging: {
      level: "info",
      stream: {
        write: () => {},
      },
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
    infrastructureLogging: {
      level: "info",
      stream: {
        write: () => {},
      },
    },
  },
];
