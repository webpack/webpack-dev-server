'use strict';

const url = require('url');

function createDomain(options, server) {
  const protocol = options.https ? 'https' : 'http';
  // use location hostname and port by default in createSocketURL
  // ipv6 detection is not required as 0.0.0.0 is just used as a placeholder
  let hostname;

  if (server) {
    hostname = server.address().address;
  } else {
    hostname = '0.0.0.0';
  }

  const port = server ? server.address().port : 0;

  // use explicitly defined public url
  // (prefix with protocol if not explicitly given)
  if (typeof options.client.webSocketURL === 'string') {
    return /^[a-zA-Z]+:\/\//.test(options.client.webSocketURL)
      ? `${options.client.webSocketURL}`
      : `${protocol}://${options.client.webSocketURL}`;
  }

  // the formatted domain (url without path) of the webpack server
  return url.format({ protocol, hostname, port });
}

module.exports = createDomain;
