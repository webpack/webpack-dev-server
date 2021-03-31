'use strict';

const path = require('path');
const webpack = require('webpack');
const { merge } = require('webpack-merge');

const baseForModules = {
  devtool: false,
  mode: 'development',
  output: {
    path: path.resolve(__dirname, '../client/modules'),
    libraryTarget: 'commonjs2',
  },
  target: webpack.webpack ? ['web', 'es5'] : 'web',
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

module.exports = [
  merge(baseForModules, {
    entry: path.join(__dirname, 'modules/logger/index.js'),
    output: {
      filename: 'logger/index.js',
    },
    module: {
      rules: [
        {
          test: /\.js$/,
          use: [
            {
              loader: 'babel-loader',
              options: {
                plugins: ['@babel/plugin-transform-object-assign'],
              },
            },
          ],
        },
      ],
    },
    plugins: [
      new webpack.NormalModuleReplacementPlugin(
        /^tapable\/lib\/SyncBailHook/,
        path.join(__dirname, 'modules/logger/SyncBailHookFake.js')
      ),
    ],
  }),
  merge(baseForModules, {
    entry: path.join(__dirname, 'modules/strip-ansi/index.js'),
    output: {
      filename: 'strip-ansi/index.js',
    },
  }),
  merge(baseForModules, {
    entry: path.join(__dirname, 'modules/sockjs-client/index.js'),
    output: {
      filename: 'sockjs-client/index.js',
      library: 'SockJS',
      libraryTarget: 'umd',
      globalObject: "(typeof self !== 'undefined' ? self : this)",
    },
  }),
];
