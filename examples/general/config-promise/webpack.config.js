'use strict';

const http = require('http');
const { setup } = require('../../util');

const basePort = 8085;

module.exports = async () => {
  await new Promise((resolve) => {
    const server = http.createServer();

    server.listen(basePort, resolve);
  });

  return setup({
    context: __dirname,
    entry: './app.js',
    devServer: {
      port: {
        // basePort,
        highestPort: 8090,
      },
    },
  });
};
