'use strict';

const { resolve } = require('path');
const ExitOnDonePlugin = require('../../helpers/ExitOnDonePlugin');

module.exports = {
  mode: 'development',
  stats: 'detailed',
  entry: resolve(__dirname, './foo.js'),
  devServer: {
    client: {
      path: '/custom/path',
    },
    transportMode: {
      server: 'sockjs',
      client: 'sockjs',
    },
  },
  plugins: [ExitOnDonePlugin],
};
