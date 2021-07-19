"use strict";

const ExitOnDonePlugin = require("../../helpers/ExitOnDonePlugin");

module.exports = {
  mode: "development",
  stats: "detailed",
  context: __dirname,
  entry: "./foo.js",
  plugins: [ExitOnDonePlugin],
};
