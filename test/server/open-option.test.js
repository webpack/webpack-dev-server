'use strict';

jest.mock('open');

const webpack = require('webpack');
const open = require('open');
const Server = require('../../lib/Server');
const config = require('../fixtures/simple-config/webpack.config');
const port = require('../ports-map')['open-option'];

open.mockImplementation(() => {
  return {
    catch: jest.fn(),
  };
});

describe('open option', () => {
  it('should open', (done) => {
    const compiler = webpack(config);
    const server = new Server(compiler, {
      open: true,
      port,
    });

    compiler.hooks.done.tap('webpack-dev-server', () => {
      expect(open.mock.calls[0]).toEqual([`http://localhost:${port}/`, {}]);
      expect(open.mock.invocationCallOrder[0]).toEqual(1);
      server.close(done);
    });

    compiler.run(() => {});
    server.listen(port, 'localhost');
  });
});
