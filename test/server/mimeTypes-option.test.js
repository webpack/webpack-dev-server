'use strict';

const request = require('supertest');
const testServer = require('../helpers/test-server');
const config = require('../fixtures/simple-config/webpack.config');
const port = require('../ports-map')['mineTypes-option'];

describe('mimeTypes option', () => {
  describe('as an object', () => {
    afterEach(testServer.close);

    it('should remapping mime type without force should throw an error', () => {
      expect(() => {
        testServer.start(config, {
          mimeTypes: { 'application/octet-stream': ['js'] },
          port,
        });
      }).toThrow(/Attempt to change mapping for/);
    });

    it('should remapping mime type with force should not throw an error', (done) => {
      testServer.start(
        config,
        {
          mimeTypes: {
            typeMap: { 'application/octet-stream': ['js'] },
            force: true,
          },
          port,
        },
        done
      );
    });
  });

  describe('as an object with force option', () => {
    let server;
    let req;

    beforeAll((done) => {
      server = testServer.start(
        config,
        {
          mimeTypes: {
            typeMap: { 'application/octet-stream': ['js'] },
            force: true,
          },
          port,
        },
        done
      );
      req = request(server.app);
    });

    afterAll(testServer.close);

    it('request to bundle file with modified mime type', async () => {
      await req
        .get('/main.js')
        .expect('Content-Type', /application\/octet-stream/)
        .expect(200);
    });
  });
});
