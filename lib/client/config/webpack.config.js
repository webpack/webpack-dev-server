'use strict';

const path = require('path');

module.exports = {
  output: {
    filename: 'webpack-dev-server.js',
    path: path.resolve(__dirname, '../../../public')
  },
  module: {
    rules: [
      {
        test: /\.css$/,
        use: [
          'style-loader',
          'css-loader'
        ]
      }
    ]
  }
};
