'use strict';

jest.mock('opn');

const webpack = require('webpack');
const opn = require('opn');
const Server = require('../../lib/Server');
const config = require('../fixtures/simple-config/webpack.config');

opn.mockImplementation(() => {
  return {
    catch: jest.fn(),
  };
});

describe('open option', () => {
  it('should open', (done) => {
    const compiler = webpack(config);
    const server = new Server(compiler, {
      open: true,
    });

    compiler.hooks.done.tap('webpack-dev-server', () => {
      server.close(() => {
        expect(opn.mock.calls[0]).toMatchInlineSnapshot(`
          Array [
            "http://localhost:8080/",
            Object {
              "wait": false,
            },
          ]
        `);
        expect(opn.mock.invocationCallOrder[0]).toEqual(1);
        done();
      });
    });

    compiler.run(() => {});
    server.listen(8080, 'localhost');
  });
});
