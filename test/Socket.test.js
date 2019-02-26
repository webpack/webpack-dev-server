'use strict';

const request = require('supertest');
const config = require('./fixtures/simple-config/webpack.config');
const helper = require('./helper');
const socket = require('../client-src/default/socket.js');

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
      expect(!!server.sockPath.match(/\/[a-z0-9\-/]+[^/]$/)).toBeTruthy();
    });

    it('responds with a 200', (done) => {
      req.get('/sockjs-node').expect(200, done);
    });
  });

  describe('failing behaviour', () => {
    beforeEach((done) => {
      server = helper.start(config, {}, done);
      req = request('http://localhost:8080');
    });

    it('should increase reconnect time exponentially', () => {
      // TODO
      // Try to connect to websocket server, ideally with a different
      // origin so it fails to connect
      socket("http://localhost:8080/sockjs-node/123/456/websocket");
      // Inspect socket (retries or retryInMs) to make sure it waits
      // an exponential amount of time and retries variable increases
      // every time
    });
  });

  describe('socksPath option', () => {
    const path = '/foo/test/bar';
    beforeEach((done) => {
      server = helper.start(
        config,
        {
          sockPath: '/foo/test/bar/',
        },
        done
      );
      req = request('http://localhost:8080');
    });

    it('sets the sock path correctly and strips leading and trailing /s', () => {
      expect(server.sockPath).toEqual(path);
    });

    it('responds with a 200 second', (done) => {
      req.get(path).expect(200, done);
    });
  });
});
