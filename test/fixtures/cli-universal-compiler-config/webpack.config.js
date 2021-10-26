"use strict";

const ExitOnDonePlugin = require("../../helpers/ExitOnDonePlugin");
const getHashFunction = require("../../helpers/getHashFunction");

module.exports = [
  {
    mode: "development",
    context: __dirname,
    stats: "none",
    entry: "./client.js",
    output: {
      path: "/",
      filename: "client.js",
      hashFunction: getHashFunction(),
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
      hashFunction: getHashFunction(),
    },
    plugins: [new ExitOnDonePlugin()],
  },
];
