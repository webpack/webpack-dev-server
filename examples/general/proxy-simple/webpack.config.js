'use strict';

// our setup function adds behind-the-scenes bits to the config that all of our
// examples need
const { setup } = require('../../util');

module.exports = setup({
  context: __dirname,
  entry: './app.js',
  devServer: {
    proxy: [
      {
        context: '/api',
        target: 'http://127.0.0.1:50545',
      },
    ],
  },
});
