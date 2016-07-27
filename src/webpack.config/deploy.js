const {CompressionPlugin} = require('webpack')
const StatsPlugin = require('stats-webpack-plugin')
const GZipPlugin = require('compression-webpack-plugin')

module.exports = ({
  longTermCaching,
  commonsChunk,
  isomorphic,
  separateStylesheet,
  deploy,
  packagejson={dependencies:[]}
}) => (function(config){
  let {dependencies} = packagejson
  if (deploy){
    config.entry.libs = Object.keys(dependencies)
      .map(k => dependencies[k])

      config.plugins.push(new CompressionPlugin({asset: "{file}.gz",regExp: /\.js$|\.css$|\.html$|\.png$|\.jpg$|\.jpeg$|\.gif$/}))
      // TODO: read file size of the gzip files
      // TODO: delete files
      // TODO: report the gzipped file sizes

      if (stats){
        config.plugins.push(new StatsPlugin(path.join('./build', 'stats.json'), {
          chunkModules: true,
          exclude: [/node_modules/]
        }))
      }

      if (longTermCaching && !serverSideRendering){
        config.output.filename += "?[chunkhash]"
        config.output.chunkFilename += "?[chunkhash]"
      }

      if(commonsChunk) {
        var name = "libs.js" + (longTermCaching && !serverSideRendering ? "?[chunkhash]" : "")
      }

      if (separateStylesheet) {
        config.module.loaders.map(function(load) {
          if (load.loader.indexOf('style!') === 0) {
            load.loader = ExtractTextPlugin.extract("style", load.loader.replace('style!',''))
          }
        })
        config.plugins.push(new ExtractTextPlugin("[name].css"))
      }
  }

  return config
})
