"use strict";

const { version } = require("webpack");
// our setup function adds behind-the-scenes bits to the config that all of our
// examples need
const { setup } = require("../util");

let moduleRuleForPNG = {};

if (version.startsWith("5")) {
  moduleRuleForPNG = {
    test: /\.png$/,
    type: "asset/resource",
    generator: {
      filename: "images/[hash][ext][query]",
    },
  };
} else {
  moduleRuleForPNG = {
    test: /\.png$/,
    loader: "file-loader",
    options: { prefix: "img/" },
  };
}

module.exports = setup({
  context: __dirname,
  entry: "./app.js",
  module: {
    rules: [
      {
        test: /\.less$/,
        use: ["style-loader", "css-loader", "less-loader"],
      },
      {
        ...moduleRuleForPNG,
      },
    ],
  },
});
