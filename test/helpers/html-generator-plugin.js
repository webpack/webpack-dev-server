const HTMLContentForIndex = (scriptType, mainScript) => `
<!DOCTYPE html>
<html>
  <head>
    <meta charset='UTF-8'>
    <title>webpack-dev-server</title>
  </head>
  <body>
    <h1>webpack-dev-server is running...</h1>
    <script type="${scriptType}" charset="utf-8" src="/${mainScript}"></script>
  </body>
</html>
`;

const HTMLContentForAssets = (assetName, scriptType) => `
<!DOCTYPE html>
<html>
  <head>
    <meta charset='UTF-8'>
    <title>webpack-dev-server</title>
  </head>
  <body>
    <h1>(${assetName}>)webpack-dev-server is running...</h1>
    <script type="${scriptType}" charset="utf-8" src=${assetName}></script>
  </body>
</html>
`;

const HTMLContentForTest = `
<!DOCTYPE html>
<html>
  <head>
    <meta charset='UTF-8'>
    <title>test</title>
  </head>
  <body>
    <h1>Created via HTMLGeneratorPlugin</h1>
  </body>
</html>
`;

export default class HTMLGeneratorPlugin {
  apply(compiler) {
    const pluginName = "html-generator-plugin";

    compiler.hooks.thisCompilation.tap(pluginName, (compilation) => {
      const { RawSource } = compiler.webpack.sources;

      // Universal targets emit ESM (`main.mjs`) that must be loaded as a module.
      // `output.module` is read here, and not in `apply`, because webpack
      // applies its option defaults after user plugins are applied.
      const isModule = Boolean(compiler.options.output.module);
      const mainScript = isModule ? "main.mjs" : "main.js";
      const scriptType = isModule ? "module" : "text/javascript";

      compilation.hooks.processAssets.tap(
        {
          name: pluginName,
          stage: compiler.webpack.Compilation.PROCESS_ASSETS_STAGE_ADDITIONAL,
        },
        () => {
          const indexSource = new RawSource(
            // eslint-disable-next-line new-cap
            HTMLContentForIndex(scriptType, mainScript),
          );
          const testSource = new RawSource(HTMLContentForTest);
          const assets = compilation.getAssets();

          compilation.emitAsset("index.html", indexSource);
          compilation.emitAsset("test.html", testSource);

          for (const asset of assets) {
            const assetName = asset.name;

            if (assetName !== mainScript) {
              const assetSource = new RawSource(
                // eslint-disable-next-line new-cap
                HTMLContentForAssets(assetName, scriptType),
              );
              compilation.emitAsset(
                assetName.replace(/\.m?js$/, ".html"),
                assetSource,
              );
            }
          }
        },
      );
    });
  }
}
