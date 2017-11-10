'use strict';

// our setup function adds behind-the-scenes bits to the config that all of our
// examples need
const { setup } = require('../../util');

module.exports = [
  setup({
    devtool: 'source-map',
    target: 'web',
    entry: './web.js',
    output: {
      filename: 'web.bundle.js',
      path: __dirname
    }
  }),
  {
    devtool: 'source-map',
    target: 'webworker',
    entry: './worker.js',
    output: {
      filename: 'worker.bundle.js',
      path: __dirname
    }
  }
];
