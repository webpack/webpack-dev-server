'use strict';

const getSocketClientPath = require('../../../lib/utils/getSocketClientPath');
// 'npm run prepare' must be done for this test to pass
const sockjsClientPath = require.resolve(
  '../../../client/clients/SockJSClient'
);
const baseClientPath = require.resolve('../../../client/clients/BaseClient');

describe('getSocketClientPath', () => {
  it("should work with client.transport: 'sockjs'", () => {
    let result;

    expect(() => {
      result = getSocketClientPath({
        client: {
          transport: 'sockjs',
        },
        webSocketServer: 'sockjs',
      });
    }).not.toThrow();

    expect(result).toEqual(sockjsClientPath);
  });

  it('should work with client.transport: SockJSClient full path', () => {
    let result;

    expect(() => {
      result = getSocketClientPath({
        client: {
          transport: sockjsClientPath,
        },
        webSocketServer: 'sockjs',
      });
    }).not.toThrow();

    expect(result).toEqual(sockjsClientPath);
  });

  it('should throw with client.transport: bad path', () => {
    expect(() => {
      getSocketClientPath({
        client: {
          transport: '/bad/path/to/implementation',
        },
        webSocketServer: 'sockjs',
      });
    }).toThrow(/client.transport must be a string/);
  });

  it('should throw with transportMode.client: bad type', () => {
    expect(() => {
      getSocketClientPath({
        client: {
          transport: 1,
        },
        webSocketServer: 'sockjs',
      });
    }).toThrow(/client.transport must be a string/);
  });

  it('should throw with client.transport: unimplemented client', () => {
    expect(() => {
      getSocketClientPath({
        client: {
          transport: baseClientPath,
        },
        webSocketServer: 'sockjs',
      });
    }).toThrow('Client needs implementation');
  });
});
