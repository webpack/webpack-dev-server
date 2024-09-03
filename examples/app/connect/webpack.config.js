"use strict";

// our setup function adds behind-the-scenes bits to the config that all of our
// examples need
const connect = require("connect");
const { setup } = require("../../util");

module.exports = setup({
  context: __dirname,
  entry: "./app.js",
  devServer: {
    app: () => connect(),
  },
});
