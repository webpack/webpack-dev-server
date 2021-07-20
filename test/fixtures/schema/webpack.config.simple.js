"use strict";

module.exports = {
  mode: "development",
  context: __dirname,
  entry: "./foo.js",
  output: {
    path: "/",
  },
  infrastructureLogging: {
    level: "warn",
  },
};
