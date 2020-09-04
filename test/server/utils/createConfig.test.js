'use strict';

const path = require('path');
const createConfig = require('../../../lib/utils/createConfig');
const webpackConfig = require('./../../fixtures/schema/webpack.config.simple');

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
        devServer: {
          dev: {
            publicPath: '/assets/',
          },
        },
      }),
      argv,
      { port: 8080 }
    );

    expect(config).toMatchSnapshot();
  });

  it('publicPath option (url in devServer option)', () => {
    const config = createConfig(
      Object.assign({}, webpackConfig, {
        devServer: {
          dev: {
            publicPath: 'http://localhost:8080/assets/',
          },
        },
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

  it('hot option (true)', () => {
    const config = createConfig(
      webpackConfig,
      Object.assign({}, argv, { hot: true }),
      { port: 8080 }
    );

    expect(config).toMatchSnapshot();
  });

  it('hot option (false)', () => {
    const config = createConfig(
      webpackConfig,
      Object.assign({}, argv, { hot: false }),
      { port: 8080 }
    );

    expect(config).toMatchSnapshot();
  });

  it('hot option (true) (in devServer config)', () => {
    const config = createConfig(
      Object.assign({}, webpackConfig, {
        devServer: { hot: true },
      }),
      argv,
      { port: 8080 }
    );

    expect(config).toMatchSnapshot();
  });

  it('hot option (false) (in devServer config)', () => {
    const config = createConfig(
      Object.assign({}, webpackConfig, {
        devServer: { hot: false },
      }),
      // eslint-disable-next-line no-undefined
      Object.assign({}, argv, { hot: undefined }),
      { port: 8080 }
    );

    expect(config).toMatchSnapshot();
  });

  it('hot only option', () => {
    const config = createConfig(
      webpackConfig,
      Object.assign({}, argv, { hotOnly: true }),
      { port: 8080 }
    );

    expect(config).toMatchSnapshot();
  });

  it('hot only option (in devServer config)', () => {
    const config = createConfig(
      Object.assign({}, webpackConfig, {
        devServer: { hot: 'only' },
      }),
      // eslint-disable-next-line no-undefined
      Object.assign({}, argv, { hot: undefined }),
      { port: 8080 }
    );

    expect(config).toMatchSnapshot();
  });

  it('clientLogging option', () => {
    const config = createConfig(
      webpackConfig,
      Object.assign({}, argv, { clientLogging: 'none' }),
      { port: 8080 }
    );

    expect(config).toMatchSnapshot();
  });

  it('client.logging option (in devServer config)', () => {
    const config = createConfig(
      Object.assign({}, webpackConfig, {
        devServer: {
          client: {
            logging: 'none',
          },
        },
      }),
      argv,
      { port: 8080 }
    );

    expect(config).toMatchSnapshot();
  });

  it('clientLogging option overrides devServer config', () => {
    const config = createConfig(
      Object.assign({}, webpackConfig, {
        devServer: {
          client: {
            logging: 'verbose',
          },
        },
      }),
      Object.assign({}, argv, { clientLogging: 'none' }),
      { port: 8080 }
    );

    expect(config).toMatchSnapshot();
  });

  it('static option (string)', () => {
    const config = createConfig(
      webpackConfig,
      Object.assign({}, argv, { static: 'assets' }),
      { port: 8080 }
    );

    config.static = config.static.map((staticDir) =>
      path.relative(process.cwd(), staticDir)
    );

    expect(config).toMatchSnapshot();
  });

  it('static option (list of strings)', () => {
    const config = createConfig(
      webpackConfig,
      Object.assign({}, argv, { static: ['assets1', 'assets2'] }),
      { port: 8080 }
    );

    config.static = config.static.map((staticDir) =>
      path.relative(process.cwd(), staticDir)
    );

    expect(config).toMatchSnapshot();
  });

  it('static option (boolean)', () => {
    const config = createConfig(
      webpackConfig,
      Object.assign({}, argv, { static: false }),
      { port: 8080 }
    );

    expect(config).toMatchSnapshot();
  });

  it('static option (in devServer config)', () => {
    const config = createConfig(
      Object.assign({}, webpackConfig, {
        devServer: { static: true },
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

  it('firewall option (empty string)', () => {
    const config = createConfig(
      webpackConfig,
      Object.assign({}, argv, { firewall: '' }),
      { port: 8080 }
    );

    expect(config).toMatchSnapshot();
  });

  it('firewall option (boolean true)', () => {
    const config = createConfig(
      webpackConfig,
      Object.assign({}, argv, { firewall: true }),
      { port: 8080 }
    );

    expect(config).toMatchSnapshot();
  });

  it('firewall option (boolean false)', () => {
    const config = createConfig(
      webpackConfig,
      Object.assign({}, argv, { firewall: false }),
      { port: 8080 }
    );

    expect(config).toMatchSnapshot();
  });

  it('firewall option (string array)', () => {
    const config = createConfig(
      webpackConfig,
      Object.assign({}, argv, { firewall: ['.host.com', 'host2.com'] }),
      { port: 8080 }
    );

    expect(config).toMatchSnapshot();
  });

  it('firewall option (boolean in devServer config)', () => {
    const config = createConfig(
      Object.assign({}, webpackConfig, {
        devServer: { firewall: true },
      }),
      argv,
      { port: 8080 }
    );

    expect(config).toMatchSnapshot();
  });

  it('firewall option (string array in devServer config)', () => {
    const config = createConfig(
      Object.assign({}, webpackConfig, {
        devServer: { firewall: ['.host.com', 'host2.com'] },
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
