"use strict";

const path = require("path");
const webpack = require("webpack");
const { merge } = require("webpack-merge");

const library = {
  library: {
    // type: "module",
    type: "commonjs",
  },
};

const baseForModules = {
  devtool: false,
  mode: "development",
  // TODO enable this in future after fix bug with `eval` in webpack
  // experiments: {
  //   outputModule: true,
  // },
  output: {
    path: path.resolve(__dirname, "../client/modules"),
    ...library,
  },
  optimization: {
    minimize: false,
  },
  target: ["web", "es5"],
  module: {
    rules: [
      {
        test: /\.js$/,
        use: [
          {
            loader: "babel-loader",
          },
        ],
      },
    ],
  },
};

module.exports = [
  merge(baseForModules, {
    entry: path.join(__dirname, "modules/logger/index.js"),
    output: {
      // @ts-ignore
      filename: "logger/index.js",
    },
    module: {
      rules: [
        {
          test: /\.js$/,
          use: [
            {
              loader: "babel-loader",
              // @ts-ignore
              options: {
                plugins: ["@babel/plugin-transform-object-assign"],
              },
            },
          ],
        },
      ],
    },
    plugins: [
      new webpack.DefinePlugin({
        Symbol:
          '(typeof Symbol !== "undefined" ? Symbol : function (i) { return i; })',
      }),
      new webpack.NormalModuleReplacementPlugin(
        /^tapable$/,
        path.join(__dirname, "modules/logger/tapable.js"),
      ),
    ],
  }),
  merge(baseForModules, {
    entry: path.join(__dirname, "modules/sockjs-client/index.js"),
    output: {
      filename: "sockjs-client/index.js",
      // @ts-ignore
      library: "SockJS",
      libraryTarget: "umd",
      globalObject: "(typeof self !== 'undefined' ? self : this)",
    },
  }),
];
