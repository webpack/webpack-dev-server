'use strict';

const url = require('url');

function createDomain(options) {
  const protocol = options.https ? 'wss' : 'ws';

  // use explicitly defined public url
  // (prefix with protocol if not explicitly given)
  if (options.client.socketUrl) {
    return /^[a-zA-Z]+:\/\//.test(options.client.socketUrl)
      ? `${options.client.socketUrl}`
      : `${protocol}://${options.client.socketUrl}`;
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
