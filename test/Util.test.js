'use strict';

const EventEmitter = require('events');
const assert = require('assert');
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
  let mockServer = null;

  beforeEach(() => {
    mockServer = {
      listeningApp: new EventEmitter(),
    };
  });

  afterEach(() => {
    mockServer.listeningApp.removeAllListeners('error');
    mockServer = null;
  });

  it('should find empty port starting from defaultPort', (done) => {
    findPort(mockServer, 8180, 3, (err, port) => {
      assert(err == null);
      assert(port === 8180);
      done();
    });
  });

  it('should retry finding port for up to defaultPortRetry times', (done) => {
    let count = 0;
    const defaultPortRetry = 5;
    findPort(mockServer, 8180, defaultPortRetry, (err) => {
      if (err == null) {
        count += 1;
        const mockError = new Error('EADDRINUSE');
        mockError.code = 'EADDRINUSE';
        mockServer.listeningApp.emit('error', mockError);
        return;
      }
      assert(count === defaultPortRetry);
      done();
    });
  });
});
