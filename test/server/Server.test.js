'use strict';

const { relative, sep } = require('path');
const http = require('http');
const webpack = require('webpack');
const sockjs = require('sockjs/lib/transport');
// TODO(@anshumanv) - Remove this test in next major
const findPort = require('../../lib/utils/findPort');
const Server = require('../../lib/Server');
const config = require('../fixtures/simple-config/webpack.config');
const port = require('../ports-map').server;
const isWebpack5 = require('../helpers/isWebpack5');

jest.mock('sockjs/lib/transport');

const baseDevConfig = {
  port,
  host: 'localhost',
  static: false,
};

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
      const server = new Server({ ...baseDevConfig, hot: true }, compiler);

      compiler.hooks.done.tap('webpack-dev-server', () => {
        expect(entries).toMatchSnapshot();

        server.close(() => {
          done();
        });
      });

      server.listen(port, 'localhost', (error) => {
        if (error) {
          throw error;
        }

        getEntries(server);
      });
    });

    it('add hot-only option', (done) => {
      const compiler = webpack(config);
      const server = new Server({ ...baseDevConfig, hot: 'only' }, compiler);

      compiler.hooks.done.tap('webpack-dev-server', () => {
        expect(entries).toMatchSnapshot();

        server.close(done);
      });

      server.listen(port, 'localhost', (error) => {
        if (error) {
          throw error;
        }

        getEntries(server);
      });
    });

    // TODO: remove this after plugin support is published
    it('should create and run server with old parameters order', (done) => {
      const compiler = webpack(config);
      const server = new Server(compiler, baseDevConfig);

      compiler.hooks.done.tap('webpack-dev-server', () => {
        expect(entries).toMatchSnapshot('oldparam');

        server.close(done);
      });

      server.listen(port, 'localhost', (error) => {
        if (error) {
          throw error;
        }

        getEntries(server);
      });
    });
  });

  it('test server error reporting', () => {
    const compiler = webpack(config);
    const server = new Server(baseDevConfig, compiler);

    const emitError = () => server.server.emit('error', new Error('Error !!!'));

    expect(emitError).toThrowError();

    server.close();
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

        return { ...data, static: { ...st, mime } };
      });

      const compiler = webpack(config);
      const server = new Server(baseDevConfig, compiler);

      compiler.hooks.done.tap('webpack-dev-server', (s) => {
        const output = server.getStats(s);
        expect(output.errors.length).toEqual(0);

        server.close(done);
      });

      server.listen(port, 'localhost');
    });
  });

  describe('listen', () => {
    let compiler;
    let server;

    beforeAll(() => {
      compiler = webpack(config);
    });

    it('should work and using "port" and "host" from options', (done) => {
      const options = {
        host: 'localhost',
        port,
      };

      server = new Server(options, compiler);

      // eslint-disable-next-line no-undefined
      server.listen(undefined, undefined, () => {
        const info = server.server.address();

        expect(info.address).toBe('127.0.0.1');
        expect(info.port).toBe(port);

        server.close(done);
      });
    });

    it('should work and using "port" and "host" from arguments', (done) => {
      server = new Server({}, compiler);

      server.listen(port, '127.0.0.1', () => {
        const info = server.server.address();

        expect(info.address).toBe('127.0.0.1');
        expect(info.port).toBe(port);

        server.close(done);
      });
    });

    it('should work and using the same "port" and "host" from options and arguments', (done) => {
      const options = {
        host: 'localhost',
        port,
      };

      server = new Server(options, compiler);

      server.listen(options.port, options.host, () => {
        const info = server.server.address();

        expect(info.address).toBe('127.0.0.1');
        expect(info.port).toBe(port);

        server.close(done);
      });
    });

    it('should work and using "port" from arguments and "host" from options', (done) => {
      const options = {
        host: '127.0.0.1',
      };

      server = new Server(options, compiler);

      // eslint-disable-next-line no-undefined
      server.listen(port, undefined, () => {
        const info = server.server.address();

        expect(info.address).toBe('127.0.0.1');
        expect(info.port).toBe(port);

        server.close(done);
      });
    });

    it('should work and using "port" from options and "port" from arguments', (done) => {
      const options = {
        port,
      };

      server = new Server(options, compiler);

      // eslint-disable-next-line no-undefined
      server.listen(undefined, '127.0.0.1', () => {
        const info = server.server.address();

        expect(info.address).toBe('127.0.0.1');
        expect(info.port).toBe(port);

        server.close(done);
      });
    });

    it('should log warning when the "port" and "host" options from options different from arguments', (done) => {
      const options = {
        host: '127.0.0.2',
        port: '9999',
      };

      server = new Server(compiler, options);

      const loggerWarnSpy = jest.spyOn(server.logger, 'warn');

      server.listen(port, '127.0.0.1', () => {
        const info = server.server.address();

        expect(loggerWarnSpy).toHaveBeenNthCalledWith(
          1,
          'The "port" specified in options is different from the port passed as an argument. Will be used from arguments.'
        );
        expect(loggerWarnSpy).toHaveBeenNthCalledWith(
          2,
          'The "host" specified in options is different from the host passed as an argument. Will be used from arguments.'
        );
        expect(info.address).toBe('127.0.0.1');
        expect(info.port).toBe(port);

        loggerWarnSpy.mockRestore();
        server.close(done);
      });
    });
  });

  describe('checkHostHeader', () => {
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

    it('should allow any valid options.client.webSocketURL when host is localhost', () => {
      const options = {
        client: {
          webSocketURL: 'ws://test.host:80',
        },
      };
      const headers = {
        host: 'localhost',
      };

      server = new Server(options, compiler);

      if (!server.checkHostHeader(headers)) {
        throw new Error("Validation didn't fail");
      }
    });

    it('should allow any valid options.client.webSocketURL when host is 127.0.0.1', () => {
      const options = {
        client: {
          webSocketURL: 'ws://test.host:80',
        },
      };

      const headers = {
        host: '127.0.0.1',
      };

      server = new Server(options, compiler);

      if (!server.checkHostHeader(headers)) {
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

      server = new Server(options, compiler);

      tests.forEach((test) => {
        const headers = { host: test };

        if (!server.checkHostHeader(headers)) {
          throw new Error("Validation didn't pass");
        }
      });
    });

    it("should not allow hostnames that don't match options.client.webSocketURL", () => {
      const options = {
        client: {
          webSocketURL: 'ws://test.host:80',
        },
      };

      const headers = {
        host: 'test.hostname:80',
      };

      server = new Server(options, compiler);

      if (server.checkHostHeader(headers)) {
        throw new Error("Validation didn't fail");
      }
    });

    it('should allow urls with scheme for checking origin when the "option.client.webSocketURL" is string', () => {
      const options = {
        client: {
          webSocketURL: 'ws://test.host:80',
        },
      };
      const headers = {
        origin: 'https://test.host',
      };

      server = new Server(options, compiler);

      if (!server.checkOriginHeader(headers)) {
        throw new Error("Validation didn't fail");
      }
    });

    it('should allow urls with scheme for checking origin when the "option.client.webSocketURL" is object', () => {
      const options = {
        client: {
          webSocketURL: {
            hostname: 'test.host',
          },
        },
      };
      const headers = {
        origin: 'https://test.host',
      };

      server = new Server(options, compiler);

      if (!server.checkOriginHeader(headers)) {
        throw new Error("Validation didn't fail");
      }
    });
  });

  describe('Invalidate Callback', () => {
    describe('Testing callback functions on calling invalidate without callback', () => {
      it('should use default `noop` callback', (done) => {
        const compiler = webpack(config);
        const server = new Server(baseDevConfig, compiler);

        compiler.hooks.done.tap('webpack-dev-server', () => {
          server.close(done);
        });

        server.listen(port, '127.0.0.1', (error) => {
          if (error) {
            throw error;
          }

          server.invalidate();

          expect(server.middleware.context.callbacks.length).toEqual(1);
        });
      });
    });

    describe('Testing callback functions on calling invalidate with callback', () => {
      it('should use `callback` function', (done) => {
        const compiler = webpack(config);
        const callback = jest.fn();
        const server = new Server(baseDevConfig, compiler);

        compiler.hooks.done.tap('webpack-dev-server', () => {
          server.close(done);
        });

        server.listen(port, '127.0.0.1', (error) => {
          if (error) {
            throw error;
          }

          server.invalidate(callback);

          expect(server.middleware.context.callbacks[0]).toBe(callback);
        });
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

  describe('Server.getFreePort', () => {
    let dummyServers = [];

    afterEach(() => {
      delete process.env.WEBPACK_DEV_SERVER_BASE_PORT;
      delete process.env.WEBPACK_DEV_SERVER_PORT_RETRY;

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
      process.env.WEBPACK_DEV_SERVER_BASE_PORT = 60000;

      return (Array.isArray(n) ? n : [...new Array(n)]).reduce(
        (p, _, i) =>
          p.then(
            () =>
              new Promise((resolve, reject) => {
                const server = http.createServer();

                dummyServers.push(server);

                server.listen(60000 + i, '0.0.0.0', () => {
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

    it('should returns the port when the port is specified', async () => {
      const retryCount = 1;

      process.env.WEBPACK_DEV_SERVER_PORT_RETRY = retryCount;

      const freePort = await Server.getFreePort(8082);
      expect(freePort).toEqual(8082);
    });

    it('should returns the port when the port is null', async () => {
      const retryCount = 2;

      process.env.WEBPACK_DEV_SERVER_PORT_RETRY = retryCount;

      await createDummyServers(retryCount);
      const freePort = await Server.getFreePort(null);
      expect(freePort).toEqual(60000 + retryCount);
    });

    it('should returns the port when the port is undefined', async () => {
      const retryCount = 3;

      process.env.WEBPACK_DEV_SERVER_PORT_RETRY = retryCount;

      await createDummyServers(retryCount);
      // eslint-disable-next-line no-undefined
      const freePort = await Server.getFreePort(undefined);
      expect(freePort).toEqual(60000 + retryCount);
    });

    it('should retry finding the port for up to defaultPortRetry times (number)', async () => {
      const retryCount = 4;

      process.env.WEBPACK_DEV_SERVER_PORT_RETRY = retryCount;

      await createDummyServers(retryCount);
      const freePort = await Server.getFreePort();
      expect(freePort).toEqual(60000 + retryCount);
    });

    it('should retry finding the port for up to defaultPortRetry times (string)', async () => {
      const retryCount = 5;

      process.env.WEBPACK_DEV_SERVER_PORT_RETRY = retryCount;

      await createDummyServers(retryCount);
      const freePort = await Server.getFreePort();
      expect(freePort).toEqual(60000 + retryCount);
    });

    // TODO: fix me, Flaky on CI
    it('should retry finding the port when serial ports are busy', async () => {
      const busyPorts = [60000, 60001, 60002, 60003, 60004, 60005];

      process.env.WEBPACK_DEV_SERVER_PORT_RETRY = 6;

      await createDummyServers(busyPorts);
      const freePort = await Server.getFreePort();
      expect(freePort).toEqual(60000 + busyPorts.length);
    });

    it("should throws the error when the port isn't found", async () => {
      expect.assertions(1);

      jest.mock('portfinder', () => {
        return {
          getPort: (callback) => callback(new Error('busy')),
        };
      });

      process.env.WEBPACK_DEV_SERVER_PORT_RETRY = 1;

      try {
        await Server.getFreePort();
      } catch (err) {
        expect(err.message).toMatchSnapshot();
      }
    });

    it('should work with findPort util', async () => {
      process.env.DEFAULT_PORT_RETRY = 5;

      const freePort = await findPort(8082);
      expect(freePort).toEqual(8082);
    });
  });
});
