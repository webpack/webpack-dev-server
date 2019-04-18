'use strict';

const request = require('supertest');
const helper = require('./helper');
const config = require('./fixtures/universal-compiler-config/webpack.config');

describe('UniversalCompiler', () => {
  let server;
  let req;
  beforeAll((done) => {
    server = helper.start(config, { inline: true }, done);
    req = request(server.app);
  });

  afterAll(helper.close);

  it('client bundle should have the inlined the client runtime', (done) => {
    req
      .get('/client.js')
      .expect('Content-Type', 'application/javascript; charset=UTF-8')
      .expect(200)
      .end((err, res) => {
        if (err) {
          return done(err);
        }
        expect(res.text).toContain('Hello from the client');
        expect(res.text).toContain('webpack-dev-server/client');
        done();
      });
  });

  it('server bundle should NOT have the inlined the client runtime', (done) => {
    // we wouldn't normally request a server bundle
    // but we'll do it here to check the contents
    req
      .get('/server.js')
      .expect('Content-Type', 'application/javascript; charset=UTF-8')
      .expect(200)
      .end((err, res) => {
        if (err) {
          return done(err);
        }
        expect(res.text).toContain('Hello from the server');
        expect(res.text).not.toContain('webpack-dev-server/client');
        done();
      });
  });
});
