'use strict';

const path = require('path');
const webpack = require('webpack');
const addEntries = require('../../../lib/utils/addEntries');
const config = require('./../../fixtures/simple-config/webpack.config');
const configEntryAsFunction = require('./../../fixtures/entry-as-function/webpack.config');

const normalize = (entry) => entry.split(path.sep).join('/');

describe('addEntries util', () => {
  it('should add devServer entry points to a single entry point', () => {
    const webpackOptions = Object.assign({}, config);

    addEntries(webpackOptions, {});

    expect(webpackOptions.entry.length).toEqual(2);
    expect(
      normalize(webpackOptions.entry[0]).includes('client/index.js?')
    ).toBeTruthy();
    expect(normalize(webpackOptions.entry[1])).toEqual('./foo.js');
  });

  it('should add devServer entry points to a multi-module entry point', () => {
    const webpackOptions = Object.assign({}, config, {
      entry: ['./foo.js', './bar.js'],
    });

    addEntries(webpackOptions, {});

    expect(webpackOptions.entry.length).toEqual(3);
    expect(
      normalize(webpackOptions.entry[0]).includes('client/index.js?')
    ).toBeTruthy();
    expect(webpackOptions.entry[1]).toEqual('./foo.js');
    expect(webpackOptions.entry[2]).toEqual('./bar.js');
  });

  it('should add devServer entry points to a multi entry point object', () => {
    const webpackOptions = Object.assign({}, config, {
      entry: {
        foo: './foo.js',
        bar: './bar.js',
      },
    });

    addEntries(webpackOptions, {});

    expect(webpackOptions.entry.foo.length).toEqual(2);

    expect(
      normalize(webpackOptions.entry.foo[0]).includes('client/index.js?')
    ).toBeTruthy();
    expect(webpackOptions.entry.foo[1]).toEqual('./foo.js');
    expect(webpackOptions.entry.bar[1]).toEqual('./bar.js');
  });

  it('should set defaults to src if no entry point is given', () => {
    const webpackOptions = {};

    addEntries(webpackOptions, {});

    expect(webpackOptions.entry.length).toEqual(2);
    expect(webpackOptions.entry[1]).toEqual('./src');
  });

  it('should preserve dynamic entry points', async () => {
    let i = 0;
    const webpackOptions = {
      // simulate dynamic entry
      entry: () => {
        i += 1;
        return `./src-${i}.js`;
      },
    };

    addEntries(webpackOptions, {});

    expect(typeof webpackOptions.entry).toEqual('function');

    {
      const entry = await webpackOptions.entry();

      expect(entry.length).toEqual(2);
      expect(entry[1]).toEqual('./src-1.js');
    }
    {
      const entry = await webpackOptions.entry();

      expect(entry.length).toEqual(2);
      expect(entry[1]).toEqual('./src-2.js');
    }
  });

  it('should preserve asynchronous dynamic entry points', async () => {
    let i = 0;
    const webpackOptions = {
      // simulate async dynamic entry
      entry: () =>
        new Promise((resolve) => {
          i += 1;
          resolve(`./src-${i}.js`);
        }),
    };

    addEntries(webpackOptions, {});

    expect(typeof webpackOptions.entry).toEqual('function');

    {
      const entry = await webpackOptions.entry();

      expect(entry.length).toEqual(2);
      expect(entry[1]).toEqual('./src-1.js');
    }
    {
      const entry = await webpackOptions.entry();

      expect(entry.length).toEqual(2);
      expect(entry[1]).toEqual('./src-2.js');
    }
  });

  it("should prepend webpack's hot reload client script", () => {
    const webpackOptions = Object.assign({}, config, {
      entry: {
        app: './app.js',
      },
    });

    addEntries(webpackOptions, { hot: true });

    const hotClientScript = webpackOptions.entry.app[1];

    expect(
      normalize(hotClientScript).includes('webpack/hot/dev-server')
    ).toBeTruthy();
    expect(hotClientScript).toEqual(require.resolve(hotClientScript));
  });

  it("should prepend webpack's hot only client script", () => {
    const webpackOptions = Object.assign({}, config, {
      entry: {
        app: './app.js',
      },
    });

    addEntries(webpackOptions, { hot: 'only' });

    const hotClientScript = webpackOptions.entry.app[1];

    expect(
      normalize(hotClientScript).includes('webpack/hot/only-dev-server')
    ).toBeTruthy();
    expect(hotClientScript).toEqual(require.resolve(hotClientScript));
  });

  it('should not add the HMR plugin if not hot and no plugins', () => {
    const webpackOptions = Object.assign({}, config);

    addEntries(webpackOptions, {});

    expect('plugins' in webpackOptions).toBeFalsy();
  });

  it('should not add the HMR plugin if not hot and empty plugins', () => {
    const webpackOptions = Object.assign({}, config, { plugins: [] });

    addEntries(webpackOptions, {});

    expect(webpackOptions.plugins).toEqual([]);
  });

  it('should not add the HMR plugin if not hot and some plugins', () => {
    const existingPlugin1 = new webpack.BannerPlugin('happy birthday');
    const existingPlugin2 = new webpack.DefinePlugin({ foo: 'bar' });
    const webpackOptions = Object.assign({}, config, {
      plugins: [existingPlugin1, existingPlugin2],
    });

    addEntries(webpackOptions, {});

    expect(webpackOptions.plugins).toEqual([existingPlugin1, existingPlugin2]);
  });

  it('should add the HMR plugin if hot', () => {
    const existingPlugin = new webpack.BannerPlugin('bruce');
    const webpackOptions = Object.assign({}, config, {
      plugins: [existingPlugin],
    });

    addEntries(webpackOptions, { hot: true });

    expect(webpackOptions.plugins).toEqual([
      existingPlugin,
      new webpack.HotModuleReplacementPlugin(),
    ]);
  });

  it('should add the HMR plugin if hot-only', () => {
    const webpackOptions = Object.assign({}, config);

    addEntries(webpackOptions, { hot: 'only' });

    expect(webpackOptions.plugins).toEqual([
      new webpack.HotModuleReplacementPlugin(),
    ]);
  });

  it("should not add the HMR plugin again if it's already there", () => {
    const existingPlugin = new webpack.BannerPlugin('bruce');
    const webpackOptions = Object.assign({}, config, {
      plugins: [new webpack.HotModuleReplacementPlugin(), existingPlugin],
    });

    addEntries(webpackOptions, { hot: true });

    expect(webpackOptions.plugins).toEqual([
      new webpack.HotModuleReplacementPlugin(),
      existingPlugin,
    ]);
  });

  it("should not add the HMR plugin again if it's already there from a different webpack", () => {
    const existingPlugin = new webpack.BannerPlugin('bruce');

    // Simulate the inclusion of another webpack's HotModuleReplacementPlugin
    class HotModuleReplacementPlugin {}

    const webpackOptions = Object.assign({}, config, {
      plugins: [new HotModuleReplacementPlugin(), existingPlugin],
    });

    addEntries(webpackOptions, { hot: true });

    expect(webpackOptions.plugins).toEqual([
      // Nothing should be injected
      new HotModuleReplacementPlugin(),
      existingPlugin,
    ]);
  });

  it('should prevent duplicate entries from successive calls', () => {
    const webpackOptions = Object.assign({}, config);

    addEntries(webpackOptions, { hot: true });
    addEntries(webpackOptions, { hot: true });

    expect(webpackOptions.entry.length).toEqual(3);

    const result = webpackOptions.entry.filter((entry) =>
      normalize(entry).includes('webpack/hot/dev-server')
    );
    expect(result.length).toEqual(1);
  });

  it('should support entry as Function', () => {
    const webpackOptions = Object.assign({}, configEntryAsFunction);

    addEntries(webpackOptions, {});

    expect(typeof webpackOptions.entry === 'function').toBe(true);
  });

  it('should only prepend devServer entry points to web targets by default', () => {
    const webpackOptions = [
      Object.assign({}, config),
      Object.assign({ target: 'web' }, config),
      Object.assign({ target: 'webworker' }, config),
      Object.assign({ target: 'electron-renderer' }, config),
      Object.assign({ target: 'node-webkit' }, config),
      Object.assign({ target: 'node' }, config) /* index:5 */,
    ];

    addEntries(webpackOptions, {});

    // eslint-disable-next-line no-shadow
    webpackOptions.forEach((webpackOptions, index) => {
      const expectInline = index !== 5; /* all but the node target */

      expect(webpackOptions.entry.length).toEqual(expectInline ? 2 : 1);

      if (expectInline) {
        expect(
          normalize(webpackOptions.entry[0]).includes('client/index.js?')
        ).toBeTruthy();
      }

      expect(normalize(webpackOptions.entry[expectInline ? 1 : 0])).toEqual(
        './foo.js'
      );
    });
  });

  it('should allow selecting compilations to inline the client into', () => {
    const webpackOptions = [
      Object.assign({}, config),
      Object.assign({ target: 'web' }, config),
      Object.assign({ name: 'only-include' }, config) /* index:2 */,
      Object.assign({ target: 'node' }, config),
    ];

    addEntries(webpackOptions, {
      injectClient: (compilerConfig) => compilerConfig.name === 'only-include',
    });

    // eslint-disable-next-line no-shadow
    webpackOptions.forEach((webpackOptions, index) => {
      const expectInline = index === 2; /* only the "only-include" compiler */

      expect(webpackOptions.entry.length).toEqual(expectInline ? 2 : 1);

      if (expectInline) {
        expect(
          normalize(webpackOptions.entry[0]).includes('client/index.js?')
        ).toBeTruthy();
      }

      expect(normalize(webpackOptions.entry[expectInline ? 1 : 0])).toEqual(
        './foo.js'
      );
    });
  });

  it('should prepend the hot runtime to all targets by default (when hot)', () => {
    const webpackOptions = [
      Object.assign({ target: 'web' }, config),
      Object.assign({ target: 'node' }, config),
    ];

    addEntries(webpackOptions, {
      // disable inlining the client so entry indexes match up
      // and we can use the same assertions for both configs
      injectClient: false,
      hot: true,
    });

    // eslint-disable-next-line no-shadow
    webpackOptions.forEach((webpackOptions) => {
      expect(webpackOptions.entry.length).toEqual(2);

      expect(
        normalize(webpackOptions.entry[0]).includes('webpack/hot/dev-server')
      ).toBeTruthy();

      expect(normalize(webpackOptions.entry[1])).toEqual('./foo.js');
    });
  });

  it('should allow selecting which compilations to inject the hot runtime into', () => {
    const webpackOptions = [
      Object.assign({ target: 'web' }, config),
      Object.assign({ target: 'node' }, config),
    ];

    addEntries(webpackOptions, {
      injectHot: (compilerConfig) => compilerConfig.target === 'node',
      hot: true,
    });

    // node target should have the client runtime but not the hot runtime
    const [webWebpackOptions, nodeWebpackOptions] = webpackOptions;

    expect(webWebpackOptions.entry.length).toEqual(2);

    expect(
      normalize(webWebpackOptions.entry[0]).includes('client/index.js?')
    ).toBeTruthy();

    expect(normalize(webWebpackOptions.entry[1])).toEqual('./foo.js');

    expect(nodeWebpackOptions.entry.length).toEqual(2);

    expect(
      normalize(nodeWebpackOptions.entry[0]).includes('webpack/hot/dev-server')
    ).toBeTruthy();

    expect(normalize(nodeWebpackOptions.entry[1])).toEqual('./foo.js');
  });
});
