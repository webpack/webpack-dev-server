'use strict';

module.exports = {
  context: __dirname,
  entry: './app.js',
  devServer: {
    proxy: {
      '/api': {
        target: 'http://jsonplaceholder.typicode.com/',
        changeOrigin: true,
        pathRewrite: {
          '^/api': ''
        },
        bypass(req) {
          if (req.url === '/api/nope') {
            return '/bypass.html';
          }
        }
      }
    }
  }
};
