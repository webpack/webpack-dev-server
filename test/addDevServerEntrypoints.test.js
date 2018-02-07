'use strict';

const assert = require('assert');
const addDevServerEntrypoints = require('../lib/util/addDevServerEntrypoints');
const config = require('./fixtures/simple-config/webpack.config');

describe('addDevServerEntrypoints', () => {
  it('Entrypoints that are a single file will become an array', () => {
    addDevServerEntrypoints(Object.assign({}, config), {});
    assert(config.entry.length);
  });

  it('Entrypoints that are an array will become a longer array', () => {
    addDevServerEntrypoints(
      Object.assign({}, config, { entry: [config.entry] }),
      {}
    );
    assert(config.entry.length > 1);
  });

  it('Entrypoints that are objects will have more keys', () => {
    addDevServerEntrypoints(
      Object.assign({}, config, { entry: { app: config.entry } }),
      {}
    );
    assert(Object.keys(config.entry).length > 1);
  });
});
