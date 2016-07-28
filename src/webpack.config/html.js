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
  config.plugins.push(new HtmlWebpackPlugin(Object.assign({
    title: name,
    filename: 'index.html',
    template: (html ? html : path.resolve(__dirname, 'assets','index.ejs')),
    name: name,
    polyfills: polyfills,
    chunks: Object.keys(config.entry)
  },
  (offline ? {'sw.js': path.resolve(__dirname,'assets','service-worker.js')} : {}))))

  return config
})
