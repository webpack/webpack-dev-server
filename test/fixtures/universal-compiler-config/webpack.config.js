'use strict';

module.exports = [
  {
    mode: 'development',
    context: __dirname,
    entry: './client.js',
    output: {
      path: '/',
      filename: 'client.js',
    },
    node: false,
    infrastructureLogging: {
      level: 'warn',
    },
  },
  {
    mode: 'development',
    context: __dirname,
    target: 'node',
    entry: './server.js',
    output: {
      path: '/',
      filename: 'server.js',
    },
    node: false,
    infrastructureLogging: {
      level: 'warn',
    },
  },
];
