"use strict";

const { setup } = require("../../util");

module.exports = [
  setup({
    mode: "development",
    entry: "./client.js",
    output: {
      filename: "client.js",
    },
    context: __dirname,
  }),
  {
    mode: "development",
    target: "node",
    entry: "./server.js",
    output: {
      filename: "server.js",
    },
    context: __dirname,
    node: false,
  },
];
