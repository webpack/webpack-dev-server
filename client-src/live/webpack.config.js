'use strict';

const path = require('path');
const webpack = require('webpack');
const CopyPlugin = require('copy-webpack-plugin');

module.exports = {
  mode: 'production',
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
      {
        test: /\.html$/,
        use: ['html-loader'],
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader'],
      },
    ],
  },
  plugins: [
    new CopyPlugin([
      {
        from: path.resolve(__dirname, 'live.html'),
        to: path.resolve(__dirname, '../../client/live.html'),
      },
    ]),
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
