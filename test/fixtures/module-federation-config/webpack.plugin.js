'use strict';

const ModuleFederationPlugin = require('webpack').container
  .ModuleFederationPlugin;

module.exports = {
  mode: 'development',
  target: 'node',
  context: __dirname,
  entry: ['./entry1.js'],
  plugins: [
    new ModuleFederationPlugin({
      name: 'app1',
      library: { type: 'var', name: 'app1' },
      filename: 'remoteEntry.js',
      exposes: {
        './entry1': './entry1',
      },
    }),
  ],
  infrastructureLogging: {
    level: 'warn',
  },
};
