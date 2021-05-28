'use strict';

const internalIp = require('internal-ip');
const webpack = require('webpack');
const Server = require('../../lib/Server');
const config = require('../fixtures/simple-config/webpack.config');

const createServer = (compiler, options) => new Server(options, compiler);

describe('allowedHosts', () => {
  let compiler;
  let server;

  beforeEach(() => {
    compiler = webpack(config);
  });

  afterEach((done) => {
    server.close(() => {
      done();
    });
  });

  it('should always allow `localhost` if options.allowedHosts is auto', () => {
    const options = {
      allowedHosts: 'auto',
    };
    const headers = {
      host: 'localhost',
    };

    server = createServer(compiler, options);

    if (!server.checkHost(headers)) {
      throw new Error("Validation didn't fail");
    }
  });

  it('should always allow value from the `host` options if options.allowedHosts is auto', () => {
    const networkIP = internalIp.v4.sync();
    const options = {
      host: networkIP,
    };
    const headers = {
      host: networkIP,
    };

    server = createServer(compiler, options);

    if (!server.checkHost(headers)) {
      throw new Error("Validation didn't fail");
    }
  });

  it('should always allow value of the `host` option from the `client.webSocketURL` option if options.allowedHosts is auto', () => {
    const options = {
      allowedHosts: 'auto',
      client: {
        webSocketURL: 'ws://test.host:80',
      },
    };
    const headers = {
      host: 'test.host',
    };

    server = createServer(compiler, options);

    if (!server.checkHost(headers)) {
      throw new Error("Validation didn't fail");
    }
  });

  it('should always allow any host if options.allowedHosts is all', () => {
    const options = {
      allowedHosts: 'all',
    };
    const headers = {
      host: 'bad.host',
    };

    server = createServer(compiler, options);

    if (!server.checkHost(headers)) {
      throw new Error("Validation didn't fail");
    }
  });

  it('should allow hosts in allowedHosts', () => {
    const tests = ['test.host', 'test2.host', 'test3.host'];
    const options = { allowedHosts: tests };

    server = createServer(compiler, options);
    tests.forEach((test) => {
      const headers = { host: test };

      if (!server.checkHost(headers)) {
        throw new Error("Validation didn't fail");
      }
    });
  });

  it('should allow hosts that pass a wildcard in allowedHosts', () => {
    const options = { allowedHosts: ['.example.com'] };

    server = createServer(compiler, options);

    const tests = [
      'www.example.com',
      'subdomain.example.com',
      'example.com',
      'subsubcomain.subdomain.example.com',
      'example.com:80',
      'subdomain.example.com:80',
    ];

    tests.forEach((test) => {
      const headers = { host: test };

      if (!server.checkHost(headers)) {
        throw new Error("Validation didn't fail");
      }
    });
  });
});
