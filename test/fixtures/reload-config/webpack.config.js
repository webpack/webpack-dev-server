"use strict";

const webpack = require("webpack");

const { EntryOptionPlugin, Compilation } = webpack;

const isWebpack5 = webpack.version.startsWith("5");

class TestChildCompilerPlugin {
  constructor(options) {
    this.name = "TestChildCompilerPlugin";
    this.options = webpack.config.getNormalizedWebpackOptions(options);
  }

  apply(compiler) {
    compiler.hooks.thisCompilation.tap(this.name, (compilation) => {
      compilation.hooks.processAssets.tapAsync(
        {
          name: this.name,
          stage: Compilation.PROCESS_ASSETS_STAGE_SUMMARIZE,
        },
        (assets, callback) => {
          const child = compilation.createChildCompiler(this.name);
          EntryOptionPlugin.applyEntryOption(
            child,
            compilation.compiler.context,
            this.options.entry
          );
          child.runAsChild(() => {
            callback();
          });
        }
      );
    });
  }
}

module.exports = {
  mode: "development",
  context: __dirname,
  entry: "./foo.js",
  stats: "none",
  output: {
    path: "/",
  },
  module: {
    rules: [
      {
        test: /\.css$/,
        use: [{ loader: "style-loader" }, { loader: "css-loader" }],
      },
    ],
  },
  infrastructureLogging: isWebpack5
    ? {
        level: "info",
        stream: {
          write: () => {},
        },
      }
    : {
        level: "info",
      },

  plugins: isWebpack5
    ? [
        new TestChildCompilerPlugin({
          entry: {
            child: "./child",
          },
        }),
      ]
    : [],
};
