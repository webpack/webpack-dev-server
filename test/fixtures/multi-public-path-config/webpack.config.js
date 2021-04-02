'use strict';

const path = require('path');

module.exports = [
  {
    mode: 'development',
    context: __dirname,
    entry: './foo.js',
    output: {
      path: __dirname,
      filename: 'foo.js',
      publicPath: '/bundle1/',
    },
    infrastructureLogging: {
      level: 'warn',
    },
    module: {
      rules: [
        {
          test: /\.html$/,
          loader: 'file-loader',
          options: {
            name: 'path/to/file.html',
          },
        },
      ],
    },
  },
  {
    mode: 'development',
    context: __dirname,
    entry: './bar.js',
    output: {
      path: path.join(__dirname, 'named'),
      filename: 'bar.js',
      publicPath: '/bundle2/',
    },
    name: 'named',
    stats: 'none',
    infrastructureLogging: {
      level: 'warn',
    },
  },
  {
    mode: 'development',
    context: __dirname,
    entry: './bar.js',
    output: {
      path: path.join(__dirname, 'dist'),
      filename: 'bar.js',
      publicPath: 'auto',
    },
    name: 'other',
    stats: false,
  },
];
