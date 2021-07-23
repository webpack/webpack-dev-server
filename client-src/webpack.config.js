"use strict";

const path = require("path");
const webpack = require("webpack");
const { merge } = require("webpack-merge");

// Do not build client on webpack v4, please use webpack v5 to build client
// Workaround for `npm`, because `npm link --ignore-scripts` still run `prepare` script
if (!webpack.webpack) {
  process.exit(0);
}

const library = webpack.webpack
  ? {
      library: {
        // type: "module",
        type: "commonjs",
      },
    }
  : { libraryTarget: "umd" };

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
  target: webpack.webpack ? ["web", "es5"] : "web",
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
      filename: "logger/index.js",
    },
    module: {
      rules: [
        {
          test: /\.js$/,
          use: [
            {
              loader: "babel-loader",
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
        /^tapable\/lib\/SyncBailHook/,
        path.join(__dirname, "modules/logger/SyncBailHookFake.js")
      ),
    ],
  }),
  merge(baseForModules, {
    entry: path.join(__dirname, "modules/strip-ansi/index.js"),
    output: {
      filename: "strip-ansi/index.js",
    },
  }),
  merge(baseForModules, {
    entry: path.join(__dirname, "modules/sockjs-client/index.js"),
    output: {
      filename: "sockjs-client/index.js",
      library: "SockJS",
      libraryTarget: "umd",
      globalObject: "(typeof self !== 'undefined' ? self : this)",
    },
  }),
];
