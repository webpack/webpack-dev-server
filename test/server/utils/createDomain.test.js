'use strict';

const webpack = require('webpack');
const internalIp = require('internal-ip');
const Server = require('../../../lib/Server');
const createDomain = require('../../../lib/utils/createDomain');
const [port1, port2] = require('../../ports-map').createDomain;
const config = require('./../../fixtures/simple-config/webpack.config');

describe('createDomain', () => {
  let compiler;
  let server;

  beforeAll(() => {
    compiler = webpack(config);
  });

  afterEach((done) => {
    server.close(done);
  });

  const tests = [
    {
      name: 'default',
      options: {
        host: 'localhost',
        port: port1,
        quiet: true,
      },
      expected: `http://localhost:${port1}`,
    },
    {
      name: 'no host option',
      options: {
        port: port1,
        quiet: true,
      },
      expected: `http://localhost:${port1}`,
    },
    {
      name: 'https',
      options: {
        host: 'localhost',
        port: port1,
        https: true,
        quiet: true,
      },
      expected: `https://localhost:${port1}`,
      timeout: 60000,
    },
    {
      name: 'override with public',
      options: {
        host: 'localhost',
        port: port1,
        public: 'myhost.test',
        quiet: true,
      },
      expected: 'http://myhost.test',
    },
    {
      name: 'override with public (port)',
      options: {
        host: 'localhost',
        port: port1,
        public: `myhost.test:${port2}`,
        quiet: true,
      },
      expected: `http://myhost.test:${port2}`,
    },
    {
      name: 'override with public (protocol)',
      options: {
        host: 'localhost',
        port: port1,
        public: 'https://myhost.test',
        quiet: true,
      },
      expected: 'https://myhost.test',
    },
    {
      name: 'override with public (protocol + port)',
      options: {
        host: 'localhost',
        port: port1,
        public: `https://myhost.test:${port2}`,
        quiet: true,
      },
      expected: `https://myhost.test:${port2}`,
    },
    {
      name: 'localIp',
      options: {
        useLocalIp: true,
        port: port1,
        quiet: true,
      },
      expected: `http://${internalIp.v4.sync() || 'localhost'}:${port1}`,
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
