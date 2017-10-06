'use strict';

/* eslint import/no-extraneous-dependencies: off */

const request = require('supertest');
const helper = require('../helper');
const config = require('../fixtures/simple-config/webpack.config');

describe('Compress', () => {
  let server;
  let req;

  before((done) => {
    server = helper.start(config, {
      compress: true
    }, done);
    req = request(server.app);
  });

  after((done) => {
    helper.close(server, done);
  });

  it('request to bundle file', (done) => {
    req.get('/bundle.js')
      .expect('Content-Encoding', 'gzip')
      .expect(200, done);
  });
});
