'use strict';

module.exports = {
  mode: 'development',
  context: __dirname,
  entry: './foo.js',
  output: {
    path: '/',
  },
  node: false,
  infrastructureLogging: {
    level: 'warn',
  },
  module: {
    rules: [
      {
        test: /\.custom$/,
        use: [
          {
            loader: 'file-loader',
            options: {
              name() {
                return '[name].[ext]';
              },
            },
          },
        ],
      },
    ],
  },
};
