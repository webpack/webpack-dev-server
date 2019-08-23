'use strict';

const getSocketServerImplementation = require('../../../lib/utils/getSocketServerImplementation');
const SockJSServer = require('../../../lib/servers/SockJSServer');
const WebsocketServer = require('../../../lib/servers/WebsocketServer');

describe('getSocketServerImplementation util', () => {
  it("should work with string transportMode.server ('sockjs')", () => {
    let result;

    expect(() => {
      result = getSocketServerImplementation({
        transportMode: {
          server: 'sockjs',
        },
      });
    }).not.toThrow();

    expect(result).toEqual(SockJSServer);
  });

  it('should work with transportMode.server (SockJSServer class)', () => {
    let result;

    expect(() => {
      result = getSocketServerImplementation({
        transportMode: {
          server: SockJSServer,
        },
      });
    }).not.toThrow();

    expect(result).toEqual(SockJSServer);
  });

  it('should work with transportMode.server (SockJSServer full path)', () => {
    let result;

    expect(() => {
      result = getSocketServerImplementation({
        transportMode: {
          server: require.resolve('../../../lib/servers/SockJSServer'),
        },
      });
    }).not.toThrow();

    expect(result).toEqual(SockJSServer);
  });

  it("should work with string transportMode.server ('ws')", () => {
    let result;

    expect(() => {
      result = getSocketServerImplementation({
        transportMode: {
          server: 'ws',
        },
      });
    }).not.toThrow();

    expect(result).toEqual(WebsocketServer);
  });

  it('should work with transportMode.server (WebsocketServer class)', () => {
    let result;

    expect(() => {
      result = getSocketServerImplementation({
        transportMode: {
          server: WebsocketServer,
        },
      });
    }).not.toThrow();

    expect(result).toEqual(WebsocketServer);
  });

  it('should work with transportMode.server (WebsocketServer full path)', () => {
    let result;

    expect(() => {
      result = getSocketServerImplementation({
        transportMode: {
          server: require.resolve('../../../lib/servers/WebsocketServer'),
        },
      });
    }).not.toThrow();

    expect(result).toEqual(WebsocketServer);
  });

  it('should throw with transportMode.server (bad path)', () => {
    expect(() => {
      getSocketServerImplementation({
        transportMode: {
          server: '/bad/path/to/implementation',
        },
      });
    }).toThrow(/transportMode.server must be a string/);
  });
});
