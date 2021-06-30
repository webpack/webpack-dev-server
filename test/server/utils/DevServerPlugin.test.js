'use strict';

const path = require('path');
const webpack = require('webpack');
const DevServerPlugin = require('../../../lib/utils/DevServerPlugin');
const isWebpack5 = require('../../helpers/isWebpack5');
const config = require('../../fixtures/simple-config/webpack.config');
const configEntryAsFunction = require('../../fixtures/entry-as-function/webpack.config');

const normalize = (entry) => entry.split(path.sep).join('/');

describe('DevServerPlugin util', () => {
  async function getEntries(compiler) {
    return compiler.options.entry;
  }

  it('should preserves dynamic entry points', async () => {
    let i = 0;
    const webpackOptions = {
      // simulate dynamic entry
      entry: () => {
        i += 1;
        return `./src-${i}.js`;
      },
    };
    const compiler = webpack(webpackOptions);
    const devServerOptions = {
      hot: true,
      client: {
        transport: 'sockjs',
        webSocketURL: {},
      },
      webSocketServer: {
        type: 'sockjs',
        options: {
          host: '0.0.0.0',
        },
      },
    };

    const plugin = new DevServerPlugin(devServerOptions);

    plugin.apply(compiler);

    const entries = await getEntries(compiler);
    expect(typeof entries).toEqual('function');

    const entryFirstRun = await entries();
    const entrySecondRun = await entries();
    if (isWebpack5) {
      expect(entryFirstRun.main.import.length).toEqual(1);
      expect(entryFirstRun.main.import[0]).toEqual('./src-1.js');

      expect(entrySecondRun.main.import.length).toEqual(1);
      expect(entrySecondRun.main.import[0]).toEqual('./src-2.js');
    } else {
      expect(entryFirstRun.length).toEqual(3);
      expect(entryFirstRun[2]).toEqual('./src-1.js');

      expect(entrySecondRun.length).toEqual(3);
      expect(entrySecondRun[2]).toEqual('./src-2.js');
    }
  });

  it('should preserves asynchronous dynamic entry points', async () => {
    let i = 0;
    const webpackOptions = {
      // simulate async dynamic entry
      entry: () =>
        new Promise((resolve) => {
          i += 1;
          resolve(`./src-${i}.js`);
        }),
    };
    const compiler = webpack(webpackOptions);

    const devServerOptions = {
      hot: true,
      client: {
        transport: 'sockjs',
        webSocketURL: {},
      },
      webSocketServer: {
        type: 'sockjs',
        options: {
          host: '0.0.0.0',
        },
      },
    };

    const plugin = new DevServerPlugin(devServerOptions);
    plugin.apply(compiler);

    const entries = await getEntries(compiler);
    expect(typeof entries).toEqual('function');

    const entryFirstRun = await entries();
    const entrySecondRun = await entries();
    if (isWebpack5) {
      expect(entryFirstRun.main.import.length).toEqual(1);
      expect(entryFirstRun.main.import[0]).toEqual('./src-1.js');

      expect(entrySecondRun.main.import.length).toEqual(1);
      expect(entrySecondRun.main.import[0]).toEqual('./src-2.js');
    } else {
      expect(entryFirstRun.length).toEqual(3);
      expect(entryFirstRun[2]).toEqual('./src-1.js');

      expect(entrySecondRun.length).toEqual(3);
      expect(entrySecondRun[2]).toEqual('./src-2.js');
    }
  });

  it("should doesn't add the HMR plugin if not hot and no plugins", () => {
    const webpackOptions = { ...config };
    const compiler = webpack(webpackOptions);
    const devServerOptions = {
      client: {
        transport: 'sockjs',
        webSocketURL: {},
      },
      webSocketServer: {
        type: 'sockjs',
        options: {
          host: '0.0.0.0',
        },
      },
    };

    const plugin = new DevServerPlugin(devServerOptions);
    plugin.apply(compiler);

    expect('plugins' in webpackOptions).toBeFalsy();
  });

  it("should doesn't add the HMR plugin if not hot and empty plugins", () => {
    const webpackOptions = { ...config, plugins: [] };
    const compiler = webpack(webpackOptions);
    const devServerOptions = {
      client: {
        transport: 'sockjs',
        webSocketURL: {},
      },
      webSocketServer: {
        type: 'sockjs',
        options: {
          host: '0.0.0.0',
        },
      },
    };

    const plugin = new DevServerPlugin(devServerOptions);
    plugin.apply(compiler);

    expect(webpackOptions.plugins).toEqual([]);
  });

  it("should doesn't add the HMR plugin if not hot and some plugins", () => {
    const existingPlugin1 = new webpack.BannerPlugin('happy birthday');
    const existingPlugin2 = new webpack.DefinePlugin({ foo: 'bar' });
    const webpackOptions = {
      ...config,
      plugins: [existingPlugin1, existingPlugin2],
    };
    const compiler = webpack(webpackOptions);
    const devServerOptions = {
      client: {
        transport: 'sockjs',
        webSocketURL: {},
      },
      webSocketServer: {
        type: 'sockjs',
        options: {
          host: '0.0.0.0',
        },
      },
    };

    const plugin = new DevServerPlugin(devServerOptions);
    plugin.apply(compiler);

    expect(webpackOptions.plugins).toEqual([existingPlugin1, existingPlugin2]);
  });

  it("should doesn't add the HMR plugin again if it's already there", () => {
    const existingPlugin = new webpack.BannerPlugin('bruce');
    const webpackOptions = {
      ...config,
      plugins: [new webpack.HotModuleReplacementPlugin(), existingPlugin],
    };
    const compiler = webpack(webpackOptions);
    const devServerOptions = {
      hot: true,
      client: {
        transport: 'sockjs',
        webSocketURL: {},
      },
      webSocketServer: {
        type: 'sockjs',
        options: {
          host: '0.0.0.0',
        },
      },
    };

    const plugin = new DevServerPlugin(devServerOptions);
    plugin.apply(compiler);

    expect(webpackOptions.plugins).toEqual([
      new webpack.HotModuleReplacementPlugin(),
      existingPlugin,
    ]);
  });

  (isWebpack5 ? it.skip : it)(
    'should can prevent duplicate entries from successive calls',
    async () => {
      const webpackOptions = { ...config };
      const compiler = webpack(webpackOptions);
      const devServerOptions = {
        hot: true,
        client: {
          transport: 'sockjs',
          webSocketURL: {},
        },
        webSocketServer: {
          type: 'sockjs',
          options: {
            host: '0.0.0.0',
          },
        },
      };

      const plugin = new DevServerPlugin(devServerOptions);
      plugin.apply(compiler);
      plugin.apply(compiler);
      const entries = await getEntries(compiler);

      expect(entries.length).toEqual(3);

      const result = entries.filter((entry) =>
        normalize(entry).includes('webpack/hot/dev-server')
      );
      expect(result.length).toEqual(1);
    }
  );

  it('should supports entry as Function', async () => {
    const webpackOptions = { ...configEntryAsFunction };
    const compiler = webpack(webpackOptions);
    const devServerOptions = {
      client: {
        transport: 'sockjs',
        webSocketURL: {},
      },
      webSocketServer: {
        type: 'sockjs',
        options: {
          host: '0.0.0.0',
        },
      },
    };

    const plugin = new DevServerPlugin(devServerOptions);
    plugin.apply(compiler);
    const entries = await getEntries(compiler);

    expect(typeof entries === 'function').toBe(true);
  });

  // 'npm run prepare' must be done for this test to pass
  const sockjsClientPath = require.resolve(
    '../../../client/clients/SockJSClient'
  );

  describe('getWebsocketTransport', () => {
    it("should work with client.transport: 'sockjs'", () => {
      let result;

      expect(() => {
        const devServerPlugin = new DevServerPlugin({
          client: {
            transport: 'sockjs',
          },
          webSocketServer: 'sockjs',
        });

        result = devServerPlugin.getWebsocketTransport();
      }).not.toThrow();

      expect(result).toEqual(sockjsClientPath);
    });

    it('should work with client.transport: SockJSClient full path', () => {
      let result;

      expect(() => {
        const devServerPlugin = new DevServerPlugin({
          client: {
            transport: sockjsClientPath,
          },
          webSocketServer: 'sockjs',
        });

        result = devServerPlugin.getWebsocketTransport();
      }).not.toThrow();

      expect(result).toEqual(sockjsClientPath);
    });

    it('should throw with client.transport: bad path', () => {
      expect(() => {
        const devServerPlugin = new DevServerPlugin({
          client: {
            transport: '/bad/path/to/implementation',
          },
          webSocketServer: 'sockjs',
        });

        devServerPlugin.getWebsocketTransport();
      }).toThrow(/client.transport must be a string/);
    });

    it('should throw with transportMode.client: bad type', () => {
      expect(() => {
        const devServerPlugin = new DevServerPlugin({
          client: {
            transport: 1,
          },
          webSocketServer: 'sockjs',
        });

        devServerPlugin.getWebsocketTransport();
      }).toThrow(/client.transport must be a string/);
    });

    it('should throw with client.transport: unimplemented client', () => {
      expect(() => {
        const devServerPlugin = new DevServerPlugin({
          client: {
            transport: 'foo',
          },
          webSocketServer: 'sockjs',
        });

        devServerPlugin.getWebsocketTransport();
      }).toThrow(
        'When you use custom web socket implementation you must explicitly specify client.transport'
      );
    });
  });
});
