'use strict';

const getSocketServerImplementation = require('../../../lib/utils/getSocketServerImplementation');
const SockJSServer = require('../../../lib/servers/SockJSServer');

describe('getSocketServerImplementation util', () => {
  it("should works with string serverMode ('sockjs')", () => {
    let result;

    expect(() => {
      result = getSocketServerImplementation({
        serverMode: 'sockjs',
      });
    }).not.toThrow();

    expect(result).toEqual(SockJSServer);
  });

  it('should works with serverMode (SockJSServer class)', () => {
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

  it('should throws with serverMode (bad path)', () => {
    expect(() => {
      getSocketServerImplementation({
        serverMode: '/bad/path/to/implementation',
      });
    }).toThrow(/serverMode must be a string/);
  });
});
