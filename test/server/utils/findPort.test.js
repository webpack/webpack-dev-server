'use strict';

const http = require('http');
const portfinder = require('portfinder');
const findPort = require('../../../lib/utils/findPort');

describe('findPort', () => {
  let dummyServers = [];

  afterEach(() => {
    delete process.env.DEFAULT_PORT_RETRY;

    return dummyServers
      .reduce(
        (p, server) =>
          p.then(
            () =>
              new Promise((resolve) => {
                server.close(resolve);
              })
          ),
        Promise.resolve()
      )
      .then(() => {
        dummyServers = [];
      });
  });

  function createDummyServers(n) {
    return (Array.isArray(n) ? n : [...new Array(n)]).reduce(
      (p, _, i) =>
        p.then(
          () =>
            new Promise((resolve, reject) => {
              const server = http.createServer();

              dummyServers.push(server);

              server.listen(8080 + i, () => {
                resolve();
              });

              server.on('error', (error) => {
                reject(error);
              });
            })
        ),
      Promise.resolve()
    );
  }

  it('should returns the port when the port is specified', () => {
    process.env.DEFAULT_PORT_RETRY = 5;

    return findPort(8082).then((port) => {
      expect(port).toEqual(8082);
    });
  });

  it('should returns the port when the port is null', () => {
    const retryCount = 2;

    process.env.DEFAULT_PORT_RETRY = 2;

    return createDummyServers(retryCount)
      .then(() => findPort(null))
      .then((port) => {
        expect(port).toEqual(8080 + retryCount);
      });
  });

  it('should returns the port when the port is undefined', () => {
    const retryCount = 2;

    process.env.DEFAULT_PORT_RETRY = 2;

    return (
      createDummyServers(retryCount)
        // eslint-disable-next-line no-undefined
        .then(() => findPort(undefined))
        .then((port) => {
          expect(port).toEqual(8080 + retryCount);
        })
    );
  });

  it('should retry finding the port for up to defaultPortRetry times (number)', () => {
    const retryCount = 3;

    process.env.DEFAULT_PORT_RETRY = retryCount;

    return createDummyServers(retryCount)
      .then(() => findPort())
      .then((port) => {
        expect(port).toEqual(8080 + retryCount);
      });
  });

  it('should retry finding the port for up to defaultPortRetry times (string)', () => {
    const retryCount = 3;

    process.env.DEFAULT_PORT_RETRY = `${retryCount}`;

    return createDummyServers(retryCount)
      .then(() => findPort())
      .then((port) => {
        expect(port).toEqual(8080 + retryCount);
      });
  });

  // TODO: fix me, Flaky on CI
  it.skip('should retry finding the port when serial ports are busy', () => {
    const busyPorts = [8080, 8081, 8082, 8083];

    process.env.DEFAULT_PORT_RETRY = 3;

    return createDummyServers(busyPorts)
      .then(() => findPort())
      .then((port) => {
        expect(port).toEqual(8080 + busyPorts.length);
      });
  });

  it("should throws the error when the port isn't found", () => {
    expect.assertions(1);

    const spy = jest
      .spyOn(portfinder, 'getPort')
      .mockImplementation((callback) => callback(new Error('busy')));

    const retryCount = 1;

    process.env.DEFAULT_PORT_RETRY = 0;

    return createDummyServers(retryCount)
      .then(() => findPort())
      .catch((err) => {
        expect(err.message).toMatchSnapshot();

        spy.mockRestore();
      });
  });
});
