'use strict';

module.exports = {
  context: __dirname,
  entry: './app.js',
  devServer: {
    host: '0.0.0.0',
    public: 'https://localhost:8080',
    disableHostCheck: true
  }
};
