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
    filename: '_filename',
    hot: '_hot',
    clientLogLevel: '_clientLogLevel',
    contentBase: '_contentBase',
    watchContentBase: '_watchContentBase',
    lazy: '_lazy',
    https: '_https',
    inline: '_inline',
    historyApiFallback: '_historyApiFallback',
    compress: '_compress',
    disableHostCheck: '_disableHostCheck',
    open: '_open',
    openPage: '_openPage',
    useLocalIp: '_useLocalIp',
    port: '_port',
  },
};
