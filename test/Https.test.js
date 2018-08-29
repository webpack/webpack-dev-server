'use strict';

const path = require('path');
const request = require('supertest');
const helper = require('./helper');
const config = require('./fixtures/contentbase-config/webpack.config');
require('mocha-sinon');

const contentBasePublic = path.join(__dirname, 'fixtures/contentbase-config/public');

describe('HTTPS', function testHttps() {
  let server;
  let req;
  afterEach(helper.close);

  // Increase the timeout to 20 seconds to allow time for key generation.
  this.timeout(20000);

  describe('to directory', () => {
    before((done) => {
      server = helper.start(config, {
        contentBase: contentBasePublic,
        https: true
      }, done);
      req = request(server.app);
    });

    it('Request to index', (done) => {
      req.get('/')
        .expect(200, /Heyo/, done);
    });
  });
});
