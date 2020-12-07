'use strict';

const path = require('path');
const webpack = require('webpack');

module.exports = {
  mode: 'production',
  entry: path.join(__dirname, 'index.js'),
  output: {
    path: path.resolve(__dirname, '../../client/default'),
    filename: 'index.bundle.js',
  },
  // Workaround for webpack@4 installation
  target: webpack.webpack ? ['web', 'es5'] : 'web',
  module: {
    rules: [
      {
        test: /\.js$/,
        use: [
          {
            loader: 'babel-loader',
          },
        ],
      },
    ],
  },
};
