'use strict';

const { resolve } = require('path');
const ExitOnDonePlugin = require('../../helpers/ExitOnDonePlugin');

module.exports = {
  mode: 'development',
  stats: 'detailed',
  context: __dirname,
  entry: {
    foo: resolve(__dirname, './foo.js'),
    bar: resolve(__dirname, './bar.js'),
  },
  devServer: {
    client: {
      transport: 'sockjs',
    },
  },
  plugins: [ExitOnDonePlugin],
};
