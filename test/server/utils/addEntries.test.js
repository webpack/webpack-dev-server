'use strict';

const path = require('path');
const webpack = require('webpack');
const addEntries = require('../../../lib/utils/addEntries');
const isWebpack5 = require('../../helpers/isWebpack5');
const config = require('./../../fixtures/simple-config/webpack.config');
const configEntryAsFunction = require('./../../fixtures/entry-as-function/webpack.config');
const configEntryAsDescriptor = require('./../../fixtures/entry-as-descriptor/webpack.config');

const normalize = (entry) => entry.split(path.sep).join('/');

describe('addEntries util', () => {
  function getEntries(compiler) {
    const entryOption = compiler.options.entry;
    if (isWebpack5) {
      const entries = [];
      const entryPlugin = compiler.options.plugins.find(
        (plugin) => plugin.constructor.name === 'DevServerEntryPlugin'
      );
      if (entryPlugin) {
        entries.push(...entryPlugin.entries);
      }

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

  it('should adds devServer entry points to a single entry point', () => {
    const webpackOptions = Object.assign({}, config);
    const compiler = webpack(webpackOptions);
    const devServerOptions = {};

    addEntries(compiler, devServerOptions);
    const entries = getEntries(compiler);

    expect(entries.length).toEqual(2);
    expect(
      normalize(entries[0]).indexOf('client/default/index.js?') !== -1
    ).toBeTruthy();
    expect(normalize(entries[1])).toEqual('./foo.js');
  });

  it('should adds devServer entry points to a multi-module entry point', () => {
    const webpackOptions = Object.assign({}, config, {
      entry: ['./foo.js', './bar.js'],
    });
    const compiler = webpack(webpackOptions);

    const devServerOptions = {};

    addEntries(compiler, devServerOptions);
    const entries = getEntries(compiler);

    expect(entries.length).toEqual(3);
    expect(
      normalize(entries[0]).indexOf('client/default/index.js?') !== -1
    ).toBeTruthy();
    expect(entries[1]).toEqual('./foo.js');
    expect(entries[2]).toEqual('./bar.js');
  });

  it('should adds devServer entry points to a multi entry point object', () => {
    const webpackOptions = Object.assign({}, config, {
      entry: {
        foo: './foo.js',
        bar: './bar.js',
      },
    });
    const compiler = webpack(webpackOptions);

    const devServerOptions = {};

    addEntries(compiler, devServerOptions);
    const entries = getEntries(compiler);

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

  it('should set defaults to src if no entry point is given', () => {
    const webpackOptions = {};
    const compiler = webpack(webpackOptions);
    const devServerOptions = {};

    addEntries(compiler, devServerOptions);
    const entries = getEntries(compiler);

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
    const devServerOptions = {};

    addEntries(compiler, devServerOptions);
    const entries = getEntries(compiler);

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

    const devServerOptions = {};

    addEntries(compiler, devServerOptions);
    const entries = getEntries(compiler);

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

  it("should prepends webpack's hot reload client script", () => {
    const webpackOptions = Object.assign({}, config, {
      entry: {
        app: './app.js',
      },
    });
    const compiler = webpack(webpackOptions);

    const devServerOptions = {
      hot: true,
    };

    addEntries(compiler, devServerOptions);
    const entries = getEntries(compiler);

    const hotClientScript = (isWebpack5 ? entries : entries.app)[1];

    expect(
      normalize(hotClientScript).includes('webpack/hot/dev-server')
    ).toBeTruthy();
    expect(hotClientScript).toEqual(require.resolve(hotClientScript));
  });

  it("should prepends webpack's hot-only client script", () => {
    const webpackOptions = Object.assign({}, config, {
      entry: {
        app: './app.js',
      },
    });
    const compiler = webpack(webpackOptions);

    const devServerOptions = {
      hot: 'only',
    };

    addEntries(compiler, devServerOptions);
    const entries = getEntries(compiler);

    const hotClientScript = (isWebpack5 ? entries : entries.app)[1];

    expect(
      normalize(hotClientScript).includes('webpack/hot/only-dev-server')
    ).toBeTruthy();
    expect(hotClientScript).toEqual(require.resolve(hotClientScript));
  });

  it("should doesn't add the HMR plugin if not hot and no plugins", () => {
    const webpackOptions = Object.assign({}, config);
    const compiler = webpack(webpackOptions);
    const devServerOptions = {};

    addEntries(compiler, devServerOptions);

    expect('plugins' in webpackOptions).toBeFalsy();
  });

  it("should doesn't add the HMR plugin if not hot and empty plugins", () => {
    const webpackOptions = Object.assign({}, config, { plugins: [] });
    const compiler = webpack(webpackOptions);
    const devServerOptions = {};

    addEntries(compiler, devServerOptions);

    expect(webpackOptions.plugins).toEqual([]);
  });

  it("should doesn't add the HMR plugin if not hot and some plugins", () => {
    const existingPlugin1 = new webpack.BannerPlugin('happy birthday');
    const existingPlugin2 = new webpack.DefinePlugin({ foo: 'bar' });
    const webpackOptions = Object.assign({}, config, {
      plugins: [existingPlugin1, existingPlugin2],
    });
    const compiler = webpack(webpackOptions);
    const devServerOptions = {};

    addEntries(compiler, devServerOptions);

    expect(webpackOptions.plugins).toEqual([existingPlugin1, existingPlugin2]);
  });

  it('should adds the HMR plugin if hot', () => {
    const existingPlugin = new webpack.BannerPlugin('bruce');
    const webpackOptions = Object.assign({}, config, {
      plugins: [existingPlugin],
    });
    const compiler = webpack(webpackOptions);
    const devServerOptions = { hot: true };

    addEntries(compiler, devServerOptions);

    expect(compiler.options.plugins).toContainEqual(existingPlugin);
    expect(compiler.options.plugins).toContainEqual(
      new webpack.HotModuleReplacementPlugin()
    );
  });

  it('should adds the HMR plugin if hot-only', () => {
    const webpackOptions = Object.assign({}, config);
    const compiler = webpack(webpackOptions);
    const devServerOptions = { hot: 'only' };

    addEntries(compiler, devServerOptions);

    expect(compiler.options.plugins).toContainEqual(
      new webpack.HotModuleReplacementPlugin()
    );
  });

  it("should doesn't add the HMR plugin again if it's already there", () => {
    const existingPlugin = new webpack.BannerPlugin('bruce');
    const webpackOptions = Object.assign({}, config, {
      plugins: [new webpack.HotModuleReplacementPlugin(), existingPlugin],
    });
    const compiler = webpack(webpackOptions);
    const devServerOptions = { hot: true };

    addEntries(compiler, devServerOptions);

    expect(webpackOptions.plugins).toEqual([
      new webpack.HotModuleReplacementPlugin(),
      existingPlugin,
    ]);
  });

  it("should not add the HMR plugin again if it's already there from a different webpack", () => {
    const existingPlugin = new webpack.BannerPlugin('bruce');

    // Simulate the inclusion of another webpack's HotModuleReplacementPlugin
    class HotModuleReplacementPlugin {
      // eslint-disable-next-line class-methods-use-this
      apply() {}
    }

    const webpackOptions = Object.assign({}, config, {
      plugins: [new HotModuleReplacementPlugin(), existingPlugin],
    });
    const compiler = webpack(webpackOptions);
    const devServerOptions = { hot: true };

    addEntries(compiler, devServerOptions);

    expect(webpackOptions.plugins).toEqual([
      // Nothing should be injected
      new HotModuleReplacementPlugin(),
      existingPlugin,
    ]);
  });

  it('should can prevent duplicate entries from successive calls', () => {
    const webpackOptions = Object.assign({}, config);
    const compiler = webpack(webpackOptions);
    const devServerOptions = { hot: true };

    addEntries(compiler, devServerOptions);
    addEntries(compiler, devServerOptions);
    const entries = getEntries(compiler);

    expect(entries.length).toEqual(3);

    const result = entries.filter((entry) =>
      normalize(entry).includes('webpack/hot/dev-server')
    );
    expect(result.length).toEqual(1);
  });

  it('should supports entry as Function', () => {
    const webpackOptions = Object.assign({}, configEntryAsFunction);
    const compiler = webpack(webpackOptions);
    const devServerOptions = {};

    addEntries(compiler, devServerOptions);
    const entries = getEntries(compiler);

    expect(typeof entries === 'function').toBe(true);
  });

  (isWebpack5 ? it : it.skip)('should supports entry as descriptor', () => {
    const webpackOptions = Object.assign({}, configEntryAsDescriptor);
    const compiler = webpack(webpackOptions);
    const devServerOptions = {};

    addEntries(compiler, devServerOptions);
    const entries = getEntries(compiler);

    expect(entries.length).toEqual(2);
    expect(
      normalize(entries[0]).indexOf('client/default/index.js?') !== -1
    ).toBeTruthy();
    expect(normalize(entries[1])).toEqual('./foo.js');
  });

  it('should only prepends devServer entry points to web targets by default', () => {
    const webpackOptions = [
      Object.assign({}, config),
      Object.assign({ target: 'web' }, config),
      Object.assign({ target: 'webworker' }, config),
      Object.assign({ target: 'electron-renderer' }, config),
      Object.assign({ target: 'node-webkit' }, config),
      Object.assign({ target: 'node' }, config) /* index:5 */,
    ];
    const compiler = webpack(webpackOptions);

    const devServerOptions = {};

    addEntries(compiler, devServerOptions);

    // eslint-disable-next-line no-shadow
    compiler.compilers.forEach((compiler, index) => {
      const entries = getEntries(compiler);
      const expectInline = index !== 5; /* all but the node target */

      expect(entries.length).toEqual(expectInline ? 2 : 1);

      if (expectInline) {
        expect(
          normalize(entries[0]).indexOf('client/default/index.js?') !== -1
        ).toBeTruthy();
      }

      expect(normalize(entries[expectInline ? 1 : 0])).toEqual('./foo.js');
    });
  });

  (isWebpack5 ? it : it.skip)(
    'should prepend devServer entry points depending on targetProperties',
    () => {
      // https://github.com/webpack/webpack/issues/11660
      const configDisableChunkLoading = Object.assign({}, config);
      configDisableChunkLoading.output = Object.assign({}, config.output, {
        chunkLoading: false,
        wasmLoading: false,
        workerChunkLoading: false,
      });

      const webpackOptions = [
        Object.assign(
          { target: ['web', 'webworker'] },
          configDisableChunkLoading
        ),
        Object.assign({ target: 'browserslist:last 2 versions' }, config),
        Object.assign({ target: ['web', 'node'] }, configDisableChunkLoading),
        Object.assign(
          { target: 'browserslist:last 2 versions, maintained node versions' },
          configDisableChunkLoading
        ),
        Object.assign(
          { target: 'browserslist:maintained node versions' },
          config
        ) /* index:4 */,
        Object.assign({ target: false }, config),
      ];
      const compiler = webpack(webpackOptions);

      const devServerOptions = {};

      addEntries(compiler, devServerOptions);

      // eslint-disable-next-line no-shadow
      compiler.compilers.forEach((compiler, index) => {
        const entries = getEntries(compiler);
        const expectInline = index < 4;

        expect(entries.length).toEqual(expectInline ? 2 : 1);

        if (expectInline) {
          expect(
            normalize(entries[0]).indexOf('client/default/index.js?') !== -1
          ).toBeTruthy();
        }

        expect(normalize(entries[expectInline ? 1 : 0])).toEqual('./foo.js');
      });
    }
  );

  it('should allows selecting compilations to inline the client into', () => {
    const webpackOptions = [
      Object.assign({}, config),
      Object.assign({ target: 'web' }, config),
      Object.assign({ name: 'only-include' }, config) /* index:2 */,
      Object.assign({ target: 'node' }, config),
    ];
    const compiler = webpack(webpackOptions);

    const devServerOptions = {
      injectClient: (compilerConfig) => compilerConfig.name === 'only-include',
    };

    addEntries(compiler, devServerOptions);

    // eslint-disable-next-line no-shadow
    compiler.compilers.forEach((compiler, index) => {
      const entries = getEntries(compiler);
      const expectInline = index === 2; /* only the "only-include" compiler */

      expect(entries.length).toEqual(expectInline ? 2 : 1);

      if (expectInline) {
        expect(
          normalize(entries[0]).indexOf('client/default/index.js?') !== -1
        ).toBeTruthy();
      }

      expect(normalize(entries[expectInline ? 1 : 0])).toEqual('./foo.js');
    });
  });

  it('should prepends the hot runtime to all targets by default (when hot)', () => {
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
    };

    addEntries(compiler, devServerOptions);

    // eslint-disable-next-line no-shadow
    compiler.compilers.forEach((compiler) => {
      const entries = getEntries(compiler);
      expect(entries.length).toEqual(2);

      expect(
        normalize(entries[0]).includes('webpack/hot/dev-server')
      ).toBeTruthy();

      expect(normalize(entries[1])).toEqual('./foo.js');
    });
  });

  it('should allows selecting which compilations to inject the hot runtime into', () => {
    const webpackOptions = [
      Object.assign({ target: 'web' }, config),
      Object.assign({ target: 'node' }, config),
    ];
    const compiler = webpack(webpackOptions);

    const devServerOptions = {
      injectHot: (compilerConfig) => compilerConfig.target === 'node',
      hot: true,
    };

    addEntries(compiler, devServerOptions);

    // node target should have the client runtime but not the hot runtime
    const webEntries = getEntries(compiler.compilers[0]);

    expect(webEntries.length).toEqual(2);

    expect(
      normalize(webEntries[0]).indexOf('client/default/index.js?') !== -1
    ).toBeTruthy();

    expect(normalize(webEntries[1])).toEqual('./foo.js');

    // node target should have the hot runtime but not the client runtime
    const nodeEntries = getEntries(compiler.compilers[1]);

    expect(nodeEntries.length).toEqual(2);

    expect(
      normalize(nodeEntries[0]).includes('webpack/hot/dev-server')
    ).toBeTruthy();

    expect(normalize(nodeEntries[1])).toEqual('./foo.js');
  });

  it('does not use client.path when default', () => {
    const webpackOptions = Object.assign({}, config);
    const compiler = webpack(webpackOptions);
    const devServerOptions = {
      client: {
        path: '/ws',
      },
    };

    addEntries(compiler, devServerOptions);
    const entries = getEntries(compiler);
    expect(entries[0]).not.toContain('&path=/ws');
  });

  it('uses custom client.path', () => {
    const webpackOptions = Object.assign({}, config);
    const compiler = webpack(webpackOptions);
    const devServerOptions = {
      client: {
        path: '/custom/path',
      },
    };

    addEntries(compiler, devServerOptions);
    const entries = getEntries(compiler);
    expect(entries[0]).toContain('&path=/custom/path');
  });

  it('uses custom client', () => {
    const webpackOptions = Object.assign({}, config);
    const compiler = webpack(webpackOptions);
    const devServerOptions = {
      client: {
        host: 'my.host',
        port: 8080,
        path: '/custom/path',
      },
    };

    addEntries(compiler, devServerOptions);
    const entries = getEntries(compiler);
    expect(entries[0]).toContain('&host=my.host&path=/custom/path&port=8080');
  });
});
