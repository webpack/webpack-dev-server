'use strict';

const Webpack = require('webpack');
const WebpackDevServer = require('../../');
const webpackConfig = require('./webpack.config');

const compiler = Webpack(webpackConfig);
try {
  const server = new WebpackDevServer(compiler, {
    host: '127.0.0.1',
    port: 8080,
    publicPath: '/',
    stats: {
      colors: true
    }
  });

  server.listen(() => {
    console.log('Starting server on http://localhost:8080');
  });
} catch (e) {
  console.log(e);
}
