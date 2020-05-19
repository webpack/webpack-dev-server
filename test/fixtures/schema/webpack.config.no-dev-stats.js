'use strict';

module.exports = {
  entry: './app.js',
  stats: {
    assetsSort: 'size',
  },
  devServer: {
    host: '_foo',
    public: '_public',
    socket: '_socket',
    progress: '_progress',
    publicPath: '_publicPath',
    hot: '_hot',
    clientLogLevel: '_clientLogLevel',
    contentBase: '_contentBase',
    watchContentBase: '_watchContentBase',
    https: '_https',
    historyApiFallback: '_historyApiFallback',
    compress: '_compress',
    disableHostCheck: '_disableHostCheck',
    open: '_open',
    openPage: '_openPage',
    useLocalIp: '_useLocalIp',
    port: '_port',
  },
};
