'use strict';

const request = require('supertest');
const testServer = require('../helpers/test-server');
const config = require('../fixtures/universal-compiler-config/webpack.config');
const port = require('../ports-map')['universal-compiler'];

describe('universal compiler', () => {
  let server;
  let req;

  beforeAll((done) => {
    server = testServer.start(config, { port }, done);
    req = request(server.app);
  });

  afterAll(testServer.close);

  it('client bundle should have the inlined the client runtime', (done) => {
    req
      .get('/client.js')
      .expect('Content-Type', 'application/javascript; charset=utf-8')
      .expect(200)
      .end((err, res) => {
        if (err) {
          return done(err);
        }
        expect(res.text).toContain('Hello from the client');
        expect(res.text).toContain('WebsocketClient');
        done();
      });
  });

  it('server bundle should NOT have the inlined the client runtime', (done) => {
    // we wouldn't normally request a server bundle
    // but we'll do it here to check the contents
    req
      .get('/server.js')
      .expect('Content-Type', 'application/javascript; charset=utf-8')
      .expect(200)
      .end((err, res) => {
        if (err) {
          return done(err);
        }
        expect(res.text).toContain('Hello from the server');
        expect(res.text).not.toContain('WebsocketClient');
        done();
      });
  });
});
