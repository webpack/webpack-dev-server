'use strict';

const path = require('path');
const webpack = require('webpack');
const { merge } = require('webpack-merge');

const base = {
  mode: 'production',
  output: {
    path: path.resolve(__dirname, '../../client/transpiled-modules'),
    libraryTarget: 'commonjs2',
  },
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

module.exports = [
  merge(base, {
    entry: path.join(__dirname, 'log.js'),
    output: {
      filename: 'log.js',
    },
  }),
  merge(base, {
    entry: path.join(__dirname, 'strip-ansi.js'),
    output: {
      filename: 'strip-ansi.js',
    },
  }),
];
