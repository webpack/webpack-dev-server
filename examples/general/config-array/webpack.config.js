'use strict';

// our setup function adds behind-the-scenes bits to the config that all of our
// examples need
const { setup } = require('../../util');

module.exports = [
  setup({
    context: __dirname,
    entry: './app.js',
    optimization: {
      minimize: true
    },
    module: {
      rules: [
        {
          test: /\.less$/,
          use: ['style-loader', 'css-loader', 'less-loader'],
        },
        {
          test: /\.png$/,
          loader: 'file-loader',
          options: { prefix: 'img/' }
        },
        {
          test: /\.(woff|woff2|eot|ttf|otf)$/,
          use: 'url-loader?limit=10000&name=font/[hash].[ext]'
        },
        {
          test: /\.svg$/,
          use: 'url-loader?limit=8192&name=image/[hash].[ext]'
        }
      ]
    }

  }),
  setup({
    context: __dirname,
    entry: './app.js',
    output: {
      filename: 'bundle.js'
    },
    optimization: {
      minimize: true
    },
    module: {
      rules: [
        {
          test: /\.less$/,
          use: ['style-loader', 'css-loader', 'less-loader'],
        },
        {
          test: /\.png$/,
          loader: 'url-loader',
          options: { limit: 100000 }
        },
        {
          test: /\.(woff|woff2|eot|ttf|otf)$/,
          use: 'url-loader?limit=10000&name=font/[hash].[ext]'
        },
        {
          test: /\.svg$/,
          use: 'url-loader?limit=8192&name=image/[hash].[ext]'
        }
      ]
    }
  })

];
