'use strict';

const url = require('url');

function createDomain(options) {
  const protocol = options.https ? 'wss' : 'ws';

  // use explicitly defined public url
  // (prefix with protocol if not explicitly given)
  if (options.client.webSocketUrl) {
    return /^[a-zA-Z]+:\/\//.test(options.client.webSocketUrl)
      ? `${options.client.webSocketUrl}`
      : `${protocol}://${options.client.webSocketUrl}`;
  }

  // the formatted domain (url without path) of the webpack server
  return url.format({
    protocol,
    hostname: '0.0.0.0',
    port: '0',
    pathname: '/ws',
  });
}

module.exports = createDomain;
