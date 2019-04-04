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
    hotOnly: '_hotOnly',
    clientLogLevel: '_clientLogLevel',
    contentBase: '_contentBase',
    watchContentBase: '_watchContentBase',
    lazy: '_lazy',
    noInfo: '_noInfo',
    quiet: '_quiet',
    https: '_https',
    pfxPassphrase: '_pfxPassphrase',
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
