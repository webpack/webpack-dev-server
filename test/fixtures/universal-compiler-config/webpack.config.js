"use strict";

module.exports = [
  {
    mode: "development",
    context: __dirname,
    stats: "none",
    entry: "./client.js",
    output: {
      path: "/",
      filename: "client.js",
    },
    infrastructureLogging: {
      level: "warn",
    },
  },
  {
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
      level: "warn",
    },
  },
];
