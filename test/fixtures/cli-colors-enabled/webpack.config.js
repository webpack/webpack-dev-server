"use strict";

module.exports = {
  mode: "development",
  stats: {
    colors: true,
  },
  context: __dirname,
  entry: "./foo.js",
  infrastructureLogging: {
    colors: true,
  },
};
