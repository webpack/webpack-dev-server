'use strict';

module.exports = {
  context: __dirname,
  entry: './app.js',
  devServer: {
    host: '0.0.0.0',
    port: 80,
    public: 'https://localhost',
    disableHostCheck: true
  }
};
