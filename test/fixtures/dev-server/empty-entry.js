'use strict';

module.exports = {
  mode: 'development',
  stats: 'detailed',
  entry: {},
  devServer: {
    transportMode: {
      server: 'sockjs',
      client: 'sockjs',
    },
  },
};
