'use strict';

/* eslint import/no-extraneous-dependencies: off */

const assert = require('assert');
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

  describe('default to PWD', () => {
    before((done) => {
      server = helper.start(config, {}, done);
      req = request(server.app);
    });

    it('Request to page', () => {
      assert(server.options.contentBase, path.resolve(__dirname, '../..'));
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
