"use strict";

const ExitOnDonePlugin = require("../../helpers/ExitOnDonePlugin");

module.exports = {
  mode: "development",
  context: __dirname,
  entry: {
    main: {
      import: "./foo.js",
    },
  },
  plugins: [new ExitOnDonePlugin()],
};
