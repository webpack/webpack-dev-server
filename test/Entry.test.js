'use strict';

const assert = require('assert');
const addDevServerEntrypoints = require('../lib/util/addDevServerEntrypoints');

describe('Entry', () => {
  it('default to src if no entry point is given', (done) => {
    const webpackOptions = {};
    const devServerOptions = {};

    addDevServerEntrypoints(webpackOptions, devServerOptions);

    assert(webpackOptions.entry.length, 2);
    assert(webpackOptions.entry[1], './src');

    done();
  });
});
