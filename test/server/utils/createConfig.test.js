'use strict';

const path = require('path');
const createConfig = require('../../../lib/utils/createConfig');
const webpackConfig = require('./../../fixtures/schema/webpack.config.simple');
const webpackConfigNoStats = require('./../../fixtures/schema/webpack.config.no-dev-stats');

const argv = {
  port: 8080,
  // Can be `--no-hot` in CLI (undocumented)
  hot: true,
  // Can be `--no-hot-only` in CLI (misleading and undocumented)
  hotOnly: false,
};

describe('createConfig', () => {
  it('simple', () => {
    const config = createConfig(webpackConfig, Object.assign({}, argv), {
      port: 8080,
    });

    expect(config).toMatchSnapshot();
  });

  it('bonjour option', () => {
    const config = createConfig(
      webpackConfig,
      Object.assign({}, argv, {
        bonjour: true,
      }),
      { port: 8080 }
    );

    expect(config).toMatchSnapshot();
  });

  it('bonjour option (devServer config)', () => {
    const config = createConfig(
      Object.assign({}, webpackConfig, { devServer: { bonjour: true } }),
      argv,
      { port: 8080 }
    );

    expect(config).toMatchSnapshot();
  });

  it('host option', () => {
    const config = createConfig(
      webpackConfig,
      Object.assign({}, argv, {
        host: 'example.dev',
      }),
      { port: 8080 }
    );

    expect(config).toMatchSnapshot();
  });

  it('host option (localhost)', () => {
    const config = createConfig(
      webpackConfig,
      Object.assign({}, argv, {
        host: 'localhost',
      }),
      { port: 8080 }
    );

    expect(config).toMatchSnapshot();
  });

  it('host option (undefined)', () => {
    const config = createConfig(
      webpackConfig,
      Object.assign({}, argv, {
        // eslint-disable-next-line no-undefined
        host: undefined,
      }),
      { port: 8080 }
    );

    expect(config).toMatchSnapshot();
  });

  it('host option (null)', () => {
    const config = createConfig(
      webpackConfig,
      Object.assign({}, argv, {
        // eslint-disable-next-line no-undefined
        host: null,
      }),
      { port: 8080 }
    );

    expect(config).toMatchSnapshot();
  });

  it('host option (devServer config)', () => {
    const config = createConfig(
      Object.assign({}, webpackConfig, { devServer: { host: 'example.dev' } }),
      argv,
      { port: 8080 }
    );

    expect(config).toMatchSnapshot();
  });

  it('host option (specify for CLI and devServer config)', () => {
    const config = createConfig(
      Object.assign({}, webpackConfig, { devServer: { host: 'example.dev' } }),
      Object.assign({}, argv, { host: 'other.dev' }),
      { port: 8080 }
    );

    expect(config).toMatchSnapshot();
  });

  it('allowedHosts option', () => {
    const config = createConfig(
      webpackConfig,
      Object.assign({}, argv, {
        allowedHosts: '.host.com,host2.com',
      }),
      { port: 8080 }
    );

    expect(config).toMatchSnapshot();
  });

  it('allowedHosts option (devServer config)', () => {
    const config = createConfig(
      Object.assign({}, webpackConfig, {
        devServer: { allowedHosts: ['.host.com', 'host2.com'] },
      }),
      argv,
      { port: 8080 }
    );

    expect(config).toMatchSnapshot();
  });

  it('public option', () => {
    const config = createConfig(
      webpackConfig,
      Object.assign({}, argv, {
        public: true,
      }),
      { port: 8080 }
    );

    expect(config).toMatchSnapshot();
  });

  it('public option (devServer config)', () => {
    const config = createConfig(
      Object.assign({}, webpackConfig, {
        devServer: { public: true },
      }),
      argv,
      { port: 8080 }
    );

    expect(config).toMatchSnapshot();
  });

  it('socket option', () => {
    const config = createConfig(
      webpackConfig,
      Object.assign({}, argv, {
        socket: 'socket',
      }),
      { port: 8080 }
    );

    expect(config).toMatchSnapshot();
  });

  it('socket option (devServer config)', () => {
    const config = createConfig(
      Object.assign({}, webpackConfig, {
        devServer: { socket: 'socket' },
      }),
      argv,
      { port: 8080 }
    );

    expect(config).toMatchSnapshot();
  });

  it('progress option', () => {
    const config = createConfig(
      webpackConfig,
      Object.assign({}, argv, {
        progress: true,
      }),
      { port: 8080 }
    );

    expect(config).toMatchSnapshot();
  });

  it('progress option (devServer config)', () => {
    const config = createConfig(
      Object.assign({}, webpackConfig, {
        devServer: { progress: true },
      }),
      argv,
      { port: 8080 }
    );

    expect(config).toMatchSnapshot();
  });

  it('publicPath option (not specify)', () => {
    const config = createConfig(webpackConfig, argv, { port: 8080 });

    expect(config).toMatchSnapshot();
  });

  it('publicPath option (path in devServer option)', () => {
    const config = createConfig(
      Object.assign({}, webpackConfig, {
        devServer: { publicPath: '/assets/' },
      }),
      argv,
      { port: 8080 }
    );

    expect(config).toMatchSnapshot();
  });

  it('publicPath option (url in devServer option)', () => {
    const config = createConfig(
      Object.assign({}, webpackConfig, {
        devServer: { publicPath: 'http://localhost:8080/assets/' },
      }),
      argv,
      { port: 8080 }
    );

    expect(config).toMatchSnapshot();
  });

  it('publicPath option (url in output option)', () => {
    const config = createConfig(
      Object.assign({}, webpackConfig, {
        output: { publicPath: 'http://localhost:8080/assets/' },
      }),
      argv,
      { port: 8080 }
    );

    expect(config).toMatchSnapshot();
  });

  it('publicPath option (path in output option)', () => {
    const config = createConfig(
      Object.assign({}, webpackConfig, {
        output: { publicPath: '/assets/' },
      }),
      argv,
      { port: 8080 }
    );

    expect(config).toMatchSnapshot();
  });

  it('publicPath option (path without starting slash in output option)', () => {
    const config = createConfig(
      Object.assign({}, webpackConfig, {
        output: { publicPath: 'assets/' },
      }),
      argv,
      { port: 8080 }
    );

    expect(config).toMatchSnapshot();
  });

  it('filename option (in webpack config)', () => {
    const config = createConfig(
      Object.assign({}, webpackConfig, {
        output: { filename: '[name]-bundle.js' },
      }),
      argv,
      { port: 8080 }
    );

    expect(config).toMatchSnapshot();
  });

  it('filename option (in output config)', () => {
    const config = createConfig(
      Object.assign({}, webpackConfig, {
        output: { filename: '[name]-output-bundle.js' },
      }),
      argv,
      { port: 8080 }
    );

    expect(config).toMatchSnapshot();
  });

  it('filename option (in devServer config)', () => {
    const config = createConfig(
      Object.assign({}, webpackConfig, {
        devServer: { filename: '[name]-dev-server-bundle.js' },
      }),
      argv,
      { port: 8080 }
    );

    expect(config).toMatchSnapshot();
  });

  it('watchOptions option (in output config)', () => {
    const config = createConfig(
      Object.assign({}, webpackConfig, {
        watchOptions: { poll: true },
      }),
      argv,
      { port: 8080 }
    );

    expect(config).toMatchSnapshot();
  });

  it('watchOptions option (in devServer config)', () => {
    const config = createConfig(
      Object.assign({}, webpackConfig, {
        devServer: { watchOptions: { poll: true } },
      }),
      argv,
      { port: 8080 }
    );

    expect(config).toMatchSnapshot();
  });

  it('hot option', () => {
    const config = createConfig(
      webpackConfig,
      Object.assign({}, argv, { hot: true }),
      { port: 8080 }
    );

    expect(config).toMatchSnapshot();
  });

  it('hot option (in devServer config)', () => {
    const config = createConfig(
      Object.assign({}, webpackConfig, {
        devServer: { hot: true },
      }),
      argv,
      { port: 8080 }
    );

    expect(config).toMatchSnapshot();
  });

  it('hotOnly option', () => {
    const config = createConfig(
      webpackConfig,
      Object.assign({}, argv, { hotOnly: true }),
      { port: 8080 }
    );

    expect(config).toMatchSnapshot();
  });

  it('hotOnly option (in devServer config)', () => {
    const config = createConfig(
      Object.assign({}, webpackConfig, {
        devServer: { hotOnly: true },
      }),
      argv,
      { port: 8080 }
    );

    expect(config).toMatchSnapshot();
  });

  it('clientLogLevel option', () => {
    const config = createConfig(
      webpackConfig,
      Object.assign({}, argv, { clientLogLevel: 'none' }),
      { port: 8080 }
    );

    expect(config).toMatchSnapshot();
  });

  it('clientLogLevel option (in devServer config)', () => {
    const config = createConfig(
      Object.assign({}, webpackConfig, {
        devServer: { clientLogLevel: 'none' },
      }),
      argv,
      { port: 8080 }
    );

    expect(config).toMatchSnapshot();
  });

  it('contentBase option (string)', () => {
    const config = createConfig(
      webpackConfig,
      Object.assign({}, argv, { contentBase: 'assets' }),
      { port: 8080 }
    );

    config.contentBase = path.relative(process.cwd(), config.contentBase);

    expect(config).toMatchSnapshot();
  });

  it('contentBase option (array)', () => {
    const config = createConfig(
      webpackConfig,
      Object.assign({}, argv, { contentBase: ['assets', 'static'] }),
      { port: 8080 }
    );

    config.contentBase = config.contentBase.map((item) =>
      path.relative(process.cwd(), item)
    );

    expect(config).toMatchSnapshot();
  });

  it('contentBase option (boolean)', () => {
    const config = createConfig(
      webpackConfig,
      Object.assign({}, argv, { contentBase: false }),
      { port: 8080 }
    );

    expect(config).toMatchSnapshot();
  });

  it('contentBase option (string) (in devServer config)', () => {
    const config = createConfig(
      Object.assign({}, webpackConfig, {
        devServer: { contentBase: 'assets' },
      }),
      argv,
      { port: 8080 }
    );

    config.contentBase = path.relative(process.cwd(), config.contentBase);

    expect(config).toMatchSnapshot();
  });

  it('watchContentBase option', () => {
    const config = createConfig(
      webpackConfig,
      Object.assign({}, argv, { watchContentBase: true }),
      { port: 8080 }
    );

    expect(config).toMatchSnapshot();
  });

  it('watchContentBase option (in devServer config)', () => {
    const config = createConfig(
      Object.assign({}, webpackConfig, {
        devServer: { watchContentBase: true },
      }),
      argv,
      { port: 8080 }
    );

    expect(config).toMatchSnapshot();
  });

  it('stats option', () => {
    const config = createConfig(
      Object.assign({}, webpackConfig, {
        devServer: { stats: 'errors-only' },
      }),
      argv,
      { port: 8080 }
    );

    expect(config).toMatchSnapshot();
  });

  it('stats option (colors)', () => {
    const config = createConfig(
      Object.assign({}, webpackConfig, {
        devServer: { stats: { errors: true } },
      }),
      Object.assign({}, argv, { color: true }),
      { port: 8080 }
    );

    expect(config).toMatchSnapshot();
  });

  it('lazy option', () => {
    const config = createConfig(
      webpackConfig,
      Object.assign({}, argv, { lazy: true }),
      { port: 8080 }
    );

    expect(config).toMatchSnapshot();
  });

  it('lazy option (in devServer config)', () => {
    const config = createConfig(
      Object.assign({}, webpackConfig, {
        devServer: { lazy: true },
      }),
      argv,
      { port: 8080 }
    );

    expect(config).toMatchSnapshot();
  });

  it('info option', () => {
    const config = createConfig(
      webpackConfig,
      Object.assign({}, argv, { info: false }),
      { port: 8080 }
    );

    expect(config).toMatchSnapshot();
  });

  it('info option (in devServer config)', () => {
    const config = createConfig(
      Object.assign({}, webpackConfig, {
        devServer: { noInfo: false },
      }),
      argv,
      { port: 8080 }
    );

    expect(config).toMatchSnapshot();
  });

  it('mimeTypes option', () => {
    const config = createConfig(
      Object.assign({}, webpackConfig, {
        devServer: { mimeTypes: { 'text/html': ['phtml'] } },
      }),
      argv,
      { port: 8080 }
    );

    expect(config).toMatchSnapshot();
  });

  it('mimeTypes option - with force', () => {
    const config = createConfig(
      Object.assign({}, webpackConfig, {
        devServer: {
          mimeTypes: { typeMap: { 'text/html': ['phtml'] }, force: true },
        },
      }),
      argv,
      { port: 8080 }
    );

    expect(config).toMatchSnapshot();
  });

  it('quiet option', () => {
    const config = createConfig(
      webpackConfig,
      Object.assign({}, argv, { quiet: true }),
      { port: 8080 }
    );

    expect(config).toMatchSnapshot();
  });

  it('quiet option (in devServer config)', () => {
    const config = createConfig(
      Object.assign({}, webpackConfig, {
        devServer: { quiet: true },
      }),
      argv,
      { port: 8080 }
    );

    expect(config).toMatchSnapshot();
  });

  it('https option', () => {
    const config = createConfig(
      webpackConfig,
      Object.assign({}, argv, { https: true }),
      { port: 8080 }
    );

    expect(config).toMatchSnapshot();
  });

  it('https option (in devServer config)', () => {
    const config = createConfig(
      Object.assign({}, webpackConfig, {
        devServer: { https: true },
      }),
      argv,
      { port: 8080 }
    );

    expect(config).toMatchSnapshot();
  });

  it('http2 option', () => {
    const config = createConfig(
      webpackConfig,
      Object.assign({}, argv, { https: true, http2: true }),
      { port: 8080 }
    );

    expect(config).toMatchSnapshot();
  });

  it('http2 option (in devServer config)', () => {
    const config = createConfig(
      Object.assign({}, webpackConfig, {
        devServer: { https: true, http2: true },
      }),
      argv,
      { port: 8080 }
    );

    expect(config).toMatchSnapshot();
  });

  it('key option', () => {
    const config = createConfig(
      webpackConfig,
      Object.assign({}, argv, { https: true, key: '/path/to/server.key' }),
      { port: 8080 }
    );

    expect(config).toMatchSnapshot();
  });

  it('key option (in devServer config)', () => {
    const config = createConfig(
      Object.assign({}, webpackConfig, {
        devServer: { https: true, key: '/path/to/server.key' },
      }),
      argv,
      { port: 8080 }
    );

    expect(config).toMatchSnapshot();
  });

  it('cert option', () => {
    const config = createConfig(
      webpackConfig,
      Object.assign({}, argv, { https: true, cert: '/path/to/server.crt' }),
      { port: 8080 }
    );

    expect(config).toMatchSnapshot();
  });

  it('cert option (in devServer config)', () => {
    const config = createConfig(
      Object.assign({}, webpackConfig, {
        devServer: { https: true, cert: '/path/to/server.crt' },
      }),
      argv,
      { port: 8080 }
    );

    expect(config).toMatchSnapshot();
  });

  it('cacert option', () => {
    const config = createConfig(
      webpackConfig,
      Object.assign({}, argv, { https: true, cacert: '/path/to/ca.pem' }),
      { port: 8080 }
    );

    expect(config).toMatchSnapshot();
  });

  it('cacert option (in devServer config)', () => {
    const config = createConfig(
      Object.assign({}, webpackConfig, {
        // TODO rename `ca` to `cacert` for `v4` to avoid difference between CLI and configuration
        devServer: { https: true, ca: '/path/to/ca.pem' },
      }),
      argv,
      { port: 8080 }
    );

    expect(config).toMatchSnapshot();
  });

  it('pfx option', () => {
    const config = createConfig(
      webpackConfig,
      Object.assign({}, argv, { https: true, pfx: '/path/to/file.pfx' }),
      { port: 8080 }
    );

    expect(config).toMatchSnapshot();
  });

  it('pfx option (in devServer config)', () => {
    const config = createConfig(
      Object.assign({}, webpackConfig, {
        devServer: { https: true, pfx: '/path/to/file.pfx' },
      }),
      argv,
      { port: 8080 }
    );

    expect(config).toMatchSnapshot();
  });

  it('pfxPassphrase option', () => {
    const config = createConfig(
      webpackConfig,
      Object.assign({}, argv, { pfxPassphrase: 'passphrase' }),
      { port: 8080 }
    );

    expect(config).toMatchSnapshot();
  });

  it('https option (in devServer config)', () => {
    const config = createConfig(
      Object.assign({}, webpackConfig, {
        devServer: { pfxPassphrase: 'passphrase' },
      }),
      argv,
      { port: 8080 }
    );

    expect(config).toMatchSnapshot();
  });

  it('inline option', () => {
    const config = createConfig(
      webpackConfig,
      Object.assign({}, argv, { inline: false }),
      { port: 8080 }
    );

    expect(config).toMatchSnapshot();
  });

  it('inline option (in devServer config)', () => {
    const config = createConfig(
      Object.assign({}, webpackConfig, {
        devServer: { inline: false },
      }),
      argv,
      { port: 8080 }
    );

    expect(config).toMatchSnapshot();
  });

  it('historyApiFallback option', () => {
    const config = createConfig(
      webpackConfig,
      Object.assign({}, argv, { historyApiFallback: true }),
      { port: 8080 }
    );

    expect(config).toMatchSnapshot();
  });

  it('historyApiFallback option (in devServer config)', () => {
    const config = createConfig(
      Object.assign({}, webpackConfig, {
        devServer: { historyApiFallback: true },
      }),
      argv,
      { port: 8080 }
    );

    expect(config).toMatchSnapshot();
  });

  it('compress option', () => {
    const config = createConfig(
      webpackConfig,
      Object.assign({}, argv, { compress: true }),
      { port: 8080 }
    );

    expect(config).toMatchSnapshot();
  });

  it('compress option (in devServer config)', () => {
    const config = createConfig(
      Object.assign({}, webpackConfig, {
        devServer: { compress: true },
      }),
      argv,
      { port: 8080 }
    );

    expect(config).toMatchSnapshot();
  });

  it('disableHostCheck option', () => {
    const config = createConfig(
      webpackConfig,
      Object.assign({}, argv, { disableHostCheck: true }),
      { port: 8080 }
    );

    expect(config).toMatchSnapshot();
  });

  it('disableHostCheck option (in devServer config)', () => {
    const config = createConfig(
      Object.assign({}, webpackConfig, {
        devServer: { disableHostCheck: true },
      }),
      argv,
      { port: 8080 }
    );

    expect(config).toMatchSnapshot();
  });

  it('open option (boolean)', () => {
    const config = createConfig(
      webpackConfig,
      Object.assign({}, argv, { open: true }),
      { port: 8080 }
    );

    expect(config).toMatchSnapshot();
  });

  it('open option (boolean) (in devServer config)', () => {
    const config = createConfig(
      Object.assign({}, webpackConfig, {
        devServer: { open: true },
      }),
      argv,
      { port: 8080 }
    );

    expect(config).toMatchSnapshot();
  });

  it('open option (browser)', () => {
    const config = createConfig(
      webpackConfig,
      Object.assign({}, argv, { open: 'Google Chrome' }),
      { port: 8080 }
    );

    expect(config).toMatchSnapshot();
  });

  it('openPage option', () => {
    const config = createConfig(
      webpackConfig,
      Object.assign({}, argv, { openPage: '/different/page' }),
      { port: 8080 }
    );

    expect(config).toMatchSnapshot();
  });

  it('openPage option (in devServer config)', () => {
    const config = createConfig(
      Object.assign({}, webpackConfig, {
        devServer: { open: true, openPage: '/different/page' },
      }),
      argv,
      { port: 8080 }
    );

    expect(config).toMatchSnapshot();
  });

  it('useLocalIp option', () => {
    const config = createConfig(
      webpackConfig,
      Object.assign({}, argv, { useLocalIp: true }),
      { port: 8080 }
    );

    expect(config).toMatchSnapshot();
  });

  it('useLocalIp option (in devServer config)', () => {
    const config = createConfig(
      Object.assign({}, webpackConfig, {
        devServer: { useLocalIp: true },
      }),
      argv,
      { port: 8080 }
    );

    expect(config).toMatchSnapshot();
  });

  it('port option (same)', () => {
    const config = createConfig(
      webpackConfig,
      Object.assign({}, argv, { port: 9090 }),
      { port: 9090 }
    );

    expect(config).toMatchSnapshot();
  });

  it('port option (same) (string)', () => {
    const config = createConfig(
      webpackConfig,
      Object.assign({}, argv, { port: '9090' }),
      { port: '9090' }
    );

    expect(config).toMatchSnapshot();
  });

  it('port option (same) (null)', () => {
    const config = createConfig(
      webpackConfig,
      Object.assign({}, argv, { port: null }),
      { port: null }
    );

    expect(config).toMatchSnapshot();
  });

  it('port option (same) (undefined)', () => {
    const config = createConfig(
      webpackConfig,
      // eslint-disable-next-line no-undefined
      Object.assign({}, argv, { port: undefined }),
      // eslint-disable-next-line no-undefined
      { port: undefined }
    );

    expect(config).toMatchSnapshot();
  });

  it('port option (difference)', () => {
    const config = createConfig(
      webpackConfig,
      Object.assign({}, argv, { port: 7070 }),
      { port: 8080 }
    );

    expect(config).toMatchSnapshot();
  });

  it('use webpack stats', () => {
    expect(
      createConfig(webpackConfigNoStats, argv, { port: 8080 })
    ).toMatchSnapshot();
    expect(webpackConfigNoStats).toMatchSnapshot();
  });

  it('onListening option', () => {
    const config = createConfig(
      Object.assign({}, webpackConfig, {
        devServer: { onListening: () => {} },
      }),
      argv,
      { port: 8080 }
    );

    expect(config).toMatchSnapshot();
  });

  it('overlay option', () => {
    const config = createConfig(
      webpackConfig,
      Object.assign({}, argv, {
        overlay: true,
      }),
      { port: 8080 }
    );

    expect(config).toMatchSnapshot();
  });

  it('overlay option (in devServer config)', () => {
    const config = createConfig(
      Object.assign({}, webpackConfig, {
        devServer: { overlay: true },
      }),
      argv,
      { port: 8080 }
    );

    expect(config).toMatchSnapshot();
  });

  it('sockHost option', () => {
    const config = createConfig(
      webpackConfig,
      Object.assign({}, argv, {
        sockHost: true,
      }),
      { port: 8080 }
    );

    expect(config).toMatchSnapshot();
  });

  it('sockPath option', () => {
    const config = createConfig(
      webpackConfig,
      Object.assign({}, argv, {
        sockPath: 'path',
      }),
      { port: 8080 }
    );

    expect(config).toMatchSnapshot();
  });

  it('sockPort option', () => {
    const config = createConfig(
      webpackConfig,
      Object.assign({}, argv, {
        sockPort: 'port',
      }),
      { port: 8080 }
    );

    expect(config).toMatchSnapshot();
  });

  it('liveReload option', () => {
    const config = createConfig(
      webpackConfig,
      Object.assign({}, argv, {
        liveReload: false,
      }),
      { port: 8080 }
    );

    expect(config).toMatchSnapshot();
  });

  it('profile option', () => {
    const config = createConfig(
      webpackConfig,
      Object.assign({}, argv, {
        profile: 'profile',
      }),
      { port: 8080 }
    );

    expect(config).toMatchSnapshot();
  });
});
