'use strict';

const path = require('path');
const createConfig = require('../../../lib/utils/createConfig');
const webpackConfig = require('./../../fixtures/schema/webpack.config.simple');
const webpackConfigNoStats = require('./../../fixtures/schema/webpack.config.no-dev-stats');

const argv = {
  port: 8080,
  // Can be `--no-hot` in CLI (undocumented)
  hot: true,
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

  it('info option', () => {
    const config = createConfig(
      webpackConfig,
      Object.assign({}, argv, { info: false }),
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

  it('https option', () => {
    const config1 = createConfig(
      webpackConfig,
      Object.assign({}, argv, { https: true }),
      { port: 8080 }
    );

    expect(config1).toMatchSnapshot();

    const config2 = createConfig(
      webpackConfig,
      Object.assign({}, argv, {
        https: { ca: Buffer.from('') },
      }),
      { port: 8080 }
    );

    expect(config2).toMatchSnapshot();
  });

  it('https option (in devServer config)', () => {
    const config1 = createConfig(
      Object.assign({}, webpackConfig, {
        devServer: { https: true },
      }),
      argv,
      { port: 8080 }
    );

    expect(config1).toMatchSnapshot();

    const config2 = createConfig(
      Object.assign({}, webpackConfig, {
        devServer: { https: { ca: Buffer.from('') } },
      }),
      argv,
      { port: 8080 }
    );

    expect(config2).toMatchSnapshot();
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

  it('open option (string)', () => {
    const config = createConfig(
      webpackConfig,
      Object.assign({}, argv, { open: 'Google Chrome' }),
      { port: 8080 }
    );

    expect(config).toMatchSnapshot();
  });

  it('open option (object)', () => {
    const config = createConfig(
      webpackConfig,
      {
        ...argv,
        open: {
          app: ['Google Chrome', '--incognito'],
        },
      },
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

  it('openPage multiple option (in devServer config)', () => {
    const config = createConfig(
      Object.assign({}, webpackConfig, {
        devServer: {
          open: true,
          openPage: ['/different/page', '/different/page2'],
        },
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
