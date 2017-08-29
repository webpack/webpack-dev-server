'use strict';

const webpack = require('webpack');

module.exports = [
  {
    context: __dirname,
    entry: './app.js',
    module: {
      rules: [
        {
          test: /\.less$/,
          use: [
            'style-loader',
            'css-loader',
            'less-loader'
          ]
        },
        {
          test: /\.png$/,
          loader: 'file-loader',
          options: { prefix: 'img/' }
        }
      ]
    }
  },
  {
    context: __dirname,
    entry: './app.js',
    output: {
      filename: 'bundle2.js'
    },
    module: {
      rules: [
        {
          test: /\.less$/,
          use: [
            'style-loader',
            'css-loader',
            'less-loader'
          ]
        },
        {
          test: /\.png$/,
          loader: 'url-loader',
          options: { limit: 100000 }
        }
      ]
    },
    plugins: [
      new webpack.optimize.UglifyJsPlugin()
    ]
  }
];
