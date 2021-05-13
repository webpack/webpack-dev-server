'use strict';

function getSocketServerImplementation(options) {
  let ServerImplementation;
  let ServerImplementationFound = true;

  switch (typeof options.webSocketServer.type) {
    case 'string':
      // could be 'sockjs', in the future 'ws', or a path that should be required
      if (options.webSocketServer.type === 'sockjs') {
        ServerImplementation = require('../servers/SockJSServer');
      } else if (options.webSocketServer.type === 'ws') {
        ServerImplementation = require('../servers/WebsocketServer');
      } else {
        try {
          // eslint-disable-next-line import/no-dynamic-require
          ServerImplementation = require(options.webSocketServer.type);
        } catch (e) {
          ServerImplementationFound = false;
        }
      }
      break;
    case 'function':
      // Potentially do more checks here to confirm that the user implemented this properly since errors could be difficult to understand
      ServerImplementation = options.webSocketServer.type;
      break;
    default:
      ServerImplementationFound = false;
  }

  if (!ServerImplementationFound) {
    throw new Error(
      "webSocketServer (webSocketServer.type) must be a string denoting a default implementation (e.g. 'ws', 'sockjs'), a full path to " +
        'a JS file which exports a class extending BaseServer (webpack-dev-server/lib/servers/BaseServer.js) ' +
        'via require.resolve(...), or the class itself which extends BaseServer'
    );
  }

  return ServerImplementation;
}

module.exports = getSocketServerImplementation;
