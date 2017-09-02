'use strict';

module.exports = {
  context: __dirname,
  entry: ['../../client/index.js?http://localhost:8080/', './app.js'],
  output: {
    filename: 'bundle.js'
  }
};
