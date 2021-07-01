'use strict';

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
  mode: 'development',
  context: __dirname,
  stats: 'none',
  entry: './foo.js',
  output: {
    path: '/',
  },
  infrastructureLogging: {
    level: 'warn',
  },
  plugins: [
    {
      apply(compiler) {
        const pluginName = 'html-generator-plugin-test';

        compiler.hooks.thisCompilation.tap(pluginName, (compilation) => {
          const { RawSource } = compiler.webpack.sources;

          compilation.hooks.processAssets.tap(
            {
              name: pluginName,
              stage:
                compiler.webpack.Compilation.PROCESS_ASSETS_STAGE_ADDITIONAL,
            },
            () => {
              const filename = 'test.html';
              const source = new RawSource(HTMLContent);

              compilation.emitAsset(filename, source);
            }
          );
        });
      },
    },
  ],
};
