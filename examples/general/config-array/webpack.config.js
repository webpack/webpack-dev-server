"use strict";

const { version } = require("webpack");
// our setup function adds behind-the-scenes bits to the config that all of our
// examples need
const { setup } = require("../../util");

const isWebpack5 = version.startsWith("5");

let moduleRuleForPNG = {};

if (isWebpack5) {
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
        isWebpack5
          ? {
              test: /\.png$/,
              type: "asset/resource",
              generator: {
                filename: "images/[hash][ext][query]",
              },
            }
          : {
              test: /\.png$/,
              loader: "url-loader",
              options: { limit: 100000 },
            },
      ],
    },
    optimization: {
      minimize: true,
    },
  },
];
