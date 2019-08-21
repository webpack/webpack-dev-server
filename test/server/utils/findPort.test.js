'use strict';

const http = require('http');
const port = require('../../ports-map').findPort;

// 8139
const basePort = port[0];

describe('findPort', () => {
  let findPort;
  let dummyServers = [];

  beforeEach(() => {
    jest.doMock('../../../lib/utils/defaultPort', () => basePort);
    findPort = require('../../../lib/utils/findPort');
  });

  afterEach(async () => {
    delete process.env.DEFAULT_PORT_RETRY;

    jest.resetAllMocks();
    jest.resetModules();

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
        server.listen(basePort + i, resolve);
      });
    }

    const samples = [...new Array(n)].map((_, i) => i);

    for (const i of samples) {
      // eslint-disable-next-line no-await-in-loop
      await create(i);
    }
  }

  it('should returns the port when the port is specified', async () => {
    expect(await findPort(Number(basePort))).toEqual(basePort);
    expect(await findPort(String(basePort))).toEqual(basePort);
    expect(await findPort({ basePort })).toEqual(basePort);
  });

  it('should returns the port when the port is null or undefined', async () => {
    // basePort: 8139
    // used ports: 8139, 8140
    // retry:        0     1     2
    // expect: 8141
    const retry = 2;
    process.env.DEFAULT_PORT_RETRY = retry;

    await createDummyServers(retry);

    expect(await findPort(null)).toEqual(basePort + retry);
    // eslint-disable-next-line no-undefined
    expect(await findPort(undefined)).toEqual(basePort + retry);
  });

  it('should retry finding the port', async () => {
    // basePort: 8139
    // used ports: 8139
    // retry:        0     1
    // expect: 8140
    const retry = 1;
    process.env.DEFAULT_PORT_RETRY = retry;

    await createDummyServers(retry);

    expect(await findPort()).toEqual(basePort + retry);
    expect(await findPort()).toEqual(basePort + retry);
  });

  it('should find an unused port when the highestPort is set', async () => {
    // basePort: 8139
    // highestPort: 8141
    // used ports: 8139, 8140
    // retry:        0     1     2     3
    // expect: 8141
    const allocatedPortsLength = 2;
    const highestPort = basePort + 2;

    await createDummyServers(allocatedPortsLength);

    expect(await findPort({ highestPort })).toEqual(
      basePort + allocatedPortsLength
    );
    expect(await findPort({ highestPort: String(highestPort) })).toEqual(
      basePort + allocatedPortsLength
    );
  });

  it('should throw an error when a free port is not found', async () => {
    // basePort: 8139
    // used ports: 8139, 8140, 8141, 8142, 8143
    // retry:        0     1     2
    // expect: No open ports available
    const allocatedPortsLength = 5;
    const retry = 2;
    process.env.DEFAULT_PORT_RETRY = retry;

    await createDummyServers(allocatedPortsLength);

    await expect(
      findPort({ highestPort: basePort + allocatedPortsLength })
    ).rejects.toThrow('No open ports available');
  });

  it('should find an unused port when the basePort and highestPort are set', async () => {
    // basePort: 8140
    // highestPort: 8144
    // used ports: 8139, 8140, 8141, 8142
    // retry:              0     1     2     3
    // expect: 8143
    const allocatedPortsLength = 4;
    const base = basePort + 1;
    const highestPort = basePort + 5;

    await createDummyServers(allocatedPortsLength);

    expect(await findPort({ basePort: base, highestPort })).toEqual(
      basePort + allocatedPortsLength
    );
  });

  it('should find an unused port when the basePort, highestPort and retry are set', async () => {
    // base: 8140
    // highestPort: 8144
    // used ports: 8139, 8140, 8141, 8142
    const allocatedPortsLength = 4;
    const base = basePort + 1;
    const highestPort = basePort + 5;

    await createDummyServers(allocatedPortsLength);

    {
      // used ports: 8139, 8140, 8141, 8142
      // retry:              0     1     2     3
      // expect: 8143
      const retry = 3;
      process.env.DEFAULT_PORT_RETRY = retry;

      expect(await findPort({ basePort: base, highestPort })).toEqual(
        base + retry
      );
    }

    {
      // used ports: 8139, 8140, 8141, 8142
      // retry:                    0     1
      // expect: No open ports available
      const retry = 1;
      process.env.DEFAULT_PORT_RETRY = retry;

      await expect(findPort({ basePort: base, highestPort })).rejects.toThrow(
        'No open ports available'
      );
    }
  });
});
