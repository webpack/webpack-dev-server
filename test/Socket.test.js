'use strict';

const assert = require('assert');
const request = require('supertest');
const config = require('./fixtures/simple-config/webpack.config');
const helper = require('./helper');

describe('socket options', () => {
  let server;
  let req;

  afterEach(helper.close);

  describe('default behavior', () => {
    const defaultPath = '/sockjs-node';
    before((done) => {
      server = helper.start(config, {}, done);
      req = request(server.app);
    });

    it('defaults to a path', () => {
      assert.equal(server.sockPath, defaultPath);
    });

    it('responds', (done) => {
      req.get(defaultPath)
        .expect(200)
        .end((err) => {
          if (err) {
            done(err);
          }
          done();
        });
    });
  });

  describe('socksPath option', () => {
    const path = '/foo/test/bar';
    before((done) => {
      server = helper.start(config, {
        sockPath: '/foo/test/bar/'
      }, done);
      req = request(server.app);
    });

    it('correctly sets the servers sockPath including removal of extraneous slashes', () => {
      assert.equal(path, server.sockPath);
    });

    it('responds', (done) => {
      req.get(path)
        .expect(200)
        .end((err) => {
          if (err) {
            done(err);
          }
          done();
        });
    });
  });
});
