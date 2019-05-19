'use strict';

const request = require('supertest');
const testServer = require('./helpers/test-server');
const config = require('./fixtures/multi-compiler-config/webpack.config');

describe('MultiCompiler', () => {
  let server;
  let req;
  beforeAll((done) => {
    server = testServer.start(config, {}, done);
    req = request(server.app);
  });

  afterAll(testServer.close);

  // TODO: this is a very basic test, optimally it should test multiple configs etc.
  it('GET request to bundle', (done) => {
    req
      .get('/main.js')
      .expect('Content-Type', 'application/javascript; charset=UTF-8')
      .expect(200, done);
  });
});
