'use strict';

const createConfig = require('../lib/utils/createConfig');
const webpackConfig = require('./fixtures/schema/webpack.config.simple');

const argv = {
  host: 'foo',
  public: 'public',
  socket: 'socket',
  progress: 'progress',
  publicPath: 'publicPath',
  filename: 'filename',
  hot: 'hot',
  hotOnly: 'hotOnly',
  clientLogLevel: 'clientLogLevel',
  contentBase: 'contentBase',
  watchContentBase: 'watchContentBase',
  stats: {
    cached: 'cached',
    cachedAssets: 'cachedAssets',
    colors: 'colors',
  },
  lazy: 'lazy',
  noInfo: 'noInfo',
  quiet: 'quiet',
  https: 'https',
  pfxPassphrase: 'pfxPassphrase',
  inline: 'inline',
  historyApiFallback: 'historyApiFallback',
  compress: 'compress',
  disableHostCheck: 'disableHostCheck',
  open: 'open',
  openPage: 'openPage',
  useLocalIp: 'useLocalIp',
  port: 'port',
};

describe('createConfig', () => {
  it('simple', () => {
    expect(createConfig(webpackConfig, argv, { port: 8080 })).toMatchSnapshot();
    expect(webpackConfig).toMatchSnapshot();
  });
});
