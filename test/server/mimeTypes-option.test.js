'use strict';

const request = require('supertest');
const testServer = require('../helpers/test-server');
const config = require('../fixtures/mime-types-config/webpack.config');
const port = require('../ports-map')['mine-types-option'];

describe('mimeTypes option', () => {
  describe('as an object with a remapped type', () => {
    let server;
    let req;

    beforeAll((done) => {
      server = testServer.start(
        config,
        {
          devMiddleware: {
            mimeTypes: {
              js: 'application/octet-stream',
            },
          },
          port,
        },
        done
      );
      req = request(server.app);
    });

    afterAll(testServer.close);

    it('requests file with different js mime type', async () => {
      const res = await req.get('/main.js');
      expect(res.status).toEqual(200);
      expect(res.headers['content-type']).toEqual('application/octet-stream');
    });
  });

  describe('as an object with a custom type', () => {
    let server;
    let req;

    beforeAll((done) => {
      server = testServer.start(
        config,
        {
          devMiddleware: {
            mimeTypes: {
              custom: 'text/html',
            },
          },
          port,
        },
        done
      );
      req = request(server.app);
    });

    afterAll(testServer.close);

    it('requests file with custom mime type', async () => {
      const res = await req.get('/file.custom');
      expect(res.status).toEqual(200);
      expect(res.headers['content-type']).toEqual('text/html; charset=utf-8');
    });
  });
});
