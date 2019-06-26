'use strict';

const webpack = require('webpack');

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
    ],
  },
  plugins: [
    new webpack.NormalModuleReplacementPlugin(
      /^\.\/clients\/SockJSClient$/,
      (resource) => {
        if (
          resource.context.includes('/client-src/default') ||
          resource.context.includes('\\client-src\\default')
        ) {
          resource.request = resource.request.replace(
            /^\.\/clients\/SockJSClient$/,
            '../clients/SockJSClient'
          );
        }
      }
    ),
  ],
};
