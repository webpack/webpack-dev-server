"use strict";

const HTMLContent = `
<!doctype html>
<html>
  <head>
    <meta charset='UTF-8'>
    <title>test</title>
  </head>
  <body></body>
</html>
`;

module.exports = {
  devtool: "eval-nosources-cheap-source-map",
  mode: "development",
  context: __dirname,
  stats: "none",
  entry: "./foo.js",
  output: {
    path: "/",
  },
  infrastructureLogging: {
    level: "info",
    stream: {
      write: () => {},
    },
  },
  plugins: [
    {
      apply(compiler) {
        const pluginName = "html-generator-plugin-test";
        const filename = "test.html";

        compiler.hooks.thisCompilation.tap(pluginName, (compilation) => {
          if (compiler.webpack) {
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
          } else {
            compilation.hooks.additionalAssets.tap(pluginName, () => {
              compilation.emitAsset(filename, {
                source() {
                  return HTMLContent;
                },
                size() {
                  return HTMLContent.length;
                },
              });
            });
          }
        });
      },
    },
  ],
};
