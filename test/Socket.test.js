'use strict';

const assert = require('assert');
const request = require('supertest');
const config = require('./fixtures/simple-config/webpack.config');
const helper = require('./helper');

describe('socket options', () => {
  let server;
  let req;

  afterEach((done) => {
    helper.close(done);
    req = null;
    server = null;
  });
  describe('default behavior', () => {
    beforeEach((done) => {
      server = helper.start(config, {}, done);
      req = request('http://localhost:8080');
    });

    it('defaults to a path', () => {
      assert.ok(server.sockPath.match(/\/[a-z0-9\-/]+[^/]$/));
    });

    it('responds with a 200', (done) => {
      req.get('/sockjs-node').expect(200, done);
    });
  });

  describe('socksPath option', () => {
    const path = '/foo/test/bar';
    beforeEach((done) => {
      server = helper.start(
        config,
        {
          sockPath: '/foo/test/bar/'
        },
        done
      );
      req = request('http://localhost:8080');
    });

    it('sets the sock path correctly and strips leading and trailing /s', () => {
      assert.equal(server.sockPath, path);
    });

    it('responds with a 200 second', (done) => {
      req.get(path).expect(200, done);
    });
  });
});
