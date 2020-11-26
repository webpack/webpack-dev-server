'use strict';

module.exports = {
  entry: './app.js',
  stats: {
    assetsSort: 'size',
  },
  devServer: {
    host: '_foo',
    public: '_public',
    publicPath: '_publicPath',
    hot: '_hot',
    clientLogging: '_clientLogging',
    contentBase: '_contentBase',
    watchContentBase: '_watchContentBase',
    https: '_https',
    historyApiFallback: '_historyApiFallback',
    compress: '_compress',
    firewall: '_firewall',
    open: '_open',
    openPage: '_openPage',
    useLocalIp: '_useLocalIp',
    port: '_port',
  },
};
