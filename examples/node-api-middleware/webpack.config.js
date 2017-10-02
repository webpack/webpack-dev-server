'use strict';

module.exports = {
  context: __dirname,
  entry: ['./app.js', '../../lib/client/js/index.js?http://localhost:8080/'],
  output: {
    filename: 'bundle.js'
  }
};
