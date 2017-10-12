'use strict';

const path = require('path');
const config = require('./webpack.config.js');

module.exports = Object.assign(config, {
  output: {
    filename: 'live.bundle.js',
    path: path.resolve(__dirname, '../../../public')
  }
});
