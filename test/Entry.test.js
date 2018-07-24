'use strict';

const assert = require('assert');
const addDevServerEntrypoints = require('../lib/util/addDevServerEntrypoints');
const config = require('./fixtures/simple-config/webpack.config');

describe('Entry', () => {
  it('adds devServer entry points to a single entry point', () => {
    const webpackOptions = Object.assign({}, config);
    const devServerOptions = {};

    addDevServerEntrypoints(webpackOptions, devServerOptions);

    assert.equal(webpackOptions.entry.length, 2);
    assert(webpackOptions.entry[0].indexOf('client/index.js?') !== -1);
    assert.equal(webpackOptions.entry[1], './foo.js');
  });

  it('adds devServer entry points to a multi-module entry point', () => {
    const webpackOptions = Object.assign({}, config, {
      entry: ['./foo.js', './bar.js']
    });
    const devServerOptions = {};

    addDevServerEntrypoints(webpackOptions, devServerOptions);

    assert.equal(webpackOptions.entry.length, 3);
    assert(webpackOptions.entry[0].indexOf('client/index.js?') !== -1);
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

    addDevServerEntrypoints(webpackOptions, devServerOptions);

    assert.equal(webpackOptions.entry.foo.length, 2);
    assert(webpackOptions.entry.foo[0].indexOf('client/index.js?') !== -1);
    assert.equal(webpackOptions.entry.foo[1], './foo.js');
    assert.equal(webpackOptions.entry.bar[1], './bar.js');
  });

  it('defaults to src if no entry point is given', () => {
    const webpackOptions = {};
    const devServerOptions = {};

    addDevServerEntrypoints(webpackOptions, devServerOptions);

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

    addDevServerEntrypoints(webpackOptions, devServerOptions);

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

    addDevServerEntrypoints(webpackOptions, devServerOptions);

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

    addDevServerEntrypoints(webpackOptions, devServerOptions);

    const hotClientScript = webpackOptions.entry.app[1];
    assert.equal(hotClientScript.includes('webpack/hot/dev-server'), true);
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

    addDevServerEntrypoints(webpackOptions, devServerOptions);

    const hotClientScript = webpackOptions.entry.app[1];
    assert.equal(hotClientScript.includes('webpack/hot/only-dev-server'), true);
    assert.equal(hotClientScript, require.resolve(hotClientScript));
  });
});
