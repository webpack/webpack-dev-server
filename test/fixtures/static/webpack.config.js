'use strict';

const path = require('path');

module.exports = {
  mode: 'development',
  entry: path.resolve(__dirname, 'foo.js'),
  devServer: {
    static: path.resolve(__dirname, 'static'),
  },
};
