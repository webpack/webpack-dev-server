'use strict';

const Webpack = require('webpack');
const WebpackDevServer = require('../../');
const webpackConfig = require('./webpack.config');

const compiler = Webpack(webpackConfig);
const server = new WebpackDevServer(compiler, {
  host: '127.0.0.1',
  port: 8080,
  publicPath: '/',
  stats: {
    colors: true
  },
  before(app) {
    app.use((req, res, next) => {
      console.log(`Using middleware for ${req.url}`);
      next();
    });
  }
});

server.listen(() => {
  console.log('Starting server on http://localhost:8080');
});
