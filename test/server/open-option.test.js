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
  it('should work with unspecified host', (done) => {
    const compiler = webpack(config);
    const server = new Server(compiler, {
      open: true,
      port,
      static: false,
    });

    compiler.hooks.done.tap('webpack-dev-server', () => {
      server.close(() => {
        expect(open.mock.calls[0]).toMatchInlineSnapshot(`
          Array [
            "http://localhost:8117/",
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

  it('should work with "0.0.0.0" host', (done) => {
    const compiler = webpack(config);
    const server = new Server(compiler, {
      open: true,
      port,
      static: false,
    });

    compiler.hooks.done.tap('webpack-dev-server', () => {
      server.close(() => {
        expect(open.mock.calls[0]).toMatchInlineSnapshot(`
          Array [
            "http://localhost:8117/",
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
    server.listen(port, '0.0.0.0');
  });

  it('should work with "::" host', (done) => {
    const compiler = webpack(config);
    const server = new Server(compiler, {
      open: true,
      port,
      static: false,
    });

    compiler.hooks.done.tap('webpack-dev-server', () => {
      server.close(() => {
        expect(open.mock.calls[0]).toMatchInlineSnapshot(`
          Array [
            "http://localhost:8117/",
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
    server.listen(port, '::');
  });

  it('should work with "localhost" host', (done) => {
    const compiler = webpack(config);
    const server = new Server(compiler, {
      open: true,
      port,
      static: false,
    });

    compiler.hooks.done.tap('webpack-dev-server', () => {
      server.close(() => {
        expect(open.mock.calls[0]).toMatchInlineSnapshot(`
          Array [
            "http://localhost:8117/",
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
    server.listen(port, '::');
  });
});
