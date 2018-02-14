'use strict';

const path = require('path');
const UglifyJSPlugin = require('uglifyjs-webpack-plugin');
const CopyPlugin = require('copy-webpack-plugin');

module.exports = {
  mode: 'development',
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules|web_modules/,
        use: [
          {
            loader: 'babel-loader'
          }
        ]
      },
      {
        test: /\.html$/,
        use: ['html-loader']
      },
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
    new UglifyJSPlugin(),
    new CopyPlugin([{
      from: path.resolve(__dirname, 'live.html'),
      to: path.resolve(__dirname, '../../client/live.html')
    }])
  ]
};
