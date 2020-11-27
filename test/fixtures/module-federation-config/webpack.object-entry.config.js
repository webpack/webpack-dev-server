'use strict';

module.exports = {
  mode: 'development',
  target: 'node',
  context: __dirname,
  entry: {
    foo: './entry1.js',
    main: ['./entry1.js', './entry2.js'],
  },
  output: {
    path: '/',
    libraryTarget: 'umd',
  },
  infrastructureLogging: {
    level: 'warn',
  },
};
