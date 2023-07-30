"use strict";

// our setup function adds behind-the-scenes bits to the config that all of our
// examples need
const { setup } = require("../../util");

const moduleRuleForPNG = {
  test: /\.png$/,
  type: "asset/resource",
  generator: {
    filename: "images/[hash][ext][query]",
  },
};

module.exports = [
  setup({
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
  }),
  {
    context: __dirname,
    entry: "./app.js",
    output: {
      filename: "bundle2.js",
    },
    module: {
      rules: [
        {
          test: /\.less$/,
          use: ["style-loader", "css-loader", "less-loader"],
        },
        {
          test: /\.png$/,
          type: "asset/resource",
          generator: {
            filename: "images/[hash][ext][query]",
          },
        },
      ],
    },
    optimization: {
      minimize: true,
    },
  },
];
