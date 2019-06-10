'use strict';

const http = require('http');
const portfinder = require('portfinder');
const findPort = require('../../../lib/utils/findPort');

describe('findPort', () => {
  let dummyServers = [];

  afterEach(async () => {
    delete process.env.DEFAULT_PORT_RETRY;

    async function close(server) {
      return new Promise((resolve) => {
        server.close(resolve);
      });
    }

    for (const server of dummyServers) {
      // eslint-disable-next-line no-await-in-loop
      await close(server);
    }

    dummyServers = [];
  });

  async function createDummyServers(n) {
    async function create(i) {
      return new Promise((resolve) => {
        const server = http.createServer();
        dummyServers.push(server);
        server.listen(8080 + i, resolve);
      });
    }

    const samples = [...new Array(n)].map((_, i) => i);

    for (const i of samples) {
      // eslint-disable-next-line no-await-in-loop
      await create(i);
    }
  }

  it('should returns the port when the port is specified', async () => {
    process.env.DEFAULT_PORT_RETRY = 5;

    const port = await findPort(8082);
    expect(port).toEqual(8082);
  });

  it.only('should returns the port when the port is null', async () => {
    const retryCount = 2;

    process.env.DEFAULT_PORT_RETRY = 2;

    await createDummyServers(retryCount);

    const port = await findPort(null);

    expect(port).toEqual(8080 + retryCount);
  });

  it('should returns the port when the port is undefined', async () => {
    const retryCount = 2;

    process.env.DEFAULT_PORT_RETRY = 2;

    await createDummyServers(retryCount);

    // eslint-disable-next-line no-undefined
    const port = findPort(undefined);

    expect(port).toEqual(8080 + retryCount);
  });

  it('should retry finding the port for up to defaultPortRetry times (number)', async () => {
    const retryCount = 3;

    process.env.DEFAULT_PORT_RETRY = retryCount;

    await createDummyServers(retryCount);

    const port = await findPort();

    expect(port).toEqual(8080 + retryCount);
  });

  it('should retry finding the port for up to defaultPortRetry times (string)', async () => {
    const retryCount = 3;

    process.env.DEFAULT_PORT_RETRY = `${retryCount}`;

    await createDummyServers(retryCount);

    const port = await findPort();

    expect(port).toEqual(8080 + retryCount);
  });

  it('should retry finding the port when serial ports are busy', async () => {
    const busyPorts = [8080, 8081, 8082, 8083];

    process.env.DEFAULT_PORT_RETRY = 3;

    await createDummyServers(busyPorts);

    const port = await findPort();

    expect(port).toEqual(8080 + busyPorts.length);
  });

  it("should throws the error when the port isn't found", async () => {
    expect.assertions(1);

    const spy = jest
      .spyOn(portfinder, 'getPort')
      .mockImplementation((callback) => {
        return callback(new Error('busy'));
      });

    const retryCount = 1;

    process.env.DEFAULT_PORT_RETRY = 0;

    await createDummyServers(retryCount);

    try {
      await findPort();
    } catch (err) {
      expect(err.message).toMatchSnapshot();
    }

    spy.mockRestore();
  });
});
