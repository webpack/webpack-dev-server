'use strict';

const { relative, sep } = require('path');
const http = require('http');
const webpack = require('webpack');
const sockjs = require('sockjs/lib/transport');
// TODO(@anshumanv) - Remove this test in next major
const findPort = require('../../lib/utils/findPort');
const Server = require('../../lib/Server');
const config = require('../fixtures/simple-config/webpack.config');
const port = require('../ports-map').Server;
const isWebpack5 = require('../helpers/isWebpack5');

const getFreePort = Server.getFreePort;
jest.mock('sockjs/lib/transport');

const baseDevConfig = {
  port,
  static: false,
};

const createServer = (compiler, options) => new Server(options, compiler);

describe('Server', () => {
  describe('sockjs', () => {
    it('add decorateConnection', () => {
      expect(typeof sockjs.Session.prototype.decorateConnection).toEqual(
        'function'
      );
    });
  });

  describe('DevServerPlugin', () => {
    let entries;

    function getEntries(server) {
      if (isWebpack5) {
        server.middleware.context.compiler.hooks.afterEmit.tap(
          'webpack-dev-server',
          (compilation) => {
            const mainDeps = compilation.entries.get('main').dependencies;
            const globalDeps = compilation.globalEntry.dependencies;
            entries = globalDeps
              .concat(mainDeps)
              .map((dep) => relative('.', dep.request).split(sep));
          }
        );
      } else {
        entries = server.middleware.context.compiler.options.entry.map((p) =>
          relative('.', p).split(sep)
        );
      }
    }

    it('add hot option', (done) => {
      const compiler = webpack(config);
      const server = createServer(
        compiler,
        Object.assign({}, baseDevConfig, {
          hot: true,
        })
      );

      getEntries(server);

      compiler.hooks.done.tap('webpack-dev-server', () => {
        expect(entries).toMatchSnapshot();
        server.close(done);
      });

      compiler.run(() => {});
    });

    // TODO: remove this after plugin support is published
    it('should create and run server with old parameters order', (done) => {
      const compiler = webpack(config);
      const server = new Server(compiler, baseDevConfig);

      getEntries(server);

      compiler.hooks.done.tap('webpack-dev-server', () => {
        expect(entries).toMatchSnapshot('oldparam');
        server.close(done);
      });

      compiler.run(() => {});
    });

    // TODO: remove this after plugin support is published
    it('should create and run server with MultiCompiler with old parameters order', (done) => {
      const compiler = webpack([config, config]);
      const server = new Server(compiler, baseDevConfig);

      compiler.hooks.done.tap('webpack-dev-server', () => {
        server.close(done);
      });

      compiler.run(() => {});
    });

    it('add hot-only option', (done) => {
      const compiler = webpack(config);
      const server = createServer(
        compiler,
        Object.assign({}, baseDevConfig, {
          hot: 'only',
        })
      );

      getEntries(server);

      compiler.hooks.done.tap('webpack-dev-server', () => {
        expect(entries).toMatchSnapshot();
        server.close(done);
      });

      compiler.run(() => {});
    });
  });

  it('test server error reporting', () => {
    const compiler = webpack(config);
    const server = createServer(compiler, baseDevConfig);

    const emitError = () => server.server.emit('error', new Error('Error !!!'));

    expect(emitError).toThrowError();
  });

  // issue: https://github.com/webpack/webpack-dev-server/issues/1724
  describe('express.static.mime.types', () => {
    it("should success even if mime.types doesn't exist", (done) => {
      jest.mock('express', () => {
        const data = jest.requireActual('express');
        const { static: st } = data;
        const { mime } = st;

        delete mime.types;

        expect(typeof mime.types).toEqual('undefined');

        return Object.assign(data, {
          static: Object.assign(st, {
            mime,
          }),
        });
      });

      const compiler = webpack(config);
      const server = createServer(compiler, baseDevConfig);

      compiler.hooks.done.tap('webpack-dev-server', (s) => {
        const output = server.getStats(s);
        expect(output.errors.length).toEqual(0);

        server.close(done);
      });

      compiler.run(() => {});
      server.listen(port, 'localhost');
    });
  });

  describe('checkHost', () => {
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

    it('should always allow any host if options.firewall is disabled', () => {
      const options = {
        public: 'test.host:80',
        firewall: false,
      };

      const headers = {
        host: 'bad.host',
      };

      server = createServer(compiler, options);

      if (!server.checkHost(headers)) {
        throw new Error("Validation didn't fail");
      }
    });

    it('should allow any valid options.public when host is localhost', () => {
      const options = {
        public: 'test.host:80',
      };
      const headers = {
        host: 'localhost',
      };
      server = createServer(compiler, options);
      if (!server.checkHost(headers)) {
        throw new Error("Validation didn't fail");
      }
    });

    it('should allow any valid options.public when host is 127.0.0.1', () => {
      const options = {
        public: 'test.host:80',
      };

      const headers = {
        host: '127.0.0.1',
      };

      server = createServer(compiler, options);

      if (!server.checkHost(headers)) {
        throw new Error("Validation didn't fail");
      }
    });

    it('should allow access for every requests using an IP', () => {
      const options = {};

      const tests = [
        '192.168.1.123',
        '192.168.1.2:8080',
        '[::1]',
        '[::1]:8080',
        '[ad42::1de2:54c2:c2fa:1234]',
        '[ad42::1de2:54c2:c2fa:1234]:8080',
      ];

      server = createServer(compiler, options);

      tests.forEach((test) => {
        const headers = { host: test };

        if (!server.checkHost(headers)) {
          throw new Error("Validation didn't pass");
        }
      });
    });

    it("should not allow hostnames that don't match options.public", () => {
      const options = {
        public: 'test.host:80',
      };

      const headers = {
        host: 'test.hostname:80',
      };

      server = createServer(compiler, options);

      if (server.checkHost(headers)) {
        throw new Error("Validation didn't fail");
      }
    });

    it('should allow urls with scheme for checking origin', () => {
      const options = {
        public: 'test.host:80',
      };
      const headers = {
        origin: 'https://test.host',
      };
      server = createServer(compiler, options);
      if (!server.checkOrigin(headers)) {
        throw new Error("Validation didn't fail");
      }
    });

    describe('firewall', () => {
      it('should allow hosts in firewall', () => {
        const tests = ['test.host', 'test2.host', 'test3.host'];
        const options = { firewall: tests };
        server = createServer(compiler, options);
        tests.forEach((test) => {
          const headers = { host: test };
          if (!server.checkHost(headers)) {
            throw new Error("Validation didn't fail");
          }
        });
      });

      it('should allow hosts that pass a wildcard in firewall', () => {
        const options = { firewall: ['.example.com'] };
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
  });

  describe('Invalidate Callback', () => {
    describe('Testing callback functions on calling invalidate without callback', () => {
      it('should use default `noop` callback', (done) => {
        const compiler = webpack(config);
        const server = createServer(compiler, baseDevConfig);

        server.invalidate();
        expect(server.middleware.context.callbacks.length).toEqual(1);

        compiler.hooks.done.tap('webpack-dev-server', () => {
          server.close(done);
        });

        compiler.run(() => {});
      });
    });

    describe('Testing callback functions on calling invalidate with callback', () => {
      it('should use `callback` function', (done) => {
        const compiler = webpack(config);
        const callback = jest.fn();
        const server = createServer(compiler, baseDevConfig);

        server.invalidate(callback);

        expect(server.middleware.context.callbacks[0]).toBe(callback);

        compiler.hooks.done.tap('webpack-dev-server', () => {
          server.close(done);
        });

        compiler.run(() => {});
      });
    });
  });

  describe('WEBPACK_SERVE environment variable', () => {
    const OLD_ENV = process.env;

    beforeEach(() => {
      // this is important - it clears the cache
      jest.resetModules();

      process.env = { ...OLD_ENV };

      delete process.env.WEBPACK_SERVE;
    });

    afterEach(() => {
      process.env = OLD_ENV;
    });

    it('should be present', () => {
      expect(process.env.WEBPACK_SERVE).toBeUndefined();

      require('../../lib/Server');

      expect(process.env.WEBPACK_SERVE).toBe(true);
    });
  });

  describe('getFreePort', () => {
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

      return getFreePort(8082).then((freePort) => {
        expect(freePort).toEqual(8082);
      });
    });

    it('should returns the port when the port is null', () => {
      const retryCount = 2;

      process.env.DEFAULT_PORT_RETRY = 2;

      return createDummyServers(retryCount)
        .then(() => getFreePort(null))
        .then((freePort) => {
          expect(freePort).toEqual(8080 + retryCount);
        });
    });

    it('should returns the port when the port is undefined', () => {
      const retryCount = 2;

      process.env.DEFAULT_PORT_RETRY = 2;

      return (
        createDummyServers(retryCount)
          // eslint-disable-next-line no-undefined
          .then(() => getFreePort(undefined))
          .then((freePort) => {
            expect(freePort).toEqual(8080 + retryCount);
          })
      );
    });

    it('should retry finding the port for up to defaultPortRetry times (number)', () => {
      const retryCount = 3;

      process.env.DEFAULT_PORT_RETRY = retryCount;

      return createDummyServers(retryCount)
        .then(() => getFreePort())
        .then((freePort) => {
          expect(freePort).toEqual(8080 + retryCount);
        });
    });

    it('should retry finding the port for up to defaultPortRetry times (string)', () => {
      const retryCount = 3;

      process.env.DEFAULT_PORT_RETRY = `${retryCount}`;

      return createDummyServers(retryCount)
        .then(() => getFreePort())
        .then((freePort) => {
          expect(freePort).toEqual(8080 + retryCount);
        });
    });

    // TODO: fix me, Flaky on CI
    it.skip('should retry finding the port when serial ports are busy', () => {
      const busyPorts = [8080, 8081, 8082, 8083];

      process.env.DEFAULT_PORT_RETRY = 3;

      return createDummyServers(busyPorts)
        .then(() => getFreePort())
        .then((freePort) => {
          expect(freePort).toEqual(8080 + busyPorts.length);
        });
    });

    it("should throws the error when the port isn't found", () => {
      expect.assertions(1);

      jest.mock('portfinder', () => {
        return {
          getPort: (callback) => callback(new Error('busy')),
        };
      });

      const retryCount = 1;

      process.env.DEFAULT_PORT_RETRY = 0;

      return createDummyServers(retryCount)
        .then(() => getFreePort())
        .catch((err) => {
          expect(err.message).toMatchSnapshot();
        });
    });

    it('should work with findPort util', () => {
      process.env.DEFAULT_PORT_RETRY = 5;

      return findPort(8082).then((freePort) => {
        expect(freePort).toEqual(8082);
      });
    });
  });
});
