"use strict";

const webpack = require("webpack");

const isWebpack5 = webpack.version.startsWith("5");

const HTMLContent = `
<!doctype html>
<html>
  <head>
    <meta charset='UTF-8'>
    <title>test</title>
    <script src="main.js"></script>
  </head>
  <body></body>
</html>
`;

module.exports = {
  devtool: false,
  mode: "development",
  context: __dirname,
  stats: "none",
  entry: "./entry.js",
  output: {
    path: "/",
  },
  experiments: {
    lazyCompilation: true,
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
  plugins: [
    {
      apply(compiler) {
        const pluginName = "html-generator-plugin-test";
        const filename = "test.html";

        compiler.hooks.thisCompilation.tap(pluginName, (compilation) => {
          const { RawSource } = compiler.webpack.sources;

          compilation.hooks.processAssets.tap(
            {
              name: pluginName,
              stage:
                compiler.webpack.Compilation.PROCESS_ASSETS_STAGE_ADDITIONAL,
            },
            () => {
              const source = new RawSource(HTMLContent);

              compilation.emitAsset(filename, source);
            }
          );
        });
      },
    },
  ],
};
