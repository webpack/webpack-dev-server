'use strict';

const assert = require('assert');
const addDevServerEntrypoints = require('../lib/util/addDevServerEntrypoints');

describe('Entry', () => {
  it('defaults to src if no entry point is given', () => {
    const webpackOptions = {};
    const devServerOptions = {};

    addDevServerEntrypoints(webpackOptions, devServerOptions);

    assert.equal(webpackOptions.entry.length, 2);
    assert.equal(webpackOptions.entry[1], './src');
  });
});
