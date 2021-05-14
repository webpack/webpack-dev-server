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
      });
    }).toThrow(/client.transport must be a string/);
  });

  it('should throw with transportMode.client: bad type', () => {
    expect(() => {
      getSocketClientPath({
        client: {
          transport: 1,
        },
      });
    }).toThrow(/client.transport must be a string/);
  });

  it('should throw with client.transport: unimplemented client', () => {
    expect(() => {
      getSocketClientPath({
        client: {
          transport: baseClientPath,
        },
      });
    }).toThrow('Client needs implementation');
  });
});
