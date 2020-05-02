'use strict';

const { join, resolve } = require('path');
const webpack = require('webpack');

module.exports = {
  mode: 'production',
  entry: [
    join(__dirname, '../../node_modules/util'),
    join(__dirname, './index.js'),
  ],
  output: {
    path: resolve('client'),
    filename: 'index.bundle.js',
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules|web_modules/,
        use: [
          {
            loader: 'babel-loader',
          },
        ],
      },
    ],
  },
  plugins: [
    new webpack.NormalModuleReplacementPlugin(
      /^\.\/clients\/SockJSClient$/,
      (resource) => {
        if (resource.context.startsWith(process.cwd())) {
          resource.request = resource.request.replace(
            /^\.\/clients\/SockJSClient$/,
            '../clients/SockJSClient'
          );
        }
      }
    ),
  ],
};
