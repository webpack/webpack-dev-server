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

  const ClassWithoutConstructor = class ClassWithoutConstructor {};
  // eslint-disable-next-line no-undefined
  ClassWithoutConstructor.prototype.constructor = undefined;

  const badSetups = [
    {
      title: 'should throw with serverMode (bad path)',
      config: {
        serverMode: '/bad/path/to/implementation',
      },
    },
    {
      title:
        'should throw with serverMode (no constructor, send, close, onConnection methods)',
      config: {
        serverMode: ClassWithoutConstructor,
      },
    },
    {
      title:
        'should throw with serverMode (no send, close, onConnection methods)',
      config: {
        serverMode: class ServerImplementation extends BaseServer {
          constructor(server) {
            super(server);
          }
        },
      },
    },
    {
      title: 'should throw with serverMode (no close, onConnection methods)',
      config: {
        serverMode: class ServerImplementation extends BaseServer {
          constructor(server) {
            super(server);
          }

          send(connection, message) {}
        },
      },
    },
    {
      title: 'should throw with serverMode (no onConnection method)',
      config: {
        serverMode: class ServerImplementation extends BaseServer {
          constructor(server) {
            super(server);
          }

          send(connection, message) {}

          close(connection) {}
        },
      },
    },
  ];

  badSetups.forEach((setup) => {
    it(setup.title, () => {
      let thrown = false;
      try {
        getSocketServerImplementation(setup.config);
      } catch (e) {
        thrown = true;
        expect(e).toMatchSnapshot();
      }
    });
  });
});
