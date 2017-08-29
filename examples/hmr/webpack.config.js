'use strict';

const webpack = require('webpack');

module.exports = {
  context: __dirname,
  entry: './app.js',
  plugins: [
    new webpack.NamedModulesPlugin()
  ]
};
