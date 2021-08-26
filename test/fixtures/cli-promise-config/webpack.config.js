"use strict";

const { join } = require("path");
const ExitOnDonePlugin = require("../../helpers/ExitOnDonePlugin");

module.exports = () =>
  new Promise((resolve) => {
    resolve({
      mode: "development",
      entry: join(__dirname, "foo.js"),
      plugins: [new ExitOnDonePlugin()],
    });
  });
