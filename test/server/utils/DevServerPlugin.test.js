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

  it('should preserves dynamic entry points', (done) => {
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
      client: {
        transport: 'sockjs',
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
    getEntries(compiler).then((entries) => {
      expect(typeof entries).toEqual('function');

      entries()
        .then((entryFirstRun) =>
          entries().then((entrySecondRun) => {
            if (isWebpack5) {
              expect(entryFirstRun.main.import.length).toEqual(1);
              expect(entryFirstRun.main.import[0]).toEqual('./src-1.js');

              expect(entrySecondRun.main.import.length).toEqual(1);
              expect(entrySecondRun.main.import[0]).toEqual('./src-2.js');
            } else {
              expect(entryFirstRun.length).toEqual(2);
              expect(entryFirstRun[1]).toEqual('./src-1.js');

              expect(entrySecondRun.length).toEqual(2);
              expect(entrySecondRun[1]).toEqual('./src-2.js');
            }
            done();
          })
        )
        .catch(done);
    });
  });

  it('should preserves asynchronous dynamic entry points', (done) => {
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
      client: {
        transport: 'sockjs',
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
    getEntries(compiler).then((entries) => {
      expect(typeof entries).toEqual('function');

      entries()
        .then((entryFirstRun) =>
          entries().then((entrySecondRun) => {
            if (isWebpack5) {
              expect(entryFirstRun.main.import.length).toEqual(1);
              expect(entryFirstRun.main.import[0]).toEqual('./src-1.js');

              expect(entrySecondRun.main.import.length).toEqual(1);
              expect(entrySecondRun.main.import[0]).toEqual('./src-2.js');
            } else {
              expect(entryFirstRun.length).toEqual(2);
              expect(entryFirstRun[1]).toEqual('./src-1.js');

              expect(entrySecondRun.length).toEqual(2);
              expect(entrySecondRun[1]).toEqual('./src-2.js');
            }
            done();
          })
        )
        .catch(done);
    });
  });

  it("should doesn't add the HMR plugin if not hot and no plugins", () => {
    const webpackOptions = Object.assign({}, config);
    const compiler = webpack(webpackOptions);
    const devServerOptions = {
      client: {
        transport: 'sockjs',
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
    const webpackOptions = Object.assign({}, config, { plugins: [] });
    const compiler = webpack(webpackOptions);
    const devServerOptions = {
      client: {
        transport: 'sockjs',
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
    const webpackOptions = Object.assign({}, config, {
      plugins: [existingPlugin1, existingPlugin2],
    });
    const compiler = webpack(webpackOptions);
    const devServerOptions = {
      client: {
        transport: 'sockjs',
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
    const webpackOptions = Object.assign({}, config, {
      plugins: [new webpack.HotModuleReplacementPlugin(), existingPlugin],
    });
    const compiler = webpack(webpackOptions);
    const devServerOptions = {
      hot: true,
      client: {
        transport: 'sockjs',
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
      const webpackOptions = Object.assign({}, config);
      const compiler = webpack(webpackOptions);
      const devServerOptions = {
        hot: true,
        client: {
          transport: 'sockjs',
          hotEntry: true,
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
    const webpackOptions = Object.assign({}, configEntryAsFunction);
    const compiler = webpack(webpackOptions);
    const devServerOptions = {
      client: {
        transport: 'sockjs',
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
});
