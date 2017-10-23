'use strict';

const path = require('path');
const webpack = require('webpack');

module.exports = {
  context: __dirname,
  entry: './app.js',
  plugins: [
    new webpack.NamedModulesPlugin()
  ],
  devServer: {
    before(app) {
      app.get('/assets/*', (req, res) => {
        const filename = path.join(__dirname, '../', req.path);
        res.sendFile(filename);
      });
    }
  }
};
