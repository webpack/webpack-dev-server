'use strict';

const assert = require('assert');
const path = require('path');
const request = require('request');
const config = require('./fixtures/simple-config/webpack.config');
const helper = require('./helper');

const requestSucceeds = (done) => (err, res, body) => {
  if (err) {
    done(err);
  }

  assert.equal(res.statusCode, 200);
  done();
}

describe('socket options', () => {
  let server;
  let req;

  afterEach(helper.close);
  describe('default behavior', () => {
    beforeEach((done) => {
      server = helper.start(config, {}, done);
    });

    it('defaults to a path', () => {
      assert.ok(server.sockPath.match(/\/[a-z0-9\-/]+[^/]$/));
    });

    it('responds with a 200', (done) => {
      request(`http://localhost:8080/sockjs-node`, requestSucceeds(done));
    });
  });

  describe('socksPath option', () => {
    const path = '/foo/test/bar';
    beforeEach((done) => {
      server = helper.start(config, {
        sockPath: '/foo/test/bar/'
      }, done);
    });

    it('sets the sock path correctly and strips leading and trailing /s', () => {
      assert.equal(server.sockPath, path);
    });

    it('responds with a 200 second', (done) => {
      request(`http://localhost:8080${path}`, requestSucceeds(done));
    })
  });
});
