'use strict';

const path = require('path');
const webpack = require('webpack');

module.exports = {
  mode: 'production',
  entry: path.join(__dirname, 'index.js'),
  output: {
    path: path.resolve(__dirname, '../../client/sockjs'),
    filename: 'sockjs.bundle.js',
    library: 'SockJS',
    libraryTarget: 'umd',
  },
  // Workaround for webpack@4 installation
  target: webpack.webpack ? ['web', 'es5'] : 'web',
};
