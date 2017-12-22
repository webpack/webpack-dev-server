'use strict';

// our setup function adds behind-the-scenes bits to the config that all of our
// examples need
const { setup } = require('../../util');

module.exports = setup({
  context: __dirname,
  entry: ['./app.js', '../../client/index.js?http://localhost:8080/'],
  output: {
    filename: 'bundle.js'
  }
});
