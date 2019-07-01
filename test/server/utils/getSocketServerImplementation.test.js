'use strict';

const getSocketServerImplementation = require('../../../lib/utils/getSocketServerImplementation');
const SockJSServer = require('../../../lib/servers/SockJSServer');
const WebsocketServer = require('../../../lib/servers/WebsocketServer');

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

  it("should work with string serverMode ('ws')", () => {
    let result;

    expect(() => {
      result = getSocketServerImplementation({
        serverMode: 'ws',
      });
    }).not.toThrow();

    expect(result).toEqual(WebsocketServer);
  });

  it('should work with serverMode (WebsocketServer class)', () => {
    let result;

    expect(() => {
      result = getSocketServerImplementation({
        serverMode: WebsocketServer,
      });
    }).not.toThrow();

    expect(result).toEqual(WebsocketServer);
  });

  it('should work with serverMode (WebsocketServer full path)', () => {
    let result;

    expect(() => {
      result = getSocketServerImplementation({
        serverMode: require.resolve('../../../lib/servers/WebsocketServer'),
      });
    }).not.toThrow();

    expect(result).toEqual(WebsocketServer);
  });

  it('should throw with serverMode (bad path)', () => {
    expect(() => {
      getSocketServerImplementation({
        serverMode: '/bad/path/to/implementation',
      });
    }).toThrow(/serverMode must be a string/);
  });
});
