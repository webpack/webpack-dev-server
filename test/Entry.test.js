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
});
