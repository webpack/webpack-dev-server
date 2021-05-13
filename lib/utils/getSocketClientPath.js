'use strict';

function getSocketClientPath(options) {
  let ClientImplementation;
  let clientImplementationFound = true;

  const clientTransport =
    options.client.transport || options.webSocketServer.type;

  switch (typeof clientTransport) {
    case 'string':
      // could be 'sockjs', 'ws', or a path that should be required
      if (clientTransport === 'sockjs') {
        ClientImplementation = require('../../client/clients/SockJSClient');
      } else if (clientTransport === 'ws') {
        ClientImplementation = require('../../client/clients/WebsocketClient');
      } else {
        try {
          // eslint-disable-next-line import/no-dynamic-require
          ClientImplementation = require(clientTransport);
        } catch (e) {
          clientImplementationFound = false;
        }
      }
      break;
    default:
      clientImplementationFound = false;
  }

  if (!clientImplementationFound) {
    throw new Error(
      "client.transport must be a string denoting a default implementation (e.g. 'sockjs', 'ws') or a full path to " +
        'a JS file which exports a class extending BaseClient (webpack-dev-server/client-src/clients/BaseClient.js) ' +
        'via require.resolve(...)'
    );
  }

  return ClientImplementation.getClientPath(options);
}

module.exports = getSocketClientPath;
