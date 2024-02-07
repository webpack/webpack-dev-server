"use strict";

const { resolve } = require("path");

module.exports = {
  mode: "development",
  stats: "detailed",
  context: __dirname,
  entry: {
    foo: resolve(__dirname, "./foo.js"),
    bar: resolve(__dirname, "./bar.js"),
  },
};
