const path = require('path')
const HtmlWebpackPlugin = require('html-webpack-plugin')

module.exports = ({
  polyfills=[],
  offline=false,
  html=false,
  packagejson={name:''},
  cwd
}) => (function(config) {
  let {name} = packagejson
  config.plugins.push(new HtmlWebpackPlugin({
    title: name,
    filename: 'index.html',
    inject:true,
    // template: (html ? html : path.resolve(__dirname, 'assets','index.tpl')),
    // polyfills: polyfills,
    // 'sw.js': (offline ? path.resolve('./assets/service-worker.js') : ''),
    // chunks: Object.keys(config.entry)
  }))

  return config
})
