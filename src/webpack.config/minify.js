const webpack = require('webpack')

module.exports = ({
  minimize
}) => function(config){
  if (minimize) {
    config.plugins.push(
      new webpack.optimize.UglifyJsPlugin({
        compress:{warnings:false},
        test:/[^min]\.js/i /* IMPORTANT: Uglify will crawl with minified code */
      }),
      new webpack.DefinePlugin({
        "process.env": {
          NODE_ENV: JSON.stringify("production")
        },
        __DEV__: JSON.stringify(JSON.parse(process.env.BUILD_DEV || 'false'))
      }),
      new webpack.NoErrorsPlugin()
    )
  }

  return config
}
