'use strict';

module.exports = {
  context: __dirname,
  entry: './foo.js',
  output: {
    filename: 'bundle.js',
    publicPath: '/'
  }
};
