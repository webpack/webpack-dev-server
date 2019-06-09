'use strict';

const request = require('supertest');
const testServer = require('../helpers/test-server');
const config = require('../fixtures/universal-compiler-config/webpack.config');
const port = require('../ports-map').UniversalCompiler;

describe('universal compiler', () => {
  let server;
  let req;

  beforeAll((done) => {
    server = testServer.start(config, { inline: true, port }, done);
    req = request(server.app);
  });

  afterAll(testServer.close);

  it('client bundle should have the inlined the client runtime', async () => {
    const { res, err } = await req
      .get('/client.js')
      .expect('Content-Type', 'application/javascript; charset=UTF-8')
      .expect(200);

    if (err) {
      throw err;
    }

    expect(res.text).toContain('Hello from the client');
    expect(res.text).toContain('sockjs-client');
  });

  it('server bundle should NOT have the inlined the client runtime', async () => {
    // we wouldn't normally request a server bundle
    // but we'll do it here to check the contents
    const { res, err } = await req
      .get('/server.js')
      .expect('Content-Type', 'application/javascript; charset=UTF-8')
      .expect(200);

    if (err) {
      throw err;
    }

    expect(res.text).toContain('Hello from the server');
    expect(res.text).not.toContain('sockjs-client');
  });
});
