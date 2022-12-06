"use strict";

// our setup function adds behind-the-scenes bits to the config that all of our
// examples need
const { setup } = require("../../util");

module.exports = setup({
  context: __dirname,
  // create error for overlay
  entry: "./app.js",
  devServer: {
    client: {
      overlay: true,
    },
  },
  // uncomment to test for IE
  // target: ["web", "es5"],
});
