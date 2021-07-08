'use strict';

module.exports = {
  mode: 'development',
  context: __dirname,
  stats: 'none',
  entry: './foo.js',
  output: {
    path: '/',
  },
  module: {
    rules: [
      {
        test: /\.css$/,
        use: [{ loader: 'style-loader' }, { loader: 'css-loader' }],
      },
    ],
  },
  node: false,
  infrastructureLogging: {
    level: 'warn',
  },
};
