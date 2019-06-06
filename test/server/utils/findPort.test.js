'use strict';

const http = require('http');
const findPort = require('../../../lib/utils/findPort');

describe('findPort util', () => {
  let dummyServers = [];

  afterEach(() => {
    delete process.env.DEFAULT_PORT_RETRY;

    return dummyServers
      .reduce((p, server) => {
        return p.then(() => {
          return new Promise((resolve) => {
            server.close(resolve);
          });
        });
      }, Promise.resolve())
      .then(() => {
        dummyServers = [];
      });
  });

  function createDummyServers(n) {
    return [...new Array(n)].reduce((p, _, i) => {
      return p.then(() => {
        return new Promise((resolve) => {
          const server = http.createServer();
          dummyServers.push(server);
          server.listen(8080 + i, resolve);
        });
      });
    }, Promise.resolve());
  }

  it('should returns the port when the port is specified', () => {
    process.env.DEFAULT_PORT_RETRY = 5;

    return findPort(8082).then((port) => {
      expect(port).toEqual(8082);
    });
  });

  it('should retry finding the port for up to defaultPortRetry times', () => {
    const retryCount = 5;

    process.env.DEFAULT_PORT_RETRY = retryCount;

    return createDummyServers(retryCount)
      .then(findPort)
      .then((port) => {
        expect(port).toEqual(8080 + retryCount);
      });
  });

  it("should throws the error when the port isn't found", () => {
    process.env.DEFAULT_PORT_RETRY = 5;

    return createDummyServers(10)
      .then(findPort)
      .catch((err) => {
        expect(err.message).toMatchSnapshot();
      });
  });
});
