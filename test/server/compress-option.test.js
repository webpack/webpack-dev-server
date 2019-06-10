// For whatever reason, this test is now causing hangs. It's not really needed,
// as the middleware it uses for the feature already has tests, so we're
// throwing it into a fire.
//

'use strict';

const request = require('supertest');
const testServer = require('../helpers/test-server');
const config = require('../fixtures/simple-config-other/webpack.config');
const port = require('../ports-map')['compress-option'];

describe('compress option', () => {
  let server;
  let req;

  describe('not specify', () => {
    beforeAll((done) => {
      server = testServer.start(config, { port }, done);
      req = request(server.app);
    });

    afterAll(testServer.close);

    it('request to bundle file', async () => {
      await req
        .get('/main.js')
        .expect((res) => {
          if (res.header['content-encoding']) {
            throw new Error('Expected `content-encoding` header is undefined.');
          }
        })
        .expect(200);
    });
  });

  describe('as a true', () => {
    beforeAll((done) => {
      server = testServer.start(
        config,
        {
          compress: true,
          port,
        },
        done
      );
      req = request(server.app);
    });

    afterAll(testServer.close);

    it('request to bundle file', async () => {
      await req
        .get('/main.js')
        .expect('Content-Encoding', 'gzip')
        .expect(200);
    });
  });

  describe('as a false', () => {
    beforeAll((done) => {
      server = testServer.start(
        config,
        {
          compress: false,
          port,
        },
        done
      );
      req = request(server.app);
    });

    afterAll(testServer.close);

    it('request to bundle file', async () => {
      await req
        .get('/main.js')
        .expect((res) => {
          if (res.header['content-encoding']) {
            throw new Error('Expected `content-encoding` header is undefined.');
          }
        })
        .expect(200);
    });
  });
});
