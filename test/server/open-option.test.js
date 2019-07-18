'use strict';

jest.mock('opn');

const webpack = require('webpack');
const open = require('opn');
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
      quiet: true,
    });

    compiler.hooks.done.tap('webpack-dev-server', () => {
      server.close(() => {
        expect(open.mock.calls[0]).toMatchInlineSnapshot(`
          Array [
            "http://localhost:8120/",
            Object {
              "wait": false,
            },
          ]
        `);
        expect(open.mock.invocationCallOrder[0]).toEqual(1);
        done();
      });
    });

    compiler.run(() => {});
    server.listen(port, 'localhost');
  });
});
