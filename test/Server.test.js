'use strict';

const { relative, sep } = require('path');
const webpack = require('webpack');
const request = require('supertest');
const Server = require('../lib/Server');
const config = require('./fixtures/simple-config/webpack.config');
const helper = require('./helper');

describe('Server', () => {
  describe('addEntries', () => {
    it('add hot option', () => {
      return new Promise((res) => {
        // eslint-disable-next-line
        const Server = require('../lib/Server');
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
          server.close(() => {
            res();
          });
        });

        compiler.run(() => {});
      });
    });

    it('add hotOnly option', () => {
      return new Promise((res) => {
        // eslint-disable-next-line
        const Server = require('../lib/Server');
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
          server.close(() => {
            res();
          });
        });

        compiler.run(() => {});
      });
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

    it("should success even if mine.types doesn't exist", () => {
      // eslint-disable-next-line
      const Server = require('../lib/Server');

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

      return new Promise((res) => {
        const compiler = webpack(config);
        const server = new Server(compiler);

        compiler.hooks.done.tap('webpack-dev-server', (s) => {
          const output = server.getStats(s);
          expect(output.errors.length).toEqual(0);

          server.close(() => {
            res();
          });
        });

        compiler.run(() => {});
        server.listen(8080, 'localhost');
      });
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

      return new Promise((resolve, reject) => {
        (function iterate(stats, i) {
          if (i === allStats.length) {
            return resolve();
          }

          // Iterate to cover each case.
          Promise.resolve()
            .then(
              () =>
                new Promise((res) => {
                  const compiler = webpack(config);
                  const server = new Server(compiler, { stats });

                  compiler.hooks.done.tap('webpack-dev-server', (s) => {
                    expect(Object.keys(server.getStats(s))).toMatchSnapshot();

                    server.close(() => {
                      res();
                    });
                  });

                  compiler.run(() => {});
                  server.listen(8080, 'localhost');
                })
            )
            .then(() => {
              i += 1;
              iterate(allStats[i], i);
            })
            .catch((e) => {
              reject(e);
            });
        })(allStats[0], 0);
      });
    });

    it('should respect warningsFilter', () => {
      return new Promise((res) => {
        const compiler = webpack(config);
        const server = new Server(compiler, {
          stats: { warningsFilter: 'test' },
        });

        compiler.hooks.done.tap('webpack-dev-server', (s) => {
          s.compilation.warnings = ['test', 'another warning'];

          const output = server.getStats(s);

          expect(output.warnings.length).toBe(1);
          expect(output.warnings[0]).toBe('another warning');

          server.close(() => {
            res();
          });
        });

        compiler.run(() => {});
        server.listen(8080, 'localhost');
      });
    });
  });

  describe('host', () => {
    let server = null;
    let req = null;

    describe('is not be specified', () => {
      beforeAll((done) => {
        server = helper.start(config, {}, done);
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

      afterAll(helper.close);
    });

    describe('is undefined', () => {
      beforeAll((done) => {
        server = helper.start(
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

      afterAll(helper.close);
    });

    describe('is null', () => {
      beforeAll((done) => {
        server = helper.start(
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

      afterAll(helper.close);
    });

    describe('is 127.0.0.1 (IPv4)', () => {
      beforeAll((done) => {
        server = helper.start(
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

      afterAll(helper.close);
    });

    describe('is localhost', () => {
      beforeAll((done) => {
        server = helper.start(
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

      afterAll(helper.close);
    });

    describe('is 0.0.0.0', () => {
      beforeAll((done) => {
        server = helper.start(
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

      afterAll(helper.close);
    });
  });

  describe('port', () => {
    let server = null;
    let req = null;

    describe('is not be specified', () => {
      beforeAll((done) => {
        server = helper.start(config, {}, done);
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

      afterAll(helper.close);
    });

    describe('is undefined', () => {
      beforeAll((done) => {
        server = helper.start(
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

      afterAll(helper.close);
    });

    describe('is null', () => {
      beforeAll((done) => {
        server = helper.start(
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

      afterAll(helper.close);
    });

    describe('is "33333"', () => {
      beforeAll((done) => {
        server = helper.start(
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

      afterAll(helper.close);
    });

    describe('is 33333', () => {
      beforeAll((done) => {
        server = helper.start(
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

      afterAll(helper.close);
    });
  });
});
