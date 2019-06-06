'use strict';

const getSocketClientPath = require('../lib/utils/getSocketClientPath');

const sockjsClientPath = require.resolve('../lib/clients/SockJSClient');
const baseClientPath = require.resolve('../lib/clients/BaseClient');

describe('getSocketClientPath', () => {
  it("should work with clientMode: 'sockjs'", () => {
    let result;

    expect(() => {
      result = getSocketClientPath({
        clientMode: 'sockjs',
      });
    }).not.toThrow();

    expect(result).toEqual(sockjsClientPath);
  });

  it('should work with clientMode: SockJSClient full path', () => {
    let result;

    expect(() => {
      result = getSocketClientPath({
        clientMode: sockjsClientPath,
      });
    }).not.toThrow();

    expect(result).toEqual(sockjsClientPath);
  });

  it('should throw with clientMode: bad path', () => {
    expect(() => {
      getSocketClientPath({
        clientMode: '/bad/path/to/implementation',
      });
    }).toThrow(/clientMode must be a string/);
  });

  it('should throw with clientMode: unimplemented client', () => {
    expect(() => {
      getSocketClientPath({
        clientMode: baseClientPath,
      });
    }).toThrow('Client needs implementation');
  });
});
