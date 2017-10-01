'use strict';

const path = require('path');
const UglifyJSPlugin = require('uglifyjs-webpack-plugin');

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
  },
  plugins: [
    new UglifyJSPlugin()
  ]
};
