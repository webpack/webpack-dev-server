'use strict';

const path = require('path');
const http2 = require('http2');
const request = require('supertest');
const testServer = require('../helpers/test-server');
const config = require('../fixtures/contentbase-config/webpack.config');
const port = require('../ports-map')['http2-option'];

const contentBasePublic = path.resolve(
  __dirname,
  '../fixtures/contentbase-config/public'
);

describe('http2 option', () => {
  let server;
  let req;

  describe('http2 works with https', () => {
    beforeAll((done) => {
      server = testServer.start(
        config,
        {
          static: {
            directory: contentBasePublic,
            watch: false,
          },
          https: true,
          http2: true,
          port,
        },
        done
      );
      req = request(server.app);
    });

    it('confirm http2 client can connect', (done) => {
      const client = http2.connect(`https://localhost:${port}`, {
        rejectUnauthorized: false,
      });

      client.on('error', (err) => console.error(err));

      const http2Req = client.request({ ':path': '/' });

      http2Req.on('response', (headers) => {
        expect(headers[':status']).toEqual(200);
      });

      http2Req.setEncoding('utf8');

      let data = '';

      http2Req.on('data', (chunk) => {
        data += chunk;
      });
      http2Req.on('end', () => {
        expect(data).toEqual(expect.stringMatching(/Heyo/));
        done();
      });
      http2Req.end();
    });

    afterAll(testServer.close);
  });

  describe('server works with http2 option, but without https option', () => {
    beforeAll((done) => {
      server = testServer.start(
        config,
        {
          static: {
            directory: contentBasePublic,
            watch: false,
          },
          http2: true,
          port,
        },
        done
      );
      req = request(server.app);
    });

    it('Request to index', (done) => {
      req.get('/').expect(200, /Heyo/, done);
    });

    afterAll(testServer.close);
  });

  describe('https without http2 disables HTTP/2', () => {
    beforeAll((done) => {
      server = testServer.start(
        config,
        {
          static: {
            directory: contentBasePublic,
            watch: false,
          },
          https: true,
          http2: false,
          port,
        },
        done
      );
      req = request(server.app);
    });

    it('Request to index', async () => {
      const res = await req.get('/');
      expect(res.status).toEqual(200);
      expect(res.text).toContain('Heyo');
      expect(res.res.httpVersion).not.toEqual('2.0');
    });

    afterAll(testServer.close);
  });
});
