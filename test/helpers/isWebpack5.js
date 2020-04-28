'use strict';

const webpack = require('webpack');

function isWebpack() {
  return webpack.version[0] === '5';
}

module.exports = isWebpack;
