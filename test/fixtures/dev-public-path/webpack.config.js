"use strict";

const { join } = require("path");

module.exports = {
  mode: "development",
  entry: join(__dirname, "foo.js"),
  devServer: {
    devMiddleware: {
      publicPath: "/foo/bar",
    },
  },
};
