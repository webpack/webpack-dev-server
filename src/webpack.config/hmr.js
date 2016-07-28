const path = require('path')
const webpack = require('webpack')

module.exports = ({
  proxy,
  devServer,
  port,
  https,
  hotComponents,
  cwd,
  debug
}) => (function (config) {
  if (devServer) {
    config.output.publicPath = `http${https ? 's':''}://localhost:${port}/`
    config.output.chunkFilename = "[name]-[id].js"
    config.devServer.https = https || false
  }

  if (proxy) {
    config.devServer.proxy = proxy
  }

  if (hotComponents) {
    let react_hot = path.resolve(__dirname, "..", "..", "node_modules", "react-hot-loader")
    config.module.loaders.some(function(loader) {
      if(loader.loader.indexOf('jsx') === 0){
        loader.loader = `${react_hot}!${loader.loader}`
        return true
      }
      return false
    })
    config.devServer.hot = true
    config.plugins.push(new webpack.HotModuleReplacementPlugin())
  }

  if (debug){
    config.output.pathinfo = true
  }

  return config
})
