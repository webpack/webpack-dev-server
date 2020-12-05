'use strict';

const { join } = require('path');

module.exports = {
  mode: 'development',
  entry: join(__dirname, 'foo.js'),
  devServer: {
    dev: {
      publicPath: '/foo/bar',
    },
  },
};
