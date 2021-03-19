'use strict';

const ExitOnDonePlugin = require('../../helpers/ExitOnDonePlugin');

module.exports = {
  mode: 'development',
  stats: { orphanModules: true, preset: 'detailed' },
  entry: {},
  devServer: {
    transportMode: {
      server: 'sockjs',
      client: 'sockjs',
    },
  },
  plugins: [ExitOnDonePlugin],
};
