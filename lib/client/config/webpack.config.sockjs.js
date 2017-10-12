'use strict';

const path = require('path');
const UglifyJSPlugin = require('uglifyjs-webpack-plugin');

module.exports = {
  output: {
    filename: 'sockjs.bundle.js',
    path: path.resolve(__dirname, '../../../public'),
    library: 'SockJS',
    libraryTarget: 'umd'
  },
  plugins: [
    new UglifyJSPlugin()
  ]
};
