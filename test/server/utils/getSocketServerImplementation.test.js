'use strict';

/* eslint-disable constructor-super, no-empty-function, no-useless-constructor, no-unused-vars, class-methods-use-this */

const getSocketServerImplementation = require('../../../lib/utils/getSocketServerImplementation');
const BaseServer = require('../../../lib/servers/BaseServer');
const SockJSServer = require('../../../lib/servers/SockJSServer');

describe('getSocketServerImplementation util', () => {
  it("should work with string serverMode ('sockjs')", () => {
    let result;

    expect(() => {
      result = getSocketServerImplementation({
        serverMode: 'sockjs',
      });
    }).not.toThrow();

    expect(result).toEqual(SockJSServer);
  });

  it('should work with serverMode (SockJSServer class)', () => {
    let result;

    expect(() => {
      result = getSocketServerImplementation({
        serverMode: SockJSServer,
      });
    }).not.toThrow();

    expect(result).toEqual(SockJSServer);
  });

  it('should work with serverMode (SockJSServer full path)', () => {
    let result;

    expect(() => {
      result = getSocketServerImplementation({
        serverMode: require.resolve('../../../lib/servers/SockJSServer'),
      });
    }).not.toThrow();

    expect(result).toEqual(SockJSServer);
  });

  it('should throw with serverMode (bad path)', () => {
    expect(() => {
      getSocketServerImplementation({
        serverMode: '/bad/path/to/implementation',
      });
    }).toThrow(/serverMode must be a string denoting a default implementation/);
  });

  it('should throw with serverMode (not extending BaseServer)', () => {
    expect(() => {
      getSocketServerImplementation({
        serverMode: class ServerImplementation {},
      });
    }).toThrow(
      'serverMode must extend the class BaseServer, found via require(webpack-dev-server/lib/servers/BaseServer)'
    );
  });

  it('should throw with serverMode (incorrect constructor)', () => {
    expect(() => {
      getSocketServerImplementation({
        serverMode: class ServerImplementation extends BaseServer {
          constructor() {}
        },
      });
    }).toThrow(
      'serverMode must have a constructor that takes a single server argument and calls super(server)'
    );
  });

  it('should throw with serverMode (no send method)', () => {
    expect(() => {
      getSocketServerImplementation({
        serverMode: class ServerImplementation extends BaseServer {
          constructor(server) {
            super(server);
          }
        },
      });
    }).toThrow(
      'serverMode must have a send(connection, message) method that sends the message string to the provided client connection object'
    );
  });

  it('should throw with serverMode (incorrect send parameters)', () => {
    expect(() => {
      getSocketServerImplementation({
        serverMode: class ServerImplementation extends BaseServer {
          constructor(server) {
            super(server);
          }

          send(connection) {}
        },
      });
    }).toThrow(
      'serverMode must have a send(connection, message) method that sends the message string to the provided client connection object'
    );
  });

  it('should throw with serverMode (no close method)', () => {
    expect(() => {
      getSocketServerImplementation({
        serverMode: class ServerImplementation extends BaseServer {
          constructor(server) {
            super(server);
          }

          send(connection, message) {}
        },
      });
    }).toThrow(
      'serverMode must have a close(connection) method that closes the provided client connection object'
    );
  });

  it('should throw with serverMode (no onConnection method)', () => {
    expect(() => {
      getSocketServerImplementation({
        serverMode: class ServerImplementation extends BaseServer {
          constructor(server) {
            super(server);
          }

          send(connection, message) {}

          close(connection) {}
        },
      });
    }).toThrow(
      'serverMode must have a onConnection(f) method that calls f(connection) whenever a new client connection is made'
    );
  });
});
