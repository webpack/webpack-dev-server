'use strict';

const path = require('path');
const request = require('supertest');
const testServer = require('../helpers/test-server');
const config = require('../fixtures/historyapifallback-config/webpack.config');
const config2 = require('../fixtures/historyapifallback-2-config/webpack.config');
const config3 = require('../fixtures/historyapifallback-3-config/webpack.config');
const port = require('../ports-map')['historyApiFallback-option'];

describe('historyApiFallback option', () => {
  let server;
  let req;

  afterEach(testServer.close);

  describe('as boolean', () => {
    beforeAll((done) => {
      server = testServer.start(
        config,
        {
          historyApiFallback: true,
          port,
        },
        done
      );
      req = request(server.app);
    });

    it('request to directory', (done) => {
      req.get('/foo').accept('html').expect(200, /Heyyy/, done);
    });
  });

  describe('as object', () => {
    beforeAll((done) => {
      server = testServer.start(
        config,
        {
          historyApiFallback: {
            index: '/bar.html',
          },
          port,
        },
        done
      );
      req = request(server.app);
    });

    it('request to directory', (done) => {
      req
        .get('/foo')
        .accept('html')
        .expect(200, /Foobar/, done);
    });
  });

  describe('as object with static', () => {
    beforeAll((done) => {
      server = testServer.start(
        config2,
        {
          static: path.resolve(
            __dirname,
            '../fixtures/historyapifallback-2-config'
          ),
          historyApiFallback: {
            index: '/bar.html',
          },
          port,
        },
        done
      );
      req = request(server.app);
    });

    it('historyApiFallback should take preference above directory index', (done) => {
      req
        .get('/')
        .accept('html')
        .expect(200, /Foobar/, done);
    });

    it('request to directory', (done) => {
      req
        .get('/foo')
        .accept('html')
        .expect(200, /Foobar/, done);
    });

    it('static file should take preference above historyApiFallback', (done) => {
      req
        .get('/random-file')
        .accept('html')
        .end((err, res) => {
          if (err) {
            done(err);
          }

          expect(res.body.toString().trim()).toEqual('Random file');

          done();
        });
    });
  });

  describe('as object with static set to false', () => {
    beforeAll((done) => {
      server = testServer.start(
        config3,
        {
          static: false,
          historyApiFallback: {
            index: '/bar.html',
          },
          port,
        },
        done
      );
      req = request(server.app);
    });

    it('historyApiFallback should work and ignore static content', (done) => {
      req
        .get('/index.html')
        .accept('html')
        .expect(200, /In-memory file/, done);
    });
  });

  describe('as object with static and rewrites', () => {
    beforeAll((done) => {
      server = testServer.start(
        config2,
        {
          port,
          static: path.resolve(
            __dirname,
            '../fixtures/historyapifallback-2-config'
          ),
          historyApiFallback: {
            rewrites: [
              {
                from: /other/,
                to: '/other.html',
              },
              {
                from: /.*/,
                to: '/bar.html',
              },
            ],
          },
        },
        done
      );
      req = request(server.app);
    });

    it('historyApiFallback respect rewrites for index', (done) => {
      req
        .get('/')
        .accept('html')
        .expect(200, /Foobar/, done);
    });

    it('historyApiFallback respect rewrites and shows index for unknown urls', (done) => {
      req
        .get('/acme')
        .accept('html')
        .expect(200, /Foobar/, done);
    });

    it('historyApiFallback respect any other specified rewrites', (done) => {
      req
        .get('/other')
        .accept('html')
        .expect(200, /Other file/, done);
    });
  });

  describe('as object with the "verbose" option', () => {
    let consoleSpy;

    beforeAll((done) => {
      consoleSpy = jest.spyOn(global.console, 'log');

      server = testServer.start(
        config,
        {
          historyApiFallback: {
            index: '/bar.html',
            verbose: true,
          },
          port,
        },
        done
      );
      req = request(server.app);
    });

    afterAll(() => {
      consoleSpy.mockRestore();
    });

    it('request to directory and log', (done) => {
      req
        .get('/foo')
        .accept('html')
        .expect(200, /Foobar/, (error) => {
          if (error) {
            done(error);

            return;
          }

          expect(consoleSpy).toHaveBeenCalledWith(
            'Rewriting',
            'GET',
            '/foo',
            'to',
            '/bar.html'
          );

          done();
        });
    });
  });

  describe('as object with the "logger" option', () => {
    let consoleSpy;

    beforeAll((done) => {
      consoleSpy = jest.spyOn(global.console, 'log');

      server = testServer.start(
        config,
        {
          historyApiFallback: {
            index: '/bar.html',
            logger: consoleSpy,
          },
          port,
        },
        done
      );
      req = request(server.app);
    });

    afterAll(() => {
      consoleSpy.mockRestore();
    });

    it('request to directory and log', (done) => {
      req
        .get('/foo')
        .accept('html')
        .expect(200, /Foobar/, (error) => {
          if (error) {
            done(error);

            return;
          }

          expect(consoleSpy).toHaveBeenCalledWith(
            'Rewriting',
            'GET',
            '/foo',
            'to',
            '/bar.html'
          );

          done();
        });
    });
  });

  describe('in-memory files', () => {
    beforeAll((done) => {
      server = testServer.start(
        config3,
        {
          static: path.resolve(
            __dirname,
            '../fixtures/historyapifallback-3-config'
          ),
          historyApiFallback: true,
          port,
        },
        done
      );
      req = request(server.app);
    });

    it('should take precedence over static files', (done) => {
      req
        .get('/foo')
        .accept('html')
        .expect(200, /In-memory file/, done);
    });
  });
});
