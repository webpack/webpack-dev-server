'use strict';

const path = require('path');

module.exports = {
  mode: 'production',
  entry: path.join(__dirname, 'index.js'),
  output: {
    path: path.resolve(__dirname, '../../client/sockjs'),
    filename: 'sockjs.bundle.js',
    library: 'SockJS',
    libraryTarget: 'umd',
  },
  target: ['web', 'es5'],
};
