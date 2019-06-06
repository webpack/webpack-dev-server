'use strict';

function getSocketClientPath(options) {
  let ClientImplementation;
  let clientImplFound = true;
  switch (typeof options.clientMode) {
    case 'string':
      // could be 'sockjs', in the future 'ws', or a path that should be required
      if (options.clientMode === 'sockjs') {
        // eslint-disable-next-line global-require
        ClientImplementation = require('../clients/SockJSClient');
      } else {
        try {
          // eslint-disable-next-line global-require, import/no-dynamic-require
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
      "clientMode must be a string denoting a default implementation (e.g. 'sockjs') or a full path to " +
        'a JS file which exports a class extending BaseClient (webpack-dev-server/lib/clients/BaseClient) ' +
        'via require.resolve(...)'
    );
  }

  return ClientImplementation.getClientPath(options);
}

module.exports = getSocketClientPath;
