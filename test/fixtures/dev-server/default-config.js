'use strict';

const { resolve } = require('path');

module.exports = {
  mode: 'development',
  stats: 'detailed',
  entry: resolve(__dirname, './foo.js'),
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
