'use strict';

const path = require('path');
const webpack = require('webpack');
const DevServerPlugin = require('../../../lib/utils/DevServerPlugin');
const isWebpack5 = require('../../helpers/isWebpack5');
const config = require('../../fixtures/simple-config/webpack.config');
const configEntryAsFunction = require('../../fixtures/entry-as-function/webpack.config');
const configEntryAsDescriptor = require('../../fixtures/entry-as-descriptor/webpack.config');

const normalize = (entry) => entry.split(path.sep).join('/');

describe('DevServerPlugin util', () => {
  async function getEntries(compiler) {
    const entryOption = compiler.options.entry;
    if (isWebpack5) {
      const entries = [];

      const compilation = {
        addEntry(_context, dep, _options, cb) {
          if (!dep.loc.name) {
            entries.push(dep.request);
          }
          cb();
        },
      };
      await Promise.all(
        compiler.hooks.make.taps
          .filter((tap) => tap.name === 'DevServerPlugin')
          .map((tap) => tap.fn(compilation))
      );

      // normalize entry descriptors
      if (typeof entryOption === 'function') {
        // merge entries into the dynamic entry function
        Object.assign(entryOption, entries);
        return entryOption;
      } else if (entryOption.main) {
        entries.push(...entryOption.main.import);
      }
      // merge named exports into entries
      Object.assign(entries, entryOption);
      return entries;
    }
    return entryOption;
  }

  (isWebpack5 ? it : it.skip)('should add hooks to add entries', async () => {
    const tapPromise = jest.fn();
    const compiler = {
      options: {},
      hooks: {
        compilation: {
          tap: jest.fn(),
        },
        make: {
          tapPromise,
        },
      },
    };
    const devServerOptions = {
      transportMode: {
        server: 'sockjs',
        client: 'sockjs',
      },
    };
    const compilation = {
      addEntry: jest.fn((_context, _dep, _options, cb) => cb()),
    };

    const plugin = new DevServerPlugin(devServerOptions);
    plugin.apply(compiler);
    expect(tapPromise).toBeCalledTimes(1);
    expect(tapPromise.mock.calls[0]).toMatchInlineSnapshot(`
      Array [
        "DevServerPlugin",
        [Function],
      ]
    `);

    await tapPromise.mock.calls[0][1](compilation);
    expect(compilation.addEntry).toBeCalledTimes(1);
  });

  it('should adds devServer entry points to a single entry point', async () => {
    const webpackOptions = Object.assign({}, config);
    const compiler = webpack(webpackOptions);
    const devServerOptions = {
      transportMode: {
        server: 'sockjs',
        client: 'sockjs',
      },
    };

    const plugin = new DevServerPlugin(devServerOptions);
    plugin.apply(compiler);
    const entries = await getEntries(compiler);

    expect(entries.length).toEqual(2);
    expect(
      normalize(entries[0]).indexOf('client/default/index.js?') !== -1
    ).toBeTruthy();
    expect(normalize(entries[1])).toEqual('./foo.js');
  });

  it('should adds devServer entry points to a multi-module entry point', async () => {
    const webpackOptions = Object.assign({}, config, {
      entry: ['./foo.js', './bar.js'],
    });
    const compiler = webpack(webpackOptions);

    const devServerOptions = {
      transportMode: {
        server: 'sockjs',
        client: 'sockjs',
      },
    };

    const plugin = new DevServerPlugin(devServerOptions);
    plugin.apply(compiler);
    const entries = await getEntries(compiler);

    expect(entries.length).toEqual(3);
    expect(
      normalize(entries[0]).indexOf('client/default/index.js?') !== -1
    ).toBeTruthy();
    expect(entries[1]).toEqual('./foo.js');
    expect(entries[2]).toEqual('./bar.js');
  });

  it('should adds devServer entry points to a multi entry point object', async () => {
    const webpackOptions = Object.assign({}, config, {
      entry: {
        foo: './foo.js',
        bar: './bar.js',
      },
    });
    const compiler = webpack(webpackOptions);

    const devServerOptions = {
      transportMode: {
        server: 'sockjs',
        client: 'sockjs',
      },
    };

    const plugin = new DevServerPlugin(devServerOptions);
    plugin.apply(compiler);
    const entries = await getEntries(compiler);

    if (isWebpack5) {
      expect(entries.length).toEqual(1);
      expect(
        normalize(entries[0]).indexOf('client/default/index.js?') !== -1
      ).toBeTruthy();

      expect(entries.foo.import.length).toEqual(1);
      expect(entries.foo.import[0]).toEqual('./foo.js');
      expect(entries.bar.import[0]).toEqual('./bar.js');
    } else {
      expect(entries.foo.length).toEqual(2);

      expect(
        normalize(entries.foo[0]).indexOf('client/default/index.js?') !== -1
      ).toBeTruthy();
      expect(entries.foo[1]).toEqual('./foo.js');
      expect(entries.bar[1]).toEqual('./bar.js');
    }
  });

  it('should set defaults to src if no entry point is given', async () => {
    const webpackOptions = {};
    const compiler = webpack(webpackOptions);
    const devServerOptions = {
      transportMode: {
        server: 'sockjs',
        client: 'sockjs',
      },
    };

    const plugin = new DevServerPlugin(devServerOptions);
    plugin.apply(compiler);
    const entries = await getEntries(compiler);

    expect(entries.length).toEqual(2);
    expect(entries[1]).toEqual('./src');
  });

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
      transportMode: {
        server: 'sockjs',
        client: 'sockjs',
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
      transportMode: {
        server: 'sockjs',
        client: 'sockjs',
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

  it("should prepends webpack's hot reload client script", async () => {
    const webpackOptions = Object.assign({}, config, {
      entry: {
        app: './app.js',
      },
    });
    const compiler = webpack(webpackOptions);

    const devServerOptions = {
      hot: true,
      transportMode: {
        server: 'sockjs',
        client: 'sockjs',
      },
    };

    const plugin = new DevServerPlugin(devServerOptions);
    plugin.apply(compiler);
    const entries = await getEntries(compiler);

    const hotClientScript = (isWebpack5 ? entries : entries.app)[1];

    expect(
      normalize(hotClientScript).includes('webpack/hot/dev-server')
    ).toBeTruthy();
    expect(hotClientScript).toEqual(require.resolve(hotClientScript));
  });

  it("should prepends webpack's hot-only client script", async () => {
    const webpackOptions = Object.assign({}, config, {
      entry: {
        app: './app.js',
      },
    });
    const compiler = webpack(webpackOptions);

    const devServerOptions = {
      hot: 'only',
      transportMode: {
        server: 'sockjs',
        client: 'sockjs',
      },
    };

    const plugin = new DevServerPlugin(devServerOptions);
    plugin.apply(compiler);
    const entries = await getEntries(compiler);

    const hotClientScript = (isWebpack5 ? entries : entries.app)[1];

    expect(
      normalize(hotClientScript).includes('webpack/hot/only-dev-server')
    ).toBeTruthy();
    expect(hotClientScript).toEqual(require.resolve(hotClientScript));
  });

  it("should doesn't add the HMR plugin if not hot and no plugins", () => {
    const webpackOptions = Object.assign({}, config);
    const compiler = webpack(webpackOptions);
    const devServerOptions = {
      transportMode: {
        server: 'sockjs',
        client: 'sockjs',
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
      transportMode: {
        server: 'sockjs',
        client: 'sockjs',
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
      transportMode: {
        server: 'sockjs',
        client: 'sockjs',
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
      transportMode: {
        server: 'sockjs',
        client: 'sockjs',
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
        transportMode: {
          server: 'sockjs',
          client: 'sockjs',
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
      transportMode: {
        server: 'sockjs',
        client: 'sockjs',
      },
    };

    const plugin = new DevServerPlugin(devServerOptions);
    plugin.apply(compiler);
    const entries = await getEntries(compiler);

    expect(typeof entries === 'function').toBe(true);
  });

  (isWebpack5 ? it : it.skip)(
    'should supports entry as descriptor',
    async () => {
      const webpackOptions = Object.assign({}, configEntryAsDescriptor);
      const compiler = webpack(webpackOptions);
      const devServerOptions = {
        transportMode: {
          server: 'sockjs',
          client: 'sockjs',
        },
      };

      const plugin = new DevServerPlugin(devServerOptions);
      plugin.apply(compiler);
      const entries = await getEntries(compiler);

      expect(entries.length).toEqual(2);
      expect(
        normalize(entries[0]).indexOf('client/default/index.js?') !== -1
      ).toBeTruthy();
      expect(normalize(entries[1])).toEqual('./foo.js');
    }
  );

  it('should only prepends devServer entry points to web targets by default', async () => {
    const webpackOptions = [
      Object.assign({}, config),
      Object.assign({ target: 'web' }, config),
      Object.assign({ target: 'webworker' }, config),
      Object.assign({ target: 'electron-renderer' }, config),
      Object.assign({ target: 'node-webkit' }, config),
      Object.assign({ target: 'node' }, config) /* index:5 */,
    ];
    const compiler = webpack(webpackOptions);

    const devServerOptions = {
      transportMode: {
        server: 'sockjs',
        client: 'sockjs',
      },
    };

    await Promise.all(
      // eslint-disable-next-line no-shadow
      compiler.compilers.map((compiler, index) => {
        const plugin = new DevServerPlugin(devServerOptions);
        plugin.apply(compiler);

        return getEntries(compiler).then((entries) => {
          const expectInline = index !== 5; /* all but the node target */

          expect(entries.length).toEqual(expectInline ? 2 : 1);

          if (expectInline) {
            expect(
              normalize(entries[0]).indexOf('client/default/index.js?') !== -1
            ).toBeTruthy();
          }

          expect(normalize(entries[expectInline ? 1 : 0])).toEqual('./foo.js');
        });
      })
    );
  });

  (isWebpack5 ? it : it.skip)(
    'should prepend devServer entry points depending on targetProperties',
    async () => {
      // https://github.com/webpack/webpack/issues/11660
      const configNoChunkLoading = Object.assign({}, config);
      configNoChunkLoading.output = Object.assign(
        {
          chunkLoading: false,
          wasmLoading: false,
          workerChunkLoading: false,
        },
        config.output
      );

      const webpackOptions = [
        Object.assign({ target: ['web', 'webworker'] }, configNoChunkLoading),
        Object.assign({ target: 'browserslist:last 2 versions' }, config),
        Object.assign({ target: ['web', 'node'] }, configNoChunkLoading),
        Object.assign(
          { target: 'browserslist:last 2 versions, maintained node versions' },
          configNoChunkLoading
        ),
        Object.assign(
          { target: 'browserslist:maintained node versions' },
          config
        ),
        Object.assign({ target: false }, config),
      ];
      const compiler = webpack(webpackOptions);

      const devServerOptions = {
        transportMode: {
          server: 'sockjs',
          client: 'sockjs',
        },
      };

      await Promise.all(
        // eslint-disable-next-line no-shadow
        compiler.compilers.map((compiler, index) => {
          const plugin = new DevServerPlugin(devServerOptions);
          plugin.apply(compiler);

          return getEntries(compiler).then((entries) => {
            const expectInline = index < 2; /* all but the node target */

            expect(entries.length).toEqual(expectInline ? 2 : 1);

            if (expectInline) {
              expect(
                normalize(entries[0]).indexOf('client/default/index.js?') !== -1
              ).toBeTruthy();
            }

            expect(normalize(entries[expectInline ? 1 : 0])).toEqual(
              './foo.js'
            );
          });
        })
      );
    }
  );

  it('should allows selecting compilations to inline the client into', async () => {
    const webpackOptions = [
      Object.assign({}, config),
      Object.assign({ target: 'web' }, config),
      Object.assign({ name: 'only-include' }, config) /* index:2 */,
      Object.assign({ target: 'node' }, config),
    ];
    const compiler = webpack(webpackOptions);

    const devServerOptions = {
      injectClient: (compilerConfig) => compilerConfig.name === 'only-include',
      transportMode: {
        server: 'sockjs',
        client: 'sockjs',
      },
    };

    await Promise.all(
      // eslint-disable-next-line no-shadow
      compiler.compilers.map((compiler, index) => {
        const plugin = new DevServerPlugin(devServerOptions);
        plugin.apply(compiler);
        return getEntries(compiler).then((entries) => {
          const expectInline =
            index === 2; /* only the "only-include" compiler */

          expect(entries.length).toEqual(expectInline ? 2 : 1);

          if (expectInline) {
            expect(
              normalize(entries[0]).indexOf('client/default/index.js?') !== -1
            ).toBeTruthy();
          }

          expect(normalize(entries[expectInline ? 1 : 0])).toEqual('./foo.js');
        });
      })
    );
  });

  it('should prepends the hot runtime to all targets by default (when hot)', async () => {
    const webpackOptions = [
      Object.assign({ target: 'web' }, config),
      Object.assign({ target: 'node' }, config),
    ];
    const compiler = webpack(webpackOptions);

    const devServerOptions = {
      // disable inlining the client so entry indexes match up
      // and we can use the same assertions for both configs
      injectClient: false,
      hot: true,
      transportMode: {
        server: 'sockjs',
        client: 'sockjs',
      },
    };

    await Promise.all(
      // eslint-disable-next-line no-shadow
      compiler.compilers.map((compiler) => {
        const plugin = new DevServerPlugin(devServerOptions);
        plugin.apply(compiler);

        return getEntries(compiler).then((entries) => {
          expect(entries.length).toEqual(2);

          expect(
            normalize(entries[0]).includes('webpack/hot/dev-server')
          ).toBeTruthy();

          expect(normalize(entries[1])).toEqual('./foo.js');
        });
      })
    );
  });

  it('should allows selecting which compilations to inject the hot runtime into', async () => {
    const webpackOptions = [
      Object.assign({ target: 'web' }, config),
      Object.assign({ target: 'node' }, config),
    ];
    const compiler = webpack(webpackOptions);

    const devServerOptions = {
      injectHot: (compilerConfig) => compilerConfig.target === 'node',
      hot: true,
      transportMode: {
        server: 'sockjs',
        client: 'sockjs',
      },
    };

    // eslint-disable-next-line no-shadow
    compiler.compilers.forEach((compiler) => {
      const plugin = new DevServerPlugin(devServerOptions);
      plugin.apply(compiler);
    });

    // node target should have the client runtime but not the hot runtime
    const webEntries = await getEntries(compiler.compilers[0]);

    expect(webEntries.length).toEqual(2);

    expect(
      normalize(webEntries[0]).indexOf('client/default/index.js?') !== -1
    ).toBeTruthy();

    expect(normalize(webEntries[1])).toEqual('./foo.js');

    // node target should have the hot runtime but not the client runtime
    const nodeEntries = await getEntries(compiler.compilers[1]);

    expect(nodeEntries.length).toEqual(2);

    expect(
      normalize(nodeEntries[0]).includes('webpack/hot/dev-server')
    ).toBeTruthy();

    expect(normalize(nodeEntries[1])).toEqual('./foo.js');
  });

  it('does not use client.path when default', async () => {
    const webpackOptions = Object.assign({}, config);
    const compiler = webpack(webpackOptions);
    const devServerOptions = {
      client: {
        path: '/ws',
      },
      transportMode: {
        server: 'sockjs',
        client: 'sockjs',
      },
    };

    const plugin = new DevServerPlugin(devServerOptions);
    plugin.apply(compiler);
    const entries = await getEntries(compiler);
    expect(entries[0]).not.toContain('&path=/ws');
  });

  it('uses custom client.path', async () => {
    const webpackOptions = Object.assign({}, config);
    const compiler = webpack(webpackOptions);
    const devServerOptions = {
      client: {
        path: '/custom/path',
      },
      transportMode: {
        server: 'sockjs',
        client: 'sockjs',
      },
    };

    const plugin = new DevServerPlugin(devServerOptions);
    plugin.apply(compiler);
    const entries = await getEntries(compiler);
    expect(entries[0]).toContain('&path=/custom/path');
  });

  it('uses custom client', async () => {
    const webpackOptions = Object.assign({}, config);
    const compiler = webpack(webpackOptions);
    const devServerOptions = {
      client: {
        host: 'my.host',
        port: 8080,
        path: '/custom/path',
      },
      transportMode: {
        server: 'sockjs',
        client: 'sockjs',
      },
    };

    const plugin = new DevServerPlugin(devServerOptions);
    plugin.apply(compiler);
    const entries = await getEntries(compiler);
    expect(entries[0]).toContain('&host=my.host&path=/custom/path&port=8080');
  });
});
