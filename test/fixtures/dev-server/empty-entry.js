'use strict';

const ExitOnDonePlugin = require('../../helpers/ExitOnDonePlugin');

module.exports = {
  mode: 'development',
  stats: { orphanModules: true, preset: 'detailed' },
  entry: {},
  devServer: {
    client: {
      transport: 'sockjs',
    },
  },
  plugins: [ExitOnDonePlugin],
};
