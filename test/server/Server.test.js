'use strict';

const { relative, sep } = require('path');
const webpack = require('webpack');
const sockjs = require('sockjs/lib/transport');
const Server = require('../../lib/Server');
const config = require('../fixtures/simple-config/webpack.config');
const port = require('../ports-map').Server;
const isWebpack5 = require('../helpers/isWebpack5');

jest.mock('sockjs/lib/transport');

const baseDevConfig = {
  port,
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
      const server = new Server(
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

    it('add hot-only option', (done) => {
      const compiler = webpack(config);
      const server = new Server(
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
    const server = new Server(compiler, baseDevConfig);

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
      const server = new Server(compiler, baseDevConfig);

      compiler.hooks.done.tap('webpack-dev-server', (s) => {
        const output = server.getStats(s);
        expect(output.errors.length).toEqual(0);

        server.close(done);
      });

      compiler.run(() => {});
      server.listen(port, 'localhost');
    });
  });

  describe('Invalidate Callback', () => {
    describe('Testing callback functions on calling invalidate without callback', () => {
      it('should use default `noop` callback', (done) => {
        const compiler = webpack(config);
        const server = new Server(compiler, baseDevConfig);

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
        const server = new Server(compiler, baseDevConfig);

        server.invalidate(callback);

        expect(server.middleware.context.callbacks[0]).toBe(callback);

        compiler.hooks.done.tap('webpack-dev-server', () => {
          server.close(done);
        });

        compiler.run(() => {});
      });
    });
  });

  describe('WEBPACK_DEV_SERVER environment variable', () => {
    const OLD_ENV = process.env;

    beforeEach(() => {
      // this is important - it clears the cache
      jest.resetModules();

      process.env = { ...OLD_ENV };

      delete process.env.WEBPACK_DEV_SERVER;
    });

    afterEach(() => {
      process.env = OLD_ENV;
    });

    it('should be present', () => {
      expect(process.env.WEBPACK_DEV_SERVER).toBeUndefined();

      require('../../lib/Server');

      expect(process.env.WEBPACK_DEV_SERVER).toBe(true);
    });
  });
});
