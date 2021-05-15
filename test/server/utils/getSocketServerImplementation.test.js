'use strict';

const getSocketServerImplementation = require('../../../lib/utils/getSocketServerImplementation');
const SockJSServer = require('../../../lib/servers/SockJSServer');
const WebsocketServer = require('../../../lib/servers/WebsocketServer');

describe('getSocketServerImplementation util', () => {
  it("should work with string webSocketServer.type ('sockjs')", () => {
    let result;

    expect(() => {
      result = getSocketServerImplementation({
        webSocketServer: {
          type: 'sockjs',
        },
      });
    }).not.toThrow();

    expect(result).toEqual(SockJSServer);
  });

  it('should work with webSocketServer.type (SockJSServer class)', () => {
    let result;

    expect(() => {
      result = getSocketServerImplementation({
        webSocketServer: {
          type: SockJSServer,
        },
      });
    }).not.toThrow();

    expect(result).toEqual(SockJSServer);
  });

  it('should work with webSocketServer.type (SockJSServer full path)', () => {
    let result;

    expect(() => {
      result = getSocketServerImplementation({
        webSocketServer: {
          type: require.resolve('../../../lib/servers/SockJSServer'),
        },
      });
    }).not.toThrow();

    expect(result).toEqual(SockJSServer);
  });

  it("should work with string webSocketServer.type ('ws')", () => {
    let result;

    expect(() => {
      result = getSocketServerImplementation({
        webSocketServer: {
          type: 'ws',
        },
      });
    }).not.toThrow();

    expect(result).toEqual(WebsocketServer);
  });

  it('should work with webSocketServer.type (WebsocketServer class)', () => {
    let result;

    expect(() => {
      result = getSocketServerImplementation({
        webSocketServer: {
          type: WebsocketServer,
        },
      });
    }).not.toThrow();

    expect(result).toEqual(WebsocketServer);
  });

  it('should work with webSocketServer.type (WebsocketServer full path)', () => {
    let result;

    expect(() => {
      result = getSocketServerImplementation({
        webSocketServer: {
          type: require.resolve('../../../lib/servers/WebsocketServer'),
        },
      });
    }).not.toThrow();

    expect(result).toEqual(WebsocketServer);
  });

  it('should throw with webSocketServer.type (bad path)', () => {
    expect(() => {
      getSocketServerImplementation({
        webSocketServer: {
          type: '/bad/path/to/implementation',
        },
      });
    }).toThrowError(
      /webSocketServer \(webSocketServer.type\) must be a string/
    );
  });
});
