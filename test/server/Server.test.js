'use strict';

const { relative, sep } = require('path');
const webpack = require('webpack');
const sockjs = require('sockjs/lib/transport');
const { noop } = require('webpack-dev-middleware/lib/util');
const Server = require('../../lib/Server');
const config = require('../fixtures/simple-config/webpack.config');
const port = require('../ports-map').Server;

jest.mock('sockjs/lib/transport');

describe('Server', () => {
  describe('sockjs', () => {
    it('add decorateConnection', () => {
      expect(typeof sockjs.Session.prototype.decorateConnection).toEqual(
        'function'
      );
    });
  });

  describe('addEntries', () => {
    it('add hot option', (done) => {
      const compiler = webpack(config);
      const server = new Server(compiler, {
        hot: true,
        port,
      });

      expect(
        server.middleware.context.compiler.options.entry.map((p) => {
          return relative('.', p).split(sep);
        })
      ).toMatchSnapshot();
      expect(
        server.middleware.context.compiler.options.plugins
      ).toMatchSnapshot();

      compiler.hooks.done.tap('webpack-dev-server', () => {
        server.close(done);
      });

      compiler.run(() => {});
    });

    it('add hotOnly option', (done) => {
      const compiler = webpack(config);
      const server = new Server(compiler, {
        hotOnly: true,
        port,
      });

      expect(
        server.middleware.context.compiler.options.entry.map((p) => {
          return relative('.', p).split(sep);
        })
      ).toMatchSnapshot();
      expect(
        server.middleware.context.compiler.options.plugins
      ).toMatchSnapshot();

      compiler.hooks.done.tap('webpack-dev-server', () => {
        server.close(done);
      });

      compiler.run(() => {});
    });
  });

  // issue: https://github.com/webpack/webpack-dev-server/issues/1724
  describe('express.static.mine.types', () => {
    beforeEach(() => {
      jest.resetModules();
    });

    afterEach(() => {
      jest.unmock('express');
    });

    it("should success even if mine.types doesn't exist", (done) => {
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
      const server = new Server(compiler, { port });

      compiler.hooks.done.tap('webpack-dev-server', (s) => {
        const output = server.getStats(s);
        expect(output.errors.length).toEqual(0);

        server.close(done);
      });

      compiler.run(() => {});
      server.listen(port, 'localhost');
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

      // eslint-disable-next-line global-require
      require('../../lib/Server');

      expect(process.env.WEBPACK_DEV_SERVER).toBe(true);
    });
  });

  describe('Invalidate Callback', () => {
    describe('Testing callback functions on calling invalidate without callback', () => {
      it('should be `noop` (the default callback function)', (done) => {
        const compiler = webpack(config);
        const server = new Server(compiler, { port });

        server.invalidate();
        expect(server.middleware.context.callbacks[0]).toBe(noop);

        compiler.hooks.done.tap('webpack-dev-server', () => {
          server.close(done);
        });

        compiler.run(() => {});
      });
    });

    describe('Testing callback functions on calling invalidate with callback', () => {
      it('should be `callback` function', (done) => {
        const compiler = webpack(config);
        const callback = jest.fn();
        const server = new Server(compiler, { port });

        server.invalidate(callback);

        expect(server.middleware.context.callbacks[0]).toBe(callback);

        compiler.hooks.done.tap('webpack-dev-server', () => {
          server.close(done);
        });

        compiler.run(() => {});
      });
    });
  });
});
