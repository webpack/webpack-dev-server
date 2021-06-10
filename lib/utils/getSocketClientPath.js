'use strict';

function getSocketClientPath(options) {
  let ClientImplementation;
  let clientImplementationFound = true;

  const isKnownWebSocketServerImplementation =
    typeof options.webSocketServer.type === 'string' &&
    (options.webSocketServer.type === 'ws' ||
      options.webSocketServer.type === 'sockjs');

  let clientTransport;

  if (typeof options.client.transport !== 'undefined') {
    clientTransport = options.client.transport;
  } else if (isKnownWebSocketServerImplementation) {
    clientTransport = options.webSocketServer.type;
  }

  switch (typeof clientTransport) {
    case 'string':
      // could be 'sockjs', 'ws', or a path that should be required
      if (clientTransport === 'sockjs') {
        ClientImplementation = require.resolve(
          '../../client/clients/SockJSClient'
        );
      } else if (clientTransport === 'ws') {
        ClientImplementation = require.resolve(
          '../../client/clients/WebsocketClient'
        );
      } else {
        try {
          // eslint-disable-next-line import/no-dynamic-require
          ClientImplementation = require.resolve(clientTransport);
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
      `${
        !isKnownWebSocketServerImplementation
          ? 'When you use custom web socket implementation you must explicitly specify client.transport. '
          : ''
      }client.transport must be a string denoting a default implementation (e.g. 'sockjs', 'ws') or a full path to a JS file which exports a class extending BaseClient (webpack-dev-server/client-src/clients/BaseClient.js) via require.resolve(...)`
    );
  }

  return ClientImplementation;
}

module.exports = getSocketClientPath;
