'use strict';

const path = require('path');

module.exports = {
  mode: 'production',
  entry: path.join(__dirname, 'index.js'),
  output: {
    path: path.resolve(__dirname, '../../client/default'),
    filename: 'index.bundle.js',
  },
  target: ['web', 'es5'],
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
