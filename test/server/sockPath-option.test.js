'use strict';

const request = require('supertest');
const config = require('../fixtures/simple-config/webpack.config');
const testServer = require('../helpers/test-server');
const port = require('../ports-map')['sockPath-option'];

describe('sockPath options', () => {
  let server;
  let req;

  afterEach((done) => {
    testServer.close(done);
    req = null;
    server = null;
  });

  describe('default behavior', () => {
    beforeEach((done) => {
      server = testServer.start(config, { port }, done);
      req = request(`http://localhost:${port}`);
    });

    it('defaults to a path', () => {
      expect(!!server.sockPath.match(/\/[a-z0-9\-/]+[^/]$/)).toBeTruthy();
    });

    it('responds with a 200', async () => {
      await req.get('/sockjs-node').expect(200);
    });
  });

  describe('socksPath option', () => {
    const path = '/foo/test/bar';

    beforeEach((done) => {
      server = testServer.start(
        config,
        {
          sockPath: '/foo/test/bar/',
          port,
        },
        done
      );
      req = request(`http://localhost:${port}`);
    });

    it('sets the sock path correctly and strips leading and trailing /s', () => {
      expect(server.sockPath).toEqual(path);
    });

    it('responds with a 200 second', async () => {
      await req.get(path).expect(200);
    });
  });
});
