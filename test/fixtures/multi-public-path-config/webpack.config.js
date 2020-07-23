'use strict';

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
    node: false,
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
      path: __dirname,
      filename: 'bar.js',
      publicPath: '/bundle2/',
    },
    node: false,
    infrastructureLogging: {
      level: 'warn',
    },
  },
];
