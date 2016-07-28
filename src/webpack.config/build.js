const path = require('path')
const {ResolverPlugin, DefinePlugin} = require('webpack')

module.exports = ({
    hotComponents,
    https,
    port,
    bower,
    lint,
    serverSideRendering,
    polyfills,
  }) => (function(config){

    var entry = config.entry && config.entry.app || Object.keys(config.entry)

    if (hotComponents) {
      entry.unshift(path.resolve(__dirname, "..", "..", "node_modules", "webpack", "hot", "only-dev-server"))
      entry.unshift(`${path.resolve(__dirname, "..", "server", "client")}?http${https?'s':''}://localhost:${port}`)
    }

    // if (bower) {
    //   var mainFile = new DirectoryDescriptionFilePlugin("bower.json", ["main"])
    //   config.resolveLoader.root.unshift(path.join(__dirname, "bower_components"))
    //   config.plugins.push(new ResolverPlugin(mainFile))
    // }

    if (!serverSideRendering && config.target !== "node"){
      config.plugins.push(
        new DefinePlugin({"process.env.BROWSER_ENV":true})
      )
    }

    if (lint === true) {
      config.preLoaders.unshift({
        test: /\.(js|jsx)$/,
        include: [/src/],
        loader: 'jsxhint'
      });
    } else if (lint){
      // TODO: add linting for other envs
    }

    return config
  }
)
