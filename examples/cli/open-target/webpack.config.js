'use strict';

const HtmlWebpackPlugin = require('html-webpack-plugin');
// our setup function adds behind-the-scenes bits to the config that all of our
// examples need
const { setup } = require('../../util');

module.exports = setup({
  context: __dirname,
  entry: './app.js',
  plugins: [
    new HtmlWebpackPlugin({
      filename: 'example.html',
      template: '../../.assets/layout.html',
      title: 'Open Target / Example',
    }),
  ],
});
