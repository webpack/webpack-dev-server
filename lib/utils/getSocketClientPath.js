'use strict';

function getSocketClientPath(options) {
  let ClientImplementation;
  let clientImplementationFound = true;

  switch (typeof options.transportMode.client.type) {
    case 'string':
      // could be 'sockjs', 'ws', or a path that should be required
      if (options.transportMode.client.type === 'sockjs') {
        ClientImplementation = require('../../client/clients/SockJSClient');
      } else if (options.transportMode.client.type === 'ws') {
        ClientImplementation = require('../../client/clients/WebsocketClient');
      } else {
        try {
          // eslint-disable-next-line import/no-dynamic-require
          ClientImplementation = require(options.transportMode.client.type);
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
      "transportMode.client must be a string denoting a default implementation (e.g. 'sockjs', 'ws') or a full path to " +
        'a JS file which exports a class extending BaseClient (webpack-dev-server/client-src/clients/BaseClient) ' +
        'via require.resolve(...)'
    );
  }

  return ClientImplementation.getClientPath(options);
}

module.exports = getSocketClientPath;
