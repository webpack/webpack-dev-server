'use strict';

const { resolve } = require('path');

module.exports = {
  mode: 'development',
  entry: {
    foo: resolve(__dirname, './foo.js'),
    bar: resolve(__dirname, './bar.js'),
  },
  devServer: {
    transportMode: {
      server: 'sockjs',
      client: 'sockjs',
    },
  },
};
