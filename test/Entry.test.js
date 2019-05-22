'use strict';

/* eslint-disable
  import/order,
  arrow-parens,
  array-bracket-spacing
*/
const path = require('path');

const webpack = require('webpack');

const addEntries = require('../lib/utils/addEntries');

const config = require('./fixtures/simple-config/webpack.config');
const configEntryAsFunction = require('./fixtures/entry-as-function/webpack.config');

const normalize = (entry) => entry.split(path.sep).join('/');

describe('Entry', () => {
  it('adds devServer entry points to a single entry point', () => {
    const webpackOptions = Object.assign({}, config);
    const devServerOptions = {};

    addEntries(webpackOptions, devServerOptions);

    expect(webpackOptions.entry.length).toEqual(2);
    expect(
      normalize(webpackOptions.entry[0]).indexOf('client/index.js?') !== -1
    ).toBeTruthy();
    expect(normalize(webpackOptions.entry[1])).toEqual('./foo.js');
  });

  it('adds devServer entry points to a multi-module entry point', () => {
    const webpackOptions = Object.assign({}, config, {
      entry: ['./foo.js', './bar.js'],
    });

    const devServerOptions = {};

    addEntries(webpackOptions, devServerOptions);

    expect(webpackOptions.entry.length).toEqual(3);
    expect(
      normalize(webpackOptions.entry[0]).indexOf('client/index.js?') !== -1
    ).toBeTruthy();
    expect(webpackOptions.entry[1]).toEqual('./foo.js');
    expect(webpackOptions.entry[2]).toEqual('./bar.js');
  });

  it('adds devServer entry points to a multi entry point object', () => {
    const webpackOptions = Object.assign({}, config, {
      entry: {
        foo: './foo.js',
        bar: './bar.js',
      },
    });

    const devServerOptions = {};

    addEntries(webpackOptions, devServerOptions);

    expect(webpackOptions.entry.foo.length).toEqual(2);

    expect(
      normalize(webpackOptions.entry.foo[0]).indexOf('client/index.js?') !== -1
    ).toBeTruthy();
    expect(webpackOptions.entry.foo[1]).toEqual('./foo.js');
    expect(webpackOptions.entry.bar[1]).toEqual('./bar.js');
  });

  it('defaults to src if no entry point is given', () => {
    const webpackOptions = {};
    const devServerOptions = {};

    addEntries(webpackOptions, devServerOptions);

    expect(webpackOptions.entry.length).toEqual(2);
    expect(webpackOptions.entry[1]).toEqual('./src');
  });

  it('preserves dynamic entry points', (done) => {
    let i = 0;
    const webpackOptions = {
      // simulate dynamic entry
      entry: () => {
        i += 1;
        return `./src-${i}.js`;
      },
    };
    const devServerOptions = {};

    addEntries(webpackOptions, devServerOptions);

    expect(typeof webpackOptions.entry).toEqual('function');

    webpackOptions
      .entry()
      .then((entryFirstRun) =>
        webpackOptions.entry().then((entrySecondRun) => {
          expect(entryFirstRun.length).toEqual(2);
          expect(entryFirstRun[1]).toEqual('./src-1.js');

          expect(entrySecondRun.length).toEqual(2);
          expect(entrySecondRun[1]).toEqual('./src-2.js');
          done();
        })
      )
      .catch(done);
  });

  it('preserves asynchronous dynamic entry points', (done) => {
    let i = 0;
    const webpackOptions = {
      // simulate async dynamic entry
      entry: () =>
        new Promise((resolve) => {
          i += 1;
          resolve(`./src-${i}.js`);
        }),
    };

    const devServerOptions = {};

    addEntries(webpackOptions, devServerOptions);

    expect(typeof webpackOptions.entry).toEqual('function');

    webpackOptions
      .entry()
      .then((entryFirstRun) =>
        webpackOptions.entry().then((entrySecondRun) => {
          expect(entryFirstRun.length).toEqual(2);
          expect(entryFirstRun[1]).toEqual('./src-1.js');

          expect(entrySecondRun.length).toEqual(2);
          expect(entrySecondRun[1]).toEqual('./src-2.js');
          done();
        })
      )
      .catch(done);
  });

  it("prepends webpack's hot reload client script", () => {
    const webpackOptions = Object.assign({}, config, {
      entry: {
        app: './app.js',
      },
    });

    const devServerOptions = {
      hot: true,
    };

    addEntries(webpackOptions, devServerOptions);

    const hotClientScript = webpackOptions.entry.app[1];

    expect(
      normalize(hotClientScript).includes('webpack/hot/dev-server')
    ).toBeTruthy();
    expect(hotClientScript).toEqual(require.resolve(hotClientScript));
  });

  it("prepends webpack's hot-only client script", () => {
    const webpackOptions = Object.assign({}, config, {
      entry: {
        app: './app.js',
      },
    });

    const devServerOptions = {
      hotOnly: true,
    };

    addEntries(webpackOptions, devServerOptions);

    const hotClientScript = webpackOptions.entry.app[1];

    expect(
      normalize(hotClientScript).includes('webpack/hot/only-dev-server')
    ).toBeTruthy();
    expect(hotClientScript).toEqual(require.resolve(hotClientScript));
  });

  it("doesn't add the HMR plugin if not hot and no plugins", () => {
    const webpackOptions = Object.assign({}, config);
    const devServerOptions = {};

    addEntries(webpackOptions, devServerOptions);

    expect('plugins' in webpackOptions).toBeFalsy();
  });

  it("doesn't add the HMR plugin if not hot and empty plugins", () => {
    const webpackOptions = Object.assign({}, config, { plugins: [] });
    const devServerOptions = {};

    addEntries(webpackOptions, devServerOptions);

    expect(webpackOptions.plugins).toEqual([]);
  });

  it("doesn't add the HMR plugin if not hot and some plugins", () => {
    const existingPlugin1 = new webpack.BannerPlugin('happy birthday');
    const existingPlugin2 = new webpack.DefinePlugin({ foo: 'bar' });
    const webpackOptions = Object.assign({}, config, {
      plugins: [existingPlugin1, existingPlugin2],
    });
    const devServerOptions = {};

    addEntries(webpackOptions, devServerOptions);

    expect(webpackOptions.plugins).toEqual([existingPlugin1, existingPlugin2]);
  });

  it('adds the HMR plugin if hot', () => {
    const existingPlugin = new webpack.BannerPlugin('bruce');
    const webpackOptions = Object.assign({}, config, {
      plugins: [existingPlugin],
    });
    const devServerOptions = { hot: true };

    addEntries(webpackOptions, devServerOptions);

    expect(webpackOptions.plugins).toEqual([
      existingPlugin,
      new webpack.HotModuleReplacementPlugin(),
    ]);
  });

  it('adds the HMR plugin if hot-only', () => {
    const webpackOptions = Object.assign({}, config);
    const devServerOptions = { hotOnly: true };

    addEntries(webpackOptions, devServerOptions);

    expect(webpackOptions.plugins).toEqual([
      new webpack.HotModuleReplacementPlugin(),
    ]);
  });

  it("doesn't add the HMR plugin again if it's already there", () => {
    const existingPlugin = new webpack.BannerPlugin('bruce');
    const webpackOptions = Object.assign({}, config, {
      plugins: [new webpack.HotModuleReplacementPlugin(), existingPlugin],
    });
    const devServerOptions = { hot: true };

    addEntries(webpackOptions, devServerOptions);

    expect(webpackOptions.plugins).toEqual([
      new webpack.HotModuleReplacementPlugin(),
      existingPlugin,
    ]);
  });

  it('can prevent duplicate entries from successive calls', () => {
    const webpackOptions = Object.assign({}, config);
    const devServerOptions = { hot: true };

    addEntries(webpackOptions, devServerOptions);
    addEntries(webpackOptions, devServerOptions);

    expect(webpackOptions.entry.length).toEqual(3);

    const result = webpackOptions.entry.filter((entry) =>
      normalize(entry).includes('webpack/hot/dev-server')
    );
    expect(result.length).toEqual(1);
  });

  it('supports entry as Function', () => {
    const webpackOptions = Object.assign({}, configEntryAsFunction);
    const devServerOptions = {};

    addEntries(webpackOptions, devServerOptions);

    expect(typeof webpackOptions.entry === 'function').toBe(true);
  });

  it('only prepends devServer entry points to web targets by default', () => {
    const webpackOptions = [
      Object.assign({}, config),
      Object.assign({ target: 'web' }, config),
      Object.assign({ target: 'webworker' }, config),
      Object.assign({ target: 'node' }, config) /* index:3 */,
    ];

    const devServerOptions = {};

    addEntries(webpackOptions, devServerOptions);

    // eslint-disable-next-line no-shadow
    webpackOptions.forEach((webpackOptions, index) => {
      const expectInline = index !== 3; /* all but the node target */

      expect(webpackOptions.entry.length).toEqual(expectInline ? 2 : 1);

      if (expectInline) {
        expect(
          normalize(webpackOptions.entry[0]).indexOf('client/index.js?') !== -1
        ).toBeTruthy();
      }

      expect(normalize(webpackOptions.entry[expectInline ? 1 : 0])).toEqual(
        './foo.js'
      );
    });
  });

  it('allows selecting compilations to inline the client into', () => {
    const webpackOptions = [
      Object.assign({}, config),
      Object.assign({ target: 'web' }, config),
      Object.assign({ name: 'only-include' }, config) /* index:2 */,
      Object.assign({ target: 'node' }, config),
    ];

    const devServerOptions = {
      injectClient: (compilerConfig) => compilerConfig.name === 'only-include',
    };

    addEntries(webpackOptions, devServerOptions);

    // eslint-disable-next-line no-shadow
    webpackOptions.forEach((webpackOptions, index) => {
      const expectInline = index === 2; /* only the "only-include" compiler */

      expect(webpackOptions.entry.length).toEqual(expectInline ? 2 : 1);

      if (expectInline) {
        expect(
          normalize(webpackOptions.entry[0]).indexOf('client/index.js?') !== -1
        ).toBeTruthy();
      }

      expect(normalize(webpackOptions.entry[expectInline ? 1 : 0])).toEqual(
        './foo.js'
      );
    });
  });

  it('when hot, prepends the hot runtime to all targets by default', () => {
    const webpackOptions = [
      Object.assign({ target: 'web' }, config),
      Object.assign({ target: 'node' }, config),
    ];

    const devServerOptions = {
      // disable inlining the client so entry indexes match up
      // and we can use the same assertions for both configs
      injectClient: false,
      hot: true,
    };

    addEntries(webpackOptions, devServerOptions);

    // eslint-disable-next-line no-shadow
    webpackOptions.forEach((webpackOptions) => {
      expect(webpackOptions.entry.length).toEqual(2);

      expect(
        normalize(webpackOptions.entry[0]).includes('webpack/hot/dev-server')
      ).toBeTruthy();

      expect(normalize(webpackOptions.entry[1])).toEqual('./foo.js');
    });
  });

  it('allows selecting which compilations to inject the hot runtime into', () => {
    const webpackOptions = [
      Object.assign({ target: 'web' }, config),
      Object.assign({ target: 'node' }, config),
    ];

    const devServerOptions = {
      injectHot: (compilerConfig) => compilerConfig.target === 'node',
      hot: true,
    };

    addEntries(webpackOptions, devServerOptions);

    // node target should have the client runtime but not the hot runtime
    const webWebpackOptions = webpackOptions[0];

    expect(webWebpackOptions.entry.length).toEqual(2);

    expect(
      normalize(webWebpackOptions.entry[0]).indexOf('client/index.js?') !== -1
    ).toBeTruthy();

    expect(normalize(webWebpackOptions.entry[1])).toEqual('./foo.js');

    // node target should have the hot runtime but not the client runtime
    const nodeWebpackOptions = webpackOptions[1];

    expect(nodeWebpackOptions.entry.length).toEqual(2);

    expect(
      normalize(nodeWebpackOptions.entry[0]).includes('webpack/hot/dev-server')
    ).toBeTruthy();

    expect(normalize(nodeWebpackOptions.entry[1])).toEqual('./foo.js');
  });
});
