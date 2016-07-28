const path = require('path')
const webpack = require('webpack')
const OfflinePlugin = require('offline-plugin')

module.exports = ({
  offline=false,
  deploy=false,
  packagejson={version:'0'}
}) => (function updateOffline(config) {
  let {version} = packagejson

  if (offline){
    config.plugins.push(new OfflinePlugin({
      caches: {main:['index.html',":rest:"]},
      scope: '/',
      updateStrategy: 'all', /* change to 'hash' */
      version: (deploy ? version : () => +new Date()), /* all dev builds will be timestamped so it never caches */
      ServiceWorker: {
        output: path.resolve('.','assets','service-worker.tpl'),
        /* entry: null, add an entry for custom actions */
      },
      AppCache: false,
    }))
  }

  config.plugins.push(new webpack.DefinePlugin({
    __OFFLINE__: offline
  }))

  return config
})
