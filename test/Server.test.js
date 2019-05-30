'use strict';

const { relative, sep } = require('path');
const webpack = require('webpack');
const request = require('supertest');
// Mock opn before loading Server
jest.mock('opn');
// eslint-disable-next-line import/newline-after-import
const opn = require('opn');
opn.mockImplementation(() => {
  return {
    catch: jest.fn(),
  };
});
jest.mock('sockjs/lib/transport');
// eslint-disable-next-line import/newline-after-import
const sockjs = require('sockjs/lib/transport');
const Server = require('../lib/Server');
const config = require('./fixtures/simple-config/webpack.config');
const testServer = require('./helpers/test-server');

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
      const server = new Server(compiler);

      compiler.hooks.done.tap('webpack-dev-server', (s) => {
        const output = server.getStats(s);
        expect(output.errors.length).toEqual(0);

        server.close(done);
      });

      compiler.run(() => {});
      server.listen(8080, 'localhost');
    });
  });

  describe('stats', () => {
    it(`should works with difference stats values (contains 'hash', 'assets', 'warnings' and 'errors')`, () => {
      const allStats = [
        {},
        // eslint-disable-next-line no-undefined
        undefined,
        false,
        'errors-only',
        {
          assets: false,
        },
      ];

      return allStats.reduce((p, stats) => {
        return p.then(() => {
          return new Promise((resolve) => {
            const compiler = webpack(config);
            const server = new Server(compiler, { stats });

            compiler.hooks.done.tap('webpack-dev-server', (s) => {
              expect(Object.keys(server.getStats(s))).toMatchSnapshot();

              server.close(resolve);
            });

            compiler.run(() => {});
            server.listen(8080, 'localhost');
          });
        });
      }, Promise.resolve());
    });

    it('should respect warningsFilter', (done) => {
      const compiler = webpack(config);
      const server = new Server(compiler, {
        stats: { warningsFilter: 'test' },
      });

      compiler.hooks.done.tap('webpack-dev-server', (s) => {
        s.compilation.warnings = ['test', 'another warning'];

        const output = server.getStats(s);

        expect(output.warnings.length).toBe(1);
        expect(output.warnings[0]).toBe('another warning');

        server.close(done);
      });

      compiler.run(() => {});
      server.listen(8080, 'localhost');
    });

    it('should open', (done) => {
      const compiler = webpack(config);
      const server = new Server(compiler, {
        open: true,
      });

      compiler.hooks.done.tap('webpack-dev-server', () => {
        expect(opn.mock.calls[0]).toEqual(['http://localhost:8080/', {}]);
        expect(opn.mock.invocationCallOrder[0]).toEqual(1);
        server.close(done);
      });

      compiler.run(() => {});
      server.listen(8080, 'localhost');
    });
  });

  describe('host', () => {
    let server = null;
    let req = null;

    describe('is not be specified', () => {
      beforeAll((done) => {
        server = testServer.start(config, {}, done);
        req = request(server.app);
      });

      it('server address', () => {
        const address = server.listeningApp.address();

        expect(address.address).toBe('127.0.0.1');
        expect(address.port).toBe(8080);
      });

      it('Request to index', (done) => {
        req.get('/').expect(200, done);
      });

      afterAll(testServer.close);
    });

    describe('is undefined', () => {
      beforeAll((done) => {
        server = testServer.start(
          config,
          {
            // eslint-disable-next-line no-undefined
            host: undefined,
          },
          done
        );
        req = request(server.app);
      });

      it('server address', () => {
        const address = server.listeningApp.address();

        expect(address.address).toBe('::');
        expect(address.port).toBe(8080);
      });

      it('Request to index', (done) => {
        req.get('/').expect(200, done);
      });

      afterAll(testServer.close);
    });

    describe('is null', () => {
      beforeAll((done) => {
        server = testServer.start(
          config,
          {
            host: null,
          },
          done
        );
        req = request(server.app);
      });

      it('server address', () => {
        const address = server.listeningApp.address();

        expect(address.address).toBe('::');
        expect(address.port).toBe(8080);
      });

      it('Request to index', (done) => {
        req.get('/').expect(200, done);
      });

      afterAll(testServer.close);
    });

    describe('is 127.0.0.1 (IPv4)', () => {
      beforeAll((done) => {
        server = testServer.start(
          config,
          {
            host: '127.0.0.1',
          },
          done
        );
        req = request(server.app);
      });

      it('server address', () => {
        const address = server.listeningApp.address();

        expect(address.address).toBe('127.0.0.1');
        expect(address.port).toBe(8080);
      });

      it('Request to index', (done) => {
        req.get('/').expect(200, done);
      });

      afterAll(testServer.close);
    });

    describe('is localhost', () => {
      beforeAll((done) => {
        server = testServer.start(
          config,
          {
            host: 'localhost',
          },
          done
        );
        req = request(server.app);
      });

      it('server address', () => {
        const address = server.listeningApp.address();

        expect(address.address).toBe('127.0.0.1');
        expect(address.port).toBe(8080);
      });

      it('Request to index', (done) => {
        req.get('/').expect(200, done);
      });

      afterAll(testServer.close);
    });

    describe('is 0.0.0.0', () => {
      beforeAll((done) => {
        server = testServer.start(
          config,
          {
            host: '0.0.0.0',
          },
          done
        );
        req = request(server.app);
      });

      it('server address', () => {
        const address = server.listeningApp.address();

        expect(address.address).toBe('0.0.0.0');
        expect(address.port).toBe(8080);
      });

      it('Request to index', (done) => {
        req.get('/').expect(200, done);
      });

      afterAll(testServer.close);
    });
  });

  describe('port', () => {
    let server = null;
    let req = null;

    describe('is not be specified', () => {
      beforeAll((done) => {
        server = testServer.start(config, {}, done);
        req = request(server.app);
      });

      it('server address', () => {
        const address = server.listeningApp.address();

        expect(address.address).toBe('127.0.0.1');
        // Random port
        expect(address.port).toBeDefined();
      });

      it('Request to index', (done) => {
        req.get('/').expect(200, done);
      });

      afterAll(testServer.close);
    });

    describe('is undefined', () => {
      beforeAll((done) => {
        server = testServer.start(
          config,
          {
            // eslint-disable-next-line no-undefined
            port: undefined,
          },
          done
        );
        req = request(server.app);
      });

      it('server address', () => {
        const address = server.listeningApp.address();

        expect(address.address).toBe('127.0.0.1');
        // Random port
        expect(address.port).toBeDefined();
      });

      it('Request to index', (done) => {
        req.get('/').expect(200, done);
      });

      afterAll(testServer.close);
    });

    describe('is null', () => {
      beforeAll((done) => {
        server = testServer.start(
          config,
          {
            port: null,
          },
          done
        );
        req = request(server.app);
      });

      it('server address', () => {
        const address = server.listeningApp.address();

        expect(address.address).toBe('127.0.0.1');
        // Random port
        expect(address.port).toBeDefined();
      });

      it('Request to index', (done) => {
        req.get('/').expect(200, done);
      });

      afterAll(testServer.close);
    });

    describe('is "33333"', () => {
      beforeAll((done) => {
        server = testServer.start(
          config,
          {
            port: '33333',
          },
          done
        );
        req = request(server.app);
      });

      it('server address', () => {
        const address = server.listeningApp.address();

        expect(address.address).toBe('127.0.0.1');
        expect(address.port).toBe(33333);
      });

      it('Request to index', (done) => {
        req.get('/').expect(200, done);
      });

      afterAll(testServer.close);
    });

    describe('is 33333', () => {
      beforeAll((done) => {
        server = testServer.start(
          config,
          {
            port: '33333',
          },
          done
        );
        req = request(server.app);
      });

      it('server address', () => {
        const address = server.listeningApp.address();

        expect(address.address).toBe('127.0.0.1');
        expect(address.port).toBe(33333);
      });

      it('Request to index', (done) => {
        req.get('/').expect(200, done);
      });

      afterAll(testServer.close);
    });
  });
});
