'use strict';

const { resolve } = require('path');

module.exports = {
  mode: 'development',
  stats: 'detailed',
  entry: resolve(__dirname, './foo.js'),
  target: ['web', 'webworker'],
  output: {
    chunkLoading: false,
    wasmLoading: false,
    workerChunkLoading: false,
  },
  devServer: {
    client: {
      path: '/custom/path',
    },
    transportMode: {
      server: 'sockjs',
      client: 'sockjs',
    },
  },
};
