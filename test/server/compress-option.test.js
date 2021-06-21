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

  describe('enabled by default when not specified', () => {
    beforeAll((done) => {
      server = testServer.start(config, { port }, done);
      req = request(server.app);
    });

    afterAll(testServer.close);

    it('request to bundle file', async () => {
      const res = await req.get('/main.js');
      expect(res.headers['content-encoding']).toEqual('gzip');
      expect(res.status).toEqual(200);
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
      const res = await req.get('/main.js');
      expect(res.headers['content-encoding']).toEqual('gzip');
      expect(res.status).toEqual(200);
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
      const res = await req.get('/main.js');
      // eslint-disable-next-line no-undefined
      expect(res.headers['content-encoding']).toEqual(undefined);
      expect(res.status).toEqual(200);
    });
  });
});
