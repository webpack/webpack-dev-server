'use strict';

const { join } = require('path');

module.exports = () => {
  return new Promise((resolve) => {
    resolve({
      mode: 'development',
      entry: join(__dirname, 'foo.js'),
    });
  });
};
