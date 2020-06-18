'use strict';

const request = require('supertest');
const testServer = require('../../helpers/test-server');
const config = require('../../fixtures/simple-config/webpack.config');
const port = require('../../ports-map').entry;

describe('entry', () => {
  describe('bundled output', () => {
    let server;
    let req;

    beforeAll((done) => {
      server = testServer.start(config, { port }, done);
      req = request(server.app);
    });

    afterAll(testServer.close);

    it('should not include const', async () => {
      const { text } = await req
        .get('/main.js')
        .expect('Content-Type', 'application/javascript; charset=UTF-8')
        .expect(200);

      expect(text).not.toContain('const ');
    });
  });
});
