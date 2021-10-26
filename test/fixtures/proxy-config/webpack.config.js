"use strict";

const getHashFunction = require("../../helpers/getHashFunction");

module.exports = {
  mode: "development",
  context: __dirname,
  stats: "none",
  entry: "./foo.js",
  output: {
    path: "/",
    hashFunction: getHashFunction(),
  },
  infrastructureLogging: {
    level: "warn",
  },
};
