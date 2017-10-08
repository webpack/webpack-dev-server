'use strict';

const webpack = require('webpack');
const internalIp = require('internal-ip');
const Server = require('../lib/Server');
const createDomain = require('../lib/util/createDomain');
const config = require('./fixtures/simple-config/webpack.config');

describe('check utility funcitons', () => {
  let compiler;
  before(() => {
    compiler = webpack(config);
  });

  const tests = [{
    name: 'default',
    options: {
      host: 'localhost',
      port: 8080
    },
    expected: 'http://localhost:8080'
  }, {
    name: 'https',
    options: {
      host: 'localhost',
      port: 8080,
      https: true
    },
    expected: 'https://localhost:8080',
    timeout: 60000
  }, {
    name: 'override with public',
    options: {
      host: 'localhost',
      port: 8080,
      public: 'myhost.test'
    },
    expected: 'http://myhost.test'
  }, {
    name: 'override with public (port)',
    options: {
      host: 'localhost',
      port: 8080,
      public: 'myhost.test:9090'
    },
    expected: 'http://myhost.test:9090'
  }, {
    name: 'override with public (protocol)',
    options: {
      host: 'localhost',
      port: 8080,
      public: 'https://myhost.test'
    },
    expected: 'https://myhost.test'
  }, {
    name: 'override with public (protocol + port)',
    options: {
      host: 'localhost',
      port: 8080,
      public: 'https://myhost.test:9090'
    },
    expected: 'https://myhost.test:9090'
  }, {
    name: 'localIp',
    options: {
      useLocalIp: true,
      port: 8080
    },
    expected: `http://${internalIp.v4()}:8080`
  }];

  tests.forEach((t) => {
    const itInstance = it(`test createDomain '${t.name}'`, (done) => {
      const options = t.options;
      const server = new Server(compiler, options);
      const expected = t.expected;
      server.listen(options.port, options.host, (err) => {
        if (err) {
          done(err);
        }
        const generatedDomain = createDomain(options, server.listeningApp);
        if (generatedDomain !== expected) {
          done(`generated domain ${generatedDomain} doesn't match expected ${expected}`);
        } else {
          done();
        }
        server.close();
      });
    });
    if (t.timeout) {
      itInstance.timeout(t.timeout);
    }
  });
});
