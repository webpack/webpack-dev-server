'use strict';

module.exports = {
  context: __dirname,
  entry: './foo.js',
  output: {
    filename: 'bundle.js',
    path: '/'
  },
  module: {
    rules: [
      {
        test: /\.html$/,
        loader: 'file-loader',
        options: { name: 'index.html' }
      }
    ]
  }
};
