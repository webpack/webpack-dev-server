'use strict';

const request = require('supertest');
const testServer = require('../helpers/test-server');
const config = require('../fixtures/multi-compiler-config/webpack.config');
const port = require('../ports-map')['multi-compiler'];

describe('multi compiler', () => {
  let server;
  let req;

  beforeAll((done) => {
    server = testServer.start(config, { port }, done);
    req = request(server.app);
  });

  afterAll(testServer.close);

  it('should handle GET request to bundle', async () => {
    const res = await req.get('/main.js');
    expect(res.headers['content-type']).toEqual(
      'application/javascript; charset=utf-8'
    );
    expect(res.status).toEqual(200);
  });
});
