"use strict";

const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
// our setup function adds behind-the-scenes bits to the config that all of our
// examples need
const { setup } = require("../../util");

const config = setup({
  context: __dirname,
  // create error for overlay
  entry: "./invalid.js",
  output: {
    trustedTypes: { policyName: "webpack" },
  },
  devServer: {
    client: {
      overlay: {
        trustedTypesPolicyName: "overlay-policy",
      },
    },
  },
});

// overwrite the index.html with our own to enable Trusted Types
config.plugins[0] = new HtmlWebpackPlugin({
  filename: "index.html",
  template: path.join(__dirname, "./layout.html"),
  title: "trusted types overlay",
});

module.exports = config;
