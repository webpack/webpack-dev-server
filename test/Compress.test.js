// For whatever reason, this test is now causing hangs. It's not really needed,
// as the middleware it uses for the feature already has tests, so we're
// throwing it into a fire.
//

'use strict';

const request = require('supertest');
const testServer = require('./helpers/test-server');
const config = require('./fixtures/simple-config-other/webpack.config');

describe('Compress', () => {
  let server;
  let req;

  describe('undefined', () => {
    beforeAll((done) => {
      server = testServer.start(config, {}, done);
      req = request(server.app);
    });

    afterAll(testServer.close);

    it('request to bundle file', (done) => {
      req
        .get('/main.js')
        .expect((res) => {
          if (res.header['content-encoding']) {
            throw new Error('Expected `content-encoding` header is undefined.');
          }
        })
        .expect(200, done);
    });
  });

  describe('true', () => {
    beforeAll((done) => {
      server = testServer.start(
        config,
        {
          compress: true,
        },
        done
      );
      req = request(server.app);
    });

    afterAll(testServer.close);

    it('request to bundle file', (done) => {
      req
        .get('/main.js')
        .expect('Content-Encoding', 'gzip')
        .expect(200, done);
    });
  });

  describe('false', () => {
    beforeAll((done) => {
      server = testServer.start(
        config,
        {
          compress: false,
        },
        done
      );
      req = request(server.app);
    });

    afterAll(testServer.close);

    it('request to bundle file', (done) => {
      req
        .get('/main.js')
        .expect((res) => {
          if (res.header['content-encoding']) {
            throw new Error('Expected `content-encoding` header is undefined.');
          }
        })
        .expect(200, done);
    });
  });
});
