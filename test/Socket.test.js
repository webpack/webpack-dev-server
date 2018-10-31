'use strict';

const assert = require('assert');
const config = require('./fixtures/simple-config/webpack.config');
const helper = require('./helper');


describe('socket options', () => {
  let server;

  afterEach(helper.close);

  describe('default behavior', () => {
    before((done) => {
      server = helper.start(config, {}, done);
    });

    it('defaults to a path', () => {
      assert.ok(server.sockPath.match(/\/[a-z0-9\-/]+[^/]$/));
    });
  });

  describe('socksPath option', () => {
    const path = '/foo/test/bar';
    before((done) => {
      server = helper.start(config, {
        sockPath: '/foo/test/bar/'
      }, done);
    });

    it('correctly sets the servers sockPath including removal of extraneous slashes', () => {
      assert.equal(path, server.sockPath);
    });
  });
});
