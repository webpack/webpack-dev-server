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
        target: 'http://jsonplaceholder.typicode.com/',
        changeOrigin: true,
        pathRewrite: {
          '^/api': '',
        },
        bypass(req) {
          if (req.url === '/api/nope') {
            return '/bypass.html';
          }
        },
      },
    ],
  },
});
