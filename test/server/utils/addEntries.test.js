'use strict';

const path = require('path');
const webpack = require('webpack');
const addEntries = require('../../../lib/utils/addEntries');
const isWebpack5 = require('../../helpers/isWebpack5');
const config = require('./../../fixtures/simple-config/webpack.config');
const configEntryAsFunction = require('./../../fixtures/entry-as-function/webpack.config');

const normalize = (entry) => entry.split(path.sep).join('/');

const nextTick = () => {
  return new Promise((fulfill) => {
    process.nextTick(fulfill);
  });
};

describe('addEntries util', () => {
  const checkEntriesWebpack5 = async (
    compiler,
    devServerOptions,
    isInjectedCompiler
  ) => {
    const deps = [];
    const compilers = compiler.compilers || [compiler];
    compilers.forEach((comp) => {
      comp.hooks.make.tapAsync = jest.fn();
    });
    addEntries(compiler, devServerOptions);

    for (let i = 0; i < compilers.length; i++) {
      if (isInjectedCompiler && !isInjectedCompiler(i)) {
        deps.push([]);
      } else {
        const depsSubArr = [];
        const comp = compilers[i];
        const makeHook = comp.hooks.make.tapAsync;
        expect(makeHook.mock.calls.length).toEqual(1);
        const cb = makeHook.mock.calls[0][1];
        const addEntryMock = jest.fn();
        const compilation = {
          addEntry: addEntryMock,
        };
        const finalCb = jest.fn();
        cb(compilation, finalCb);

        let completed = 0;
        // this loop progresses through a Promise.all call in the addEntries util
        // which is why we need to wait for nextTick between each call
        while (addEntryMock.mock.calls.length > completed) {
          const dep = addEntryMock.mock.calls[completed][1];
          depsSubArr.push(dep);
          addEntryMock.mock.calls[completed][3]();
          completed += 1;
          // eslint-disable-next-line no-await-in-loop
          await nextTick();
        }

        expect(finalCb.mock.calls.length).toEqual(1);
        deps.push(depsSubArr.map((dep) => dep.request));
      }
    }

    return deps;
  };

  it('should add devServer entry points to a single entry point', async () => {
    const webpackOptions = Object.assign({}, config);
    const compiler = webpack(webpackOptions);
    const devServerOptions = {};

    let injected;
    if (isWebpack5) {
      const entries = await checkEntriesWebpack5(compiler, devServerOptions);
      injected = entries[0][0];
    } else {
      addEntries(compiler, devServerOptions);
      const entry = compiler.options.entry;
      expect(entry.length).toEqual(2);
      injected = entry[0];
      expect(normalize(entry[1])).toEqual('./foo.js');
    }

    expect(
      normalize(injected).indexOf('client/default/index.js?') !== -1
    ).toBeTruthy();
  });

  it('should add devServer entry points to a multi-module entry point', async () => {
    const webpackOptions = Object.assign({}, config, {
      entry: ['./foo.js', './bar.js'],
    });
    const compiler = webpack(webpackOptions);
    const devServerOptions = {};

    let injected;
    if (isWebpack5) {
      const entries = await checkEntriesWebpack5(compiler, devServerOptions);
      injected = entries[0][0];
    } else {
      addEntries(compiler, devServerOptions);
      const entry = compiler.options.entry;
      expect(entry.length).toEqual(3);
      injected = entry[0];
      expect(entry[1]).toEqual('./foo.js');
      expect(entry[2]).toEqual('./bar.js');
    }

    expect(
      normalize(injected).indexOf('client/default/index.js?') !== -1
    ).toBeTruthy();
  });

  it('should add devServer entry points to a multi entry point object', async () => {
    const webpackOptions = Object.assign({}, config, {
      entry: {
        foo: './foo.js',
        bar: './bar.js',
      },
    });
    const compiler = webpack(webpackOptions);
    const devServerOptions = {};

    let injected;
    if (isWebpack5) {
      const entries = await checkEntriesWebpack5(compiler, devServerOptions);
      injected = entries[0][0];
    } else {
      addEntries(compiler, devServerOptions);
      const entry = compiler.options.entry;

      expect(entry.foo.length).toEqual(2);

      injected = entry.foo[0];
      expect(entry.foo[1]).toEqual('./foo.js');
      expect(entry.bar[1]).toEqual('./bar.js');
    }

    expect(
      normalize(injected).indexOf('client/default/index.js?') !== -1
    ).toBeTruthy();
  });

  if (!isWebpack5) {
    it('should set default to src if no entry point is given', () => {
      const webpackOptions = {};
      const compiler = webpack(webpackOptions);
      const devServerOptions = {};

      addEntries(compiler, devServerOptions);

      const entry = compiler.options.entry;
      expect(entry.length).toEqual(2);
      expect(entry[1]).toEqual('./src');
    });

    it('should preserves dynamic entry points', async (done) => {
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
      const entry = compiler.options.entry;
      expect(typeof entry).toEqual('function');

      entry()
        .then((entryFirstRun) =>
          entry().then((entrySecondRun) => {
            expect(entryFirstRun.length).toEqual(2);
            expect(entryFirstRun[1]).toEqual('./src-1.js');

            expect(entrySecondRun.length).toEqual(2);
            expect(entrySecondRun[1]).toEqual('./src-2.js');
            done();
          })
        )
        .catch(done);
    });

    it('should preserve asynchronous dynamic entry points', (done) => {
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

      const entry = compiler.options.entry;
      expect(typeof entry).toEqual('function');

      entry()
        .then((entryFirstRun) =>
          entry().then((entrySecondRun) => {
            expect(entryFirstRun.length).toEqual(2);
            expect(entryFirstRun[1]).toEqual('./src-1.js');

            expect(entrySecondRun.length).toEqual(2);
            expect(entrySecondRun[1]).toEqual('./src-2.js');
            done();
          })
        )
        .catch(done);
    });
  }

  it("should prepend webpack's hot reload client script", async () => {
    const webpackOptions = Object.assign({}, config, {
      entry: {
        app: './app.js',
      },
    });
    const compiler = webpack(webpackOptions);
    const devServerOptions = {
      hot: true,
    };

    let hotClientScript;
    if (isWebpack5) {
      const entries = await checkEntriesWebpack5(compiler, devServerOptions);
      hotClientScript = entries[0][1];
    } else {
      addEntries(compiler, devServerOptions);
      const entry = compiler.options.entry;
      hotClientScript = entry.app[1];
    }

    expect(
      normalize(hotClientScript).includes('webpack/hot/dev-server')
    ).toBeTruthy();
    expect(hotClientScript).toEqual(require.resolve(hotClientScript));
  });

  it("should prepend webpack's hot-only client script", async () => {
    const webpackOptions = Object.assign({}, config, {
      entry: {
        app: './app.js',
      },
    });
    const compiler = webpack(webpackOptions);
    const devServerOptions = {
      hot: 'only',
    };

    let hotClientScript;
    if (isWebpack5) {
      const entries = await checkEntriesWebpack5(compiler, devServerOptions);
      hotClientScript = entries[0][1];
    } else {
      addEntries(compiler, devServerOptions);
      hotClientScript = compiler.options.entry.app[1];
    }

    expect(
      normalize(hotClientScript).includes('webpack/hot/only-dev-server')
    ).toBeTruthy();
    expect(hotClientScript).toEqual(require.resolve(hotClientScript));
  });

  it('should not add the HMR plugin if no hot and no plugins', () => {
    const webpackOptions = Object.assign({}, config);
    const compiler = webpack(webpackOptions);
    const devServerOptions = {};

    addEntries(compiler, devServerOptions);

    if (isWebpack5) {
      expect(compiler.options.plugins).toEqual([]);
    } else {
      expect('plugins' in compiler.options).toBeFalsy();
    }
  });

  it('should not add the HMR plugin if no hot and empty plugins', () => {
    const webpackOptions = Object.assign({}, config, { plugins: [] });
    const compiler = webpack(webpackOptions);
    const devServerOptions = {};

    addEntries(compiler, devServerOptions);

    expect(compiler.options.plugins).toEqual([]);
  });

  it('should not add the HMR plugin if no hot and some plugins', () => {
    const existingPlugin1 = new webpack.BannerPlugin('happy birthday');
    const existingPlugin2 = new webpack.DefinePlugin({ foo: 'bar' });
    const webpackOptions = Object.assign({}, config, {
      plugins: [existingPlugin1, existingPlugin2],
    });
    const compiler = webpack(webpackOptions);
    const devServerOptions = {};

    addEntries(compiler, devServerOptions);

    expect(compiler.options.plugins).toEqual([
      existingPlugin1,
      existingPlugin2,
    ]);
  });

  it('should add the HMR plugin if hot', () => {
    const existingPlugin = new webpack.BannerPlugin('bruce');
    const webpackOptions = Object.assign({}, config, {
      plugins: [existingPlugin],
    });
    const compiler = webpack(webpackOptions);
    const devServerOptions = { hot: true };

    addEntries(compiler, devServerOptions);

    expect(compiler.options.plugins).toEqual([
      existingPlugin,
      new webpack.HotModuleReplacementPlugin(),
    ]);
  });

  it('should add the HMR plugin if hot-only', () => {
    const webpackOptions = Object.assign({}, config);
    const compiler = webpack(webpackOptions);
    const devServerOptions = { hot: 'only' };

    addEntries(compiler, devServerOptions);

    expect(compiler.options.plugins).toEqual([
      new webpack.HotModuleReplacementPlugin(),
    ]);
  });

  it("should not add the HMR plugin again if it's already there", () => {
    const existingPlugin = new webpack.BannerPlugin('bruce');
    const webpackOptions = Object.assign({}, config, {
      plugins: [new webpack.HotModuleReplacementPlugin(), existingPlugin],
    });
    const compiler = webpack(webpackOptions);
    const devServerOptions = { hot: true };

    addEntries(compiler, devServerOptions);

    expect(compiler.options.plugins).toEqual([
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

    expect(compiler.options.plugins).toEqual([
      // Nothing should be injected
      new HotModuleReplacementPlugin(),
      existingPlugin,
    ]);
  });

  // duplicates and support for different entry types are not relevant for webpack@5,
  // since new entries will be added via a plugin in webpack@5, regardless of what
  // the original entry is that the user provides
  // webpack@5 also handles filtering duplicate entries
  if (!isWebpack5) {
    it('should prevent duplicate entries from successive calls', () => {
      const webpackOptions = Object.assign({}, config);
      const compiler = webpack(webpackOptions);
      const devServerOptions = { hot: true };

      addEntries(compiler, devServerOptions);
      addEntries(compiler, devServerOptions);

      expect(compiler.options.entry.length).toEqual(3);

      const result = compiler.options.entry.filter((entry) =>
        normalize(entry).includes('webpack/hot/dev-server')
      );
      expect(result.length).toEqual(1);
    });

    it('should support entry as Function', () => {
      const webpackOptions = Object.assign({}, configEntryAsFunction);
      const compiler = webpack(webpackOptions);
      const devServerOptions = {};

      addEntries(compiler, devServerOptions);

      expect(typeof compiler.options.entry === 'function').toBe(true);
    });
  }

  it('should only prepend devServer entry points to web targets by default', async () => {
    const webpackOptions = [
      Object.assign({}, config),
      Object.assign({ target: 'web' }, config),
      Object.assign({ target: 'webworker' }, config),
      Object.assign({ target: 'electron-renderer' }, config),
      Object.assign({ target: 'node-webkit' }, config),
      Object.assign({ target: 'node' }, config) /* index:5 */,
    ];
    const nonInjectedCompiler = 5;
    const checkExpectInline = (index) =>
      index !== nonInjectedCompiler; /* all but the node target */
    const compiler = webpack(webpackOptions);
    const devServerOptions = {};

    const injected = [];
    if (isWebpack5) {
      const entries = await checkEntriesWebpack5(
        compiler,
        devServerOptions,
        checkExpectInline
      );
      entries.forEach((entry) => {
        injected.push(entry[0] || null);
      });
    } else {
      addEntries(compiler, devServerOptions);
      compiler.compilers.forEach((comp, index) => {
        const expectInline = checkExpectInline(index);

        const entry = comp.options.entry;
        if (expectInline) {
          expect(entry.length).toEqual(2);
        } else {
          expect(typeof entry).toEqual('string');
        }

        if (expectInline) {
          injected.push(entry[0]);
        } else {
          injected.push(null);
        }

        expect(normalize(expectInline ? entry[1] : entry)).toEqual('./foo.js');
      });
    }

    injected.forEach((entry, index) => {
      const expectInline = checkExpectInline(index);
      if (expectInline) {
        expect(
          normalize(entry).indexOf('client/default/index.js?') !== -1
        ).toBeTruthy();
      } else {
        expect(entry).toEqual(null);
      }
    });
  });

  it('should allow selecting compilations to inline the client into', async () => {
    const webpackOptions = [
      Object.assign({}, config),
      Object.assign({ target: 'web' }, config),
      Object.assign({ name: 'only-include' }, config) /* index:2 */,
      Object.assign({ target: 'node' }, config),
    ];
    const injectedCompiler = 2;
    const checkExpectInline = (index) =>
      index === injectedCompiler; /* only the "only-include" compiler */
    const compiler = webpack(webpackOptions);
    const devServerOptions = {
      injectClient: (compilerConfig) => compilerConfig.name === 'only-include',
    };

    const injected = [];
    if (isWebpack5) {
      const entries = await checkEntriesWebpack5(
        compiler,
        devServerOptions,
        checkExpectInline
      );
      entries.forEach((entry) => {
        injected.push(entry[0] || null);
      });
    } else {
      addEntries(compiler, devServerOptions);

      compiler.compilers.forEach((comp, index) => {
        const expectInline = checkExpectInline(index);

        const entry = comp.options.entry;
        if (expectInline) {
          expect(entry.length).toEqual(2);
        } else {
          expect(typeof entry).toEqual('string');
        }

        if (expectInline) {
          injected.push(entry[0]);
        } else {
          injected.push(null);
        }

        expect(normalize(expectInline ? entry[1] : entry)).toEqual('./foo.js');
      });
    }

    injected.forEach((entry, index) => {
      const expectInline = checkExpectInline(index);
      if (expectInline) {
        expect(
          normalize(entry).indexOf('client/default/index.js?') !== -1
        ).toBeTruthy();
      } else {
        expect(entry).toEqual(null);
      }
    });
  });

  it('should prepend the hot runtime to all targets by default (when hot)', async () => {
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

    const injected = [];
    if (isWebpack5) {
      const entries = await checkEntriesWebpack5(compiler, devServerOptions);
      entries.forEach((entry) => {
        injected.push(entry[0]);
      });
    } else {
      addEntries(compiler, devServerOptions);
      compiler.compilers.forEach((comp) => {
        const entry = comp.options.entry;
        expect(entry.length).toEqual(2);

        expect(normalize(entry[1])).toEqual('./foo.js');
      });
    }

    injected.forEach((entry) => {
      expect(normalize(entry).includes('webpack/hot/dev-server')).toBeTruthy();
    });
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
    };

    const injected = [];
    if (isWebpack5) {
      const entries = await checkEntriesWebpack5(compiler, devServerOptions);
      injected.push(entries[0][0]);
      injected.push(entries[1][0]);
    } else {
      addEntries(compiler, devServerOptions);

      // node target should have the client runtime but not the hot runtime
      const webWebpackOptions = compiler.compilers[0].options;

      expect(webWebpackOptions.entry.length).toEqual(2);

      injected.push(webWebpackOptions.entry[0]);

      expect(normalize(webWebpackOptions.entry[1])).toEqual('./foo.js');

      // node target should have the hot runtime but not the client runtime
      const nodeWebpackOptions = compiler.compilers[1].options;

      expect(nodeWebpackOptions.entry.length).toEqual(2);

      injected.push(nodeWebpackOptions.entry[0]);

      expect(normalize(nodeWebpackOptions.entry[1])).toEqual('./foo.js');
    }

    expect(
      normalize(injected[0]).indexOf('client/default/index.js?') !== -1
    ).toBeTruthy();
    expect(
      normalize(injected[1]).includes('webpack/hot/dev-server')
    ).toBeTruthy();
  });

  it('does not use client.path when default', async () => {
    const webpackOptions = Object.assign({}, config);
    const compiler = webpack(webpackOptions);
    const devServerOptions = {
      client: {
        path: '/ws',
      },
    };

    let injected;
    if (isWebpack5) {
      const entries = await checkEntriesWebpack5(compiler, devServerOptions);
      injected = entries[0][0];
    } else {
      addEntries(compiler, devServerOptions);
      injected = compiler.options.entry[0];
    }

    expect(injected).not.toContain('&path=/ws');
  });

  it('uses custom client.path', async () => {
    const webpackOptions = Object.assign({}, config);
    const compiler = webpack(webpackOptions);
    const devServerOptions = {
      client: {
        path: '/custom/path',
      },
    };

    let injected;
    if (isWebpack5) {
      const entries = await checkEntriesWebpack5(compiler, devServerOptions);
      injected = entries[0][0];
    } else {
      addEntries(compiler, devServerOptions);
      injected = compiler.options.entry[0];
    }

    expect(injected).toContain('&path=/custom/path');
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
    };

    let injected;
    if (isWebpack5) {
      const entries = await checkEntriesWebpack5(compiler, devServerOptions);
      injected = entries[0][0];
    } else {
      addEntries(compiler, devServerOptions);
      injected = compiler.options.entry[0];
    }

    expect(injected).toContain('&host=my.host&path=/custom/path&port=8080');
  });
});
