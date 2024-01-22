"use strict";

// our setup function adds behind-the-scenes bits to the config that all of our
// examples need
const { setup } = require("../../util");

module.exports = new Promise((resolve) => {
  resolve(
    setup({
      context: __dirname,
      entry: "./app.js",
      devServer: {},
    }),
  );
});
