'use strict';

const getSocketClientPath = require('../../../lib/utils/getSocketClientPath');
// 'npm run prepare' must be done for this test to pass
const sockjsClientPath = require.resolve(
  '../../../client/clients/SockJSClient'
);
const baseClientPath = require.resolve('../../../client/clients/BaseClient');

describe('getSocketClientPath', () => {
  it("should work with transportMode.client: 'sockjs'", () => {
    let result;

    expect(() => {
      result = getSocketClientPath({
        transportMode: {
          client: 'sockjs',
        },
      });
    }).not.toThrow();

    expect(result).toEqual(sockjsClientPath);
  });

  it('should work with transportMode.client: SockJSClient full path', () => {
    let result;

    expect(() => {
      result = getSocketClientPath({
        transportMode: {
          client: sockjsClientPath,
        },
      });
    }).not.toThrow();

    expect(result).toEqual(sockjsClientPath);
  });

  it('should throw with transportMode.client: bad path', () => {
    expect(() => {
      getSocketClientPath({
        transportMode: {
          client: '/bad/path/to/implementation',
        },
      });
    }).toThrow(/transportMode\.client must be a string/);
  });

  it('should throw with transportMode.client: bad type', () => {
    expect(() => {
      getSocketClientPath({
        transportMode: {
          client: 1,
        },
      });
    }).toThrow(/transportMode\.client must be a string/);
  });

  it('should throw with transportMode.client: unimplemented client', () => {
    expect(() => {
      getSocketClientPath({
        transportMode: {
          client: baseClientPath,
        },
      });
    }).toThrow('Client needs implementation');
  });
});
