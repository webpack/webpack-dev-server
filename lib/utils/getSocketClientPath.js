'use strict';

function getSocketClientPath(options) {
  let ClientImplementation;
  let clientImplFound = true;
  switch (typeof options.clientMode) {
    case 'string':
      // could be 'sockjs', 'ws', or a path that should be required
      if (options.clientMode === 'sockjs') {
        ClientImplementation = require('../../client/clients/SockJSClient');
      } else if (options.clientMode === 'ws') {
        ClientImplementation = require('../../client/clients/WebsocketClient');
      } else {
        try {
          // eslint-disable-next-line import/no-dynamic-require
          ClientImplementation = require(options.clientMode);
        } catch (e) {
          clientImplFound = false;
        }
      }
      break;
    default:
      clientImplFound = false;
  }

  if (!clientImplFound) {
    throw new Error(
      "clientMode must be a string denoting a default implementation (e.g. 'sockjs', 'ws') or a full path to " +
        'a JS file which exports a class extending BaseClient (webpack-dev-server/client-src/clients/BaseClient) ' +
        'via require.resolve(...)'
    );
  }

  return ClientImplementation.getClientPath(options);
}

module.exports = getSocketClientPath;
