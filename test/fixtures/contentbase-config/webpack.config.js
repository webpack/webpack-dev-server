'use strict';

module.exports = {
  mode: 'development',
  context: __dirname,
  entry: './foo.js',
  output: {
    publicPath: '/',
  },
  infrastructureLogging: {
    level: 'warn',
  },
};
