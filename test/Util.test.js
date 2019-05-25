'use strict';

const http = require('http');
const webpack = require('webpack');
const internalIp = require('internal-ip');
const Server = require('../lib/Server');
const createDomain = require('../lib/utils/createDomain');
const findPort = require('../lib/utils/findPort');
const config = require('./fixtures/simple-config/webpack.config');

describe('check utility functions', () => {
  let compiler;
  let server;

  beforeAll(() => {
    compiler = webpack(config);
  });

  afterEach((done) => {
    server.close(() => {
      done();
    });
  });

  const tests = [
    {
      name: 'default',
      options: {
        host: 'localhost',
        port: 8080,
      },
      expected: 'http://localhost:8080',
    },
    {
      name: 'no host option',
      options: {
        port: 8080,
      },
      expected: 'http://localhost:8080',
    },
    {
      name: 'https',
      options: {
        host: 'localhost',
        port: 8080,
        https: true,
      },
      expected: 'https://localhost:8080',
      timeout: 60000,
    },
    {
      name: 'override with public',
      options: {
        host: 'localhost',
        port: 8080,
        public: 'myhost.test',
      },
      expected: 'http://myhost.test',
    },
    {
      name: 'override with public (port)',
      options: {
        host: 'localhost',
        port: 8080,
        public: 'myhost.test:9090',
      },
      expected: 'http://myhost.test:9090',
    },
    {
      name: 'override with public (protocol)',
      options: {
        host: 'localhost',
        port: 8080,
        public: 'https://myhost.test',
      },
      expected: 'https://myhost.test',
    },
    {
      name: 'override with public (protocol + port)',
      options: {
        host: 'localhost',
        port: 8080,
        public: 'https://myhost.test:9090',
      },
      expected: 'https://myhost.test:9090',
    },
    {
      name: 'localIp',
      options: {
        useLocalIp: true,
        port: 8080,
      },
      expected: `http://${internalIp.v4.sync() || 'localhost'}:8080`,
    },
  ];

  tests.forEach((test) => {
    it(`test createDomain '${test.name}'`, (done) => {
      const { options, expected } = test;

      server = new Server(compiler, options);

      server.listen(options.port, options.host, (err) => {
        if (err) {
          done(err);
        }

        const domain = createDomain(options, server.listeningApp);

        if (domain !== expected) {
          done(`generated domain ${domain} doesn't match expected ${expected}`);
        } else {
          done();
        }
      });
    });
  });
});

describe('findPort cli utility function', () => {
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

  it('should return the port when the port is specified', () => {
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

  it("should throw the error when the port isn't found", () => {
    const retryCount = 5;

    process.env.DEFAULT_PORT_RETRY = retryCount;

    return createDummyServers(10)
      .then(findPort)
      .catch((err) => {
        expect(err.message).toMatchSnapshot();
      });
  });
});
