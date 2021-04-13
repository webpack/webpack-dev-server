'use strict';

const webpack = require('webpack');
const Server = require('../../../lib/Server');
const createDomain = require('../../../lib/utils/createDomain');
const [port1] = require('../../ports-map').createDomain;
const config = require('./../../fixtures/simple-config/webpack.config');

describe('createDomain', () => {
  let compiler;
  let server;

  beforeAll(() => {
    compiler = webpack(config);
  });

  afterEach((done) => {
    if (server) {
      server.close(done);
    }
  });

  const tests = [
    {
      name: 'default',
      options: {
        host: 'localhost',
        port: port1,
      },
      expected: ['ws://0.0.0.0:0/ws'],
    },
    {
      name: 'default with https',
      options: {
        https: true,
        host: 'localhost',
        port: port1,
      },
      expected: ['wss://0.0.0.0:0/ws'],
      timeout: 60000,
    },
    {
      name: 'override with webSocketUrl',
      options: {
        client: {
          webSocketUrl: 'ws://myhost.test:8090/custom',
        },
        host: 'localhost',
        port: port1,
      },
      expected: ['ws://myhost.test:8090/custom'],
    },
    {
      name: 'override with webSocketUrl #2',
      options: {
        client: {
          webSocketUrl: 'http://myhost.test:8090/custom',
        },
        host: 'localhost',
        port: port1,
      },
      expected: ['http://myhost.test:8090/custom'],
    },
    {
      name: 'override using webSocketUrl without protocol',
      options: {
        https: false,
        client: {
          webSocketUrl: 'myhost.test:8090/custom',
        },
        host: 'localhost',
        port: port1,
      },
      expected: ['ws://myhost.test:8090/custom'],
    },
    {
      name: 'override with webSocketUrl without protocol and https',
      options: {
        https: true,
        client: {
          webSocketUrl: 'myhost.test:8090/custom',
        },
        host: 'localhost',
        port: port1,
      },
      expected: ['wss://myhost.test:8090/custom'],
    },
  ];

  tests.forEach((test) => {
    it(`test createDomain '${test.name}'`, (done) => {
      const { options, expected } = test;

      options.static = false;

      server = new Server(compiler, options);

      server.listen(options.port, options.host, (err) => {
        if (err) {
          done(err);
        }

        const domain = createDomain(options);

        if (!expected.includes(domain)) {
          done(`generated domain ${domain} doesn't match expected ${expected}`);
        } else {
          done();
        }
      });
    });
  });
});
