'use strict';

const path = require('path');
const request = require('supertest');
const testServer = require('../helpers/test-server');
const config = require('../fixtures/historyapifallback-config/webpack.config');
const config2 = require('../fixtures/historyapifallback-2-config/webpack.config');
const config3 = require('../fixtures/historyapifallback-3-config/webpack.config');
const port = require('../ports-map')['history-api-fallback-option'];

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

    it('request to directory', async () => {
      const res = await req.get('/foo').accept('html');
      expect(res.headers['content-type']).toEqual('text/html; charset=utf-8');
      expect(res.status).toEqual(200);
      expect(res.text).toContain('Heyyy');
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

    it('request to directory', async () => {
      const res = await req.get('/foo').accept('html');
      expect(res.status).toEqual(200);
      expect(res.text).toContain('Foobar');
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

    it('historyApiFallback should take preference above directory index', async () => {
      const res = await req.get('/foo').accept('html');
      expect(res.status).toEqual(200);
      expect(res.text).toContain('Foobar');
    });

    it('request to directory', async () => {
      const res = await req.get('/foo').accept('html');
      expect(res.status).toEqual(200);
      expect(res.text).toContain('Foobar');
    });

    it('static file should take preference above historyApiFallback', async () => {
      const res = await req.get('/random-file').accept('html');
      expect(res.status).toEqual(200);
      expect(res.body.toString().trim()).toEqual('Random file');
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

    it('historyApiFallback should work and ignore static content', async () => {
      const res = await req.get('/index.html').accept('html');
      expect(res.status).toEqual(200);
      expect(res.text).toContain('In-memory file');
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

    it('historyApiFallback respect rewrites for index', async () => {
      const res = await req.get('/').accept('html');
      expect(res.status).toEqual(200);
      expect(res.text).toContain('Foobar');
    });

    it('historyApiFallback respect rewrites and shows index for unknown urls', async () => {
      const res = await req.get('/acme').accept('html');
      expect(res.status).toEqual(200);
      expect(res.text).toContain('Foobar');
    });

    it('historyApiFallback respect any other specified rewrites', async () => {
      const res = await req.get('/other').accept('html');
      expect(res.status).toEqual(200);
      expect(res.text).toContain('Other file');
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

    it('request to directory and log', async () => {
      const res = await req.get('/foo').accept('html');
      expect(res.status).toEqual(200);
      expect(res.text).toContain('Foobar');
      expect(consoleSpy).toHaveBeenCalledWith(
        'Rewriting',
        'GET',
        '/foo',
        'to',
        '/bar.html'
      );
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

    it('request to directory and log', async () => {
      const res = await req.get('/foo').accept('html');
      expect(res.status).toEqual(200);
      expect(res.text).toContain('Foobar');
      expect(consoleSpy).toHaveBeenCalledWith(
        'Rewriting',
        'GET',
        '/foo',
        'to',
        '/bar.html'
      );
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

    it('should take precedence over static files', async () => {
      const res = await req.get('/foo').accept('html');
      expect(res.status).toEqual(200);
      expect(res.text).toContain('In-memory file');
    });
  });
});
