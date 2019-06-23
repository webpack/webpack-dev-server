'use strict';

function getSocketServerImplementation(options) {
  let ServerImplementation;
  let serverImplFound = true;
  switch (typeof options.serverMode) {
    case 'string':
      // could be 'sockjs', in the future 'ws', or a path that should be required
      if (options.serverMode === 'sockjs') {
        // eslint-disable-next-line global-require
        ServerImplementation = require('../servers/SockJSServer');
      } else {
        try {
          // eslint-disable-next-line global-require, import/no-dynamic-require
          ServerImplementation = require(options.serverMode);
        } catch (e) {
          serverImplFound = false;
        }
      }
      break;
    case 'function':
      // potentially do more checks here to confirm that the user implemented this properlly
      // since errors could be difficult to understand
      ServerImplementation = options.serverMode;
      break;
    default:
      serverImplFound = false;
  }

  if (!serverImplFound) {
    throw new Error(
      "serverMode must be a string denoting a default implementation (e.g. 'sockjs'), a full path to " +
        'a JS file which exports a class extending BaseServer (webpack-dev-server/lib/servers/BaseServer) ' +
        'via require.resolve(...), or the class itself which extends BaseServer'
    );
  }

  if (
    !ServerImplementation.prototype.constructor ||
    ServerImplementation.prototype.constructor.length < 1
  ) {
    throw new Error(
      'serverMode must have a constructor that takes a single server argument and calls super(server) ' +
        "on the superclass BaseServer, found via require('webpack-dev-server/lib/servers/BaseServer')"
    );
  }

  if (
    !ServerImplementation.prototype.send ||
    ServerImplementation.prototype.send.length < 2
  ) {
    throw new Error(
      'serverMode must have a send(connection, message) method that sends the message string to the provided client connection object'
    );
  }

  if (
    !ServerImplementation.prototype.close ||
    ServerImplementation.prototype.close.length < 1
  ) {
    throw new Error(
      'serverMode must have a close(connection) method that closes the provided client connection object'
    );
  }

  if (
    !ServerImplementation.prototype.onConnection ||
    ServerImplementation.prototype.onConnection.length < 1
  ) {
    throw new Error(
      'serverMode must have a onConnection(f) method that calls f(connection) whenever a new client connection is made'
    );
  }

  return ServerImplementation;
}

module.exports = getSocketServerImplementation;
