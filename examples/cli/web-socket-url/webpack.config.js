'use strict';

// our setup function adds behind-the-scenes bits to the config that all of our
// examples need
const { setup } = require('../../util');

module.exports = setup({
  context: __dirname,
  entry: './app.js',
  devServer: {
    host: '0.0.0.0',
    client: {
      webSocketURL: 'ws://localhost:8080',
    },
    allowedHosts: 'all',
  },
});
