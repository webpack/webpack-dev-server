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
    new webpack.NormalModuleReplacementPlugin(/\/clients\//, (resource) => {
      resource.request = resource.request.replace(
        /\/clients\//,
        '/../clients/'
      );
    }),
  ],
};
