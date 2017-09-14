'use strict';

module.exports = new Promise(((resolve) => {
  resolve({
    context: __dirname,
    entry: './app.js',
    devServer: {
    }
  });
}));
