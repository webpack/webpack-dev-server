'use strict';

// our setup function adds behind-the-scenes bits to the config that all of our
// examples need
const { setup } = require('../../util');

module.exports = setup({
  context: __dirname,
  entry: './app.js',
  module: {
    rules: [
      {
        test: /\.less$/,
        use: [
          'style-loader',
          'css-loader',
          'less-loader'
        ]
      },
      {
        test: /\.png$/,
        loader: 'file-loader',
        options: { prefix: 'img/' }
      }
    ]
  }
});
