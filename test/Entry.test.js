'use strict';

/* eslint-disable
  import/order,
  arrow-parens,
  array-bracket-spacing
*/
const path = require('path');
const assert = require('assert');

const webpack = require('webpack');

const addEntries = require('../lib/utils/addEntries');
const config = require('./fixtures/simple-config/webpack.config');

const normalize = (entry) => entry.split(path.sep).join('/');

describe('Entry', () => {
  it('adds devServer entry points to a single entry point', () => {
    const webpackOptions = Object.assign({}, config);
    const devServerOptions = {};

    addEntries(webpackOptions, devServerOptions);

    assert.equal(webpackOptions.entry.length, 2);

    assert(
      normalize(webpackOptions.entry[0]).indexOf('client/index.js?') !== -1
    );
    assert.equal(normalize(webpackOptions.entry[1]), './foo.js');
  });

  it('adds devServer entry points to a multi-module entry point', () => {
    const webpackOptions = Object.assign({}, config, {
      entry: [ './foo.js', './bar.js' ]
    });

    const devServerOptions = {};

    addEntries(webpackOptions, devServerOptions);

    assert.equal(webpackOptions.entry.length, 3);
    assert(
      normalize(webpackOptions.entry[0]).indexOf('client/index.js?') !== -1
    );
    assert.equal(webpackOptions.entry[1], './foo.js');
    assert.equal(webpackOptions.entry[2], './bar.js');
  });

  it('adds devServer entry points to a multi entry point object', () => {
    const webpackOptions = Object.assign({}, config, {
      entry: {
        foo: './foo.js',
        bar: './bar.js'
      }
    });

    const devServerOptions = {};

    addEntries(webpackOptions, devServerOptions);

    assert.equal(webpackOptions.entry.foo.length, 2);

    assert(
      normalize(webpackOptions.entry.foo[0]).indexOf('client/index.js?') !== -1
    );
    assert.equal(webpackOptions.entry.foo[1], './foo.js');
    assert.equal(webpackOptions.entry.bar[1], './bar.js');
  });

  it('defaults to src if no entry point is given', () => {
    const webpackOptions = {};
    const devServerOptions = {};

    addEntries(webpackOptions, devServerOptions);

    assert.equal(webpackOptions.entry.length, 2);
    assert.equal(webpackOptions.entry[1], './src');
  });

  it('preserves dynamic entry points', (done) => {
    let i = 0;
    const webpackOptions = {
      // simulate dynamic entry
      entry: () => {
        i += 1;
        return `./src-${i}.js`;
      }
    };
    const devServerOptions = {};

    addEntries(webpackOptions, devServerOptions);

    assert(typeof webpackOptions.entry, 'function');

    webpackOptions.entry().then(entryFirstRun => (
      webpackOptions.entry().then((entrySecondRun) => {
        assert.equal(entryFirstRun.length, 2);
        assert.equal(entryFirstRun[1], './src-1.js');

        assert.equal(entrySecondRun.length, 2);
        assert.equal(entrySecondRun[1], './src-2.js');
        done();
      })
    )).catch(done);
  });

  it('preserves asynchronous dynamic entry points', (done) => {
    let i = 0;
    const webpackOptions = {
      // simulate async dynamic entry
      entry: () => new Promise((resolve) => {
        i += 1;
        resolve(`./src-${i}.js`);
      })
    };

    const devServerOptions = {};

    addEntries(webpackOptions, devServerOptions);

    assert(typeof webpackOptions.entry, 'function');

    webpackOptions.entry().then(entryFirstRun => (
      webpackOptions.entry().then((entrySecondRun) => {
        assert.equal(entryFirstRun.length, 2);
        assert.equal(entryFirstRun[1], './src-1.js');

        assert.equal(entrySecondRun.length, 2);
        assert.equal(entrySecondRun[1], './src-2.js');
        done();
      })
    )).catch(done);
  });

  it('prepends webpack\'s hot reload client script', () => {
    const webpackOptions = Object.assign({}, config, {
      entry: {
        app: './app.js'
      }
    });

    const devServerOptions = {
      hot: true
    };

    addEntries(webpackOptions, devServerOptions);

    const hotClientScript = webpackOptions.entry.app[1];

    assert.equal(
      normalize(hotClientScript).includes('webpack/hot/dev-server'),
      true
    );
    assert.equal(hotClientScript, require.resolve(hotClientScript));
  });

  it('prepends webpack\'s hot-only client script', () => {
    const webpackOptions = Object.assign({}, config, {
      entry: {
        app: './app.js'
      }
    });

    const devServerOptions = {
      hotOnly: true
    };

    addEntries(webpackOptions, devServerOptions);

    const hotClientScript = webpackOptions.entry.app[1];

    assert.equal(
      normalize(hotClientScript).includes('webpack/hot/only-dev-server'),
      true
    );
    assert.equal(hotClientScript, require.resolve(hotClientScript));
  });

  it('doesn\'t add the HMR plugin if not hot and no plugins', () => {
    const webpackOptions = Object.assign({}, config);
    const devServerOptions = { };

    addEntries(webpackOptions, devServerOptions);

    assert.equal('plugins' in webpackOptions, false);
  });
  it('doesn\'t add the HMR plugin if not hot and empty plugins', () => {
    const webpackOptions = Object.assign({}, config, { plugins: [] });
    const devServerOptions = { };

    addEntries(webpackOptions, devServerOptions);

    assert.deepStrictEqual(webpackOptions.plugins, []);
  });
  it('doesn\'t add the HMR plugin if not hot and some plugins', () => {
    const existingPlugin1 = new webpack.BannerPlugin('happy birthday');
    const existingPlugin2 = new webpack.DefinePlugin({ foo: 'bar' });
    const webpackOptions = Object.assign({}, config, {
      plugins: [existingPlugin1, existingPlugin2]
    });
    const devServerOptions = { };

    addEntries(webpackOptions, devServerOptions);

    assert.deepStrictEqual(
      webpackOptions.plugins,
      [existingPlugin1, existingPlugin2]
    );
  });
  it('adds the HMR plugin if hot', () => {
    const existingPlugin = new webpack.BannerPlugin('bruce');
    const webpackOptions = Object.assign({}, config, {
      plugins: [existingPlugin]
    });
    const devServerOptions = { hot: true };

    addEntries(webpackOptions, devServerOptions);

    assert.deepStrictEqual(
      webpackOptions.plugins,
      [existingPlugin, new webpack.HotModuleReplacementPlugin()]
    );
  });
  it('adds the HMR plugin if hot-only', () => {
    const webpackOptions = Object.assign({}, config);
    const devServerOptions = { hotOnly: true };

    addEntries(webpackOptions, devServerOptions);

    assert.deepStrictEqual(
      webpackOptions.plugins,
      [new webpack.HotModuleReplacementPlugin()]
    );
  });
  it('doesn\'t add the HMR plugin again if it\'s already there', () => {
    const existingPlugin = new webpack.BannerPlugin('bruce');
    const webpackOptions = Object.assign({}, config, {
      plugins: [new webpack.HotModuleReplacementPlugin(), existingPlugin]
    });
    const devServerOptions = { hot: true };

    addEntries(webpackOptions, devServerOptions);

    assert.deepStrictEqual(
      webpackOptions.plugins,
      [new webpack.HotModuleReplacementPlugin(), existingPlugin]
    );
  });
});
