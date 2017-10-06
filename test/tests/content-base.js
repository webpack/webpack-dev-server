'use strict';

/* eslint import/no-extraneous-dependencies: off */

const path = require('path');
const request = require('supertest');
const helper = require('../helper');
const config = require('../fixtures/contentbase-config/webpack.config');
require('mocha-sinon');

const contentBasePublic = path.join(__dirname, '../fixtures/contentbase-config/public');
const contentBaseOther = path.join(__dirname, '../fixtures/contentbase-config/other');

describe('ContentBase', () => {
  let server;
  let req;

  afterEach((done) => {
    helper.close(server, done);
  });

  describe('directory', () => {
    before((done) => {
      server = helper.start(config, {
        contentBase: contentBasePublic
      }, done);
      req = request(server.app);
    });

    it('request index', (done) => {
      req.get('/')
        .expect(200, /Heyo/, done);
    });

    it('request to other file', (done) => {
      req.get('/other.html')
        .expect(200, /Other html/, done);
    });
  });

  describe('directories', () => {
    before((done) => {
      server = helper.start(config, {
        contentBase: [contentBasePublic, contentBaseOther]
      }, done);
      req = request(server.app);
    });

    it('Request to first directory', (done) => {
      req.get('/')
        .expect(200, /Heyo/, done);
    });

    it('Request to second directory', (done) => {
      req.get('/foo.html')
        .expect(200, /Foo!/, done);
    });
  });

  describe('port', () => {
    before((done) => {
      server = helper.start(config, {
        contentBase: 9099999
      }, done);
      req = request(server.app);
    });

    it('Request to page', (done) => {
      req.get('/other.html')
        .expect('Location', '//localhost:9099999/other.html')
        .expect(302, done);
    });
  });

  describe('external url', () => {
    before((done) => {
      server = helper.start(config, {
        contentBase: 'http://example.com/'
      }, done);
      req = request(server.app);
    });

    it('Request to page', (done) => {
      req.get('/foo.html')
      // TODO: hmm, two slashes seems to be a bug?
        .expect('Location', 'http://example.com//foo.html')
        .expect(302, done);
    });

    it('Request to page with search params', (done) => {
      req.get('/foo.html?space=ship')
      // TODO: hmm, two slashes seems to be a bug?
        .expect('Location', 'http://example.com//foo.html?space=ship')
        .expect(302, done);
    });
  });

  describe('default to PWD', () => {
    before(function before(done) {
      this.sinon.stub(process, 'cwd');
      process.cwd.returns(contentBasePublic);
      server = helper.start(config, {}, done);
      req = request(server.app);
    });

    it('Request to page', (done) => {
      req.get('/other.html')
        .expect(200, done);
    });
  });

  describe('disable', () => {
    before(function before(done) {
      // This is a somewhat weird test, but it is important that we mock
      // the PWD here, and test if /other.html in our "fake" PWD really is not requested.
      this.sinon.stub(process, 'cwd');
      process.cwd.returns(contentBasePublic);
      server = helper.start(config, {
        contentBase: false
      }, done);
      req = request(server.app);
    });

    it('Request to page', (done) => {
      req.get('/other.html')
        .expect(404, done);
    });
  });
});
