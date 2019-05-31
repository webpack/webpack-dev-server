'use strict';

const webpack = require('webpack');
const { noop } = require('webpack-dev-middleware/lib/util');
const Server = require('../lib/Server');
const config = require('./fixtures/simple-config/webpack.config');

describe('Invalidate Callback', () => {
  describe('Testing callback functions on calling invalidate without callback', () => {
    it('should be `noop` (the default callback function)', (done) => {
      const compiler = webpack(config);
      const server = new Server(compiler);

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
      const server = new Server(compiler);
      server.invalidate(callback);

      expect(server.middleware.context.callbacks[0]).toBe(callback);

      compiler.hooks.done.tap('webpack-dev-server', () => {
        server.close(done);
      });

      compiler.run(() => {});
    });
  });
});
