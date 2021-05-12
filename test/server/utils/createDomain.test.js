'use strict';

const webpack = require('webpack');
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
      },
      expected: [
        `http://localhost:${port1}`,
        `http://127.0.0.1:${port1}`,
        `http://[::1]:${port1}`,
      ],
    },
    {
      name: 'no host option',
      options: {
        port: port1,
      },
      expected: [`http://0.0.0.0:${port1}`, `http://[::]:${port1}`],
    },
    {
      name: 'https',
      options: {
        host: 'localhost',
        port: port1,
        https: true,
      },
      expected: [
        `https://localhost:${port1}`,
        `https://127.0.0.1:${port1}`,
        `https://[::1]:${port1}`,
      ],
      timeout: 60000,
    },
    {
      name: 'override with public',
      options: {
        host: 'localhost',
        port: port1,
        public: 'myhost.test',
      },
      expected: ['http://myhost.test'],
    },
    {
      name: 'override with public (port)',
      options: {
        host: 'localhost',
        port: port1,
        public: `myhost.test:${port2}`,
      },
      expected: [`http://myhost.test:${port2}`],
    },
    {
      name: 'override with public (protocol)',
      options: {
        host: 'localhost',
        port: port1,
        public: 'https://myhost.test',
      },
      expected: ['https://myhost.test'],
    },
    {
      name: 'override with public (protocol + port)',
      options: {
        host: 'localhost',
        port: port1,
        public: `https://myhost.test:${port2}`,
      },
      expected: [`https://myhost.test:${port2}`],
    },
  ];

  tests.forEach((test) => {
    it(`test createDomain '${test.name}'`, (done) => {
      const { options, expected } = test;
      options.static = false;

      server = new Server(options, compiler);

      server.listen(options.port, options.host, (err) => {
        if (err) {
          done(err);
        }

        const domain = createDomain(options, server.server);

        if (!expected.includes(domain)) {
          done(`generated domain ${domain} doesn't match expected ${expected}`);
        } else {
          done();
        }
      });
    });
  });
});
