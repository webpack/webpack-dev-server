'use strict';

const ExitOnDonePlugin = require('../../helpers/ExitOnDonePlugin');

module.exports = {
  mode: 'development',
  stats: {
    colors: true,
  },
  context: __dirname,
  entry: './foo.js',
  plugins: [ExitOnDonePlugin],
};
