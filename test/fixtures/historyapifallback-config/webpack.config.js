'use strict';

module.exports = {
  mode: 'development',
  context: __dirname,
  entry: './foo.js',
  output: {
    path: '/'
  },
  module: {
    rules: [
      {
        test: /\.html$/,
        loader: 'file-loader',
        options: { name: '[name].[ext]' }
      }
    ]
  }
};
