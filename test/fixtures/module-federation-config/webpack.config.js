"use strict";

const getHashFunction = require("../../helpers/getHashFunction");

module.exports = {
  mode: "development",
  target: "node",
  stats: "none",
  context: __dirname,
  entry: ["./entry1.js", "./entry2.js"],
  output: {
    path: "/",
    libraryTarget: "umd",
    hashFunction: getHashFunction(),
  },
  infrastructureLogging: {
    level: "warn",
  },
};
