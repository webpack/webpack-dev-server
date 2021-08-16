"use strict";

const { resolve } = require("path");
const ExitOnDonePlugin = require("../../helpers/ExitOnDonePlugin");

module.exports = {
  mode: "development",
  stats: "detailed",
  entry: resolve(__dirname, "./foo.js"),
  target: ["web"],
  plugins: [new ExitOnDonePlugin()],
};
