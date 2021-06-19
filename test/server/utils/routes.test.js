'use strict';

const request = require('supertest');
const testServer = require('../../helpers/test-server');
const config = require('../../fixtures/simple-config/webpack.config');
const multiConfig = require('../../fixtures/multi-public-path-config/webpack.config');
const port = require('../../ports-map').routes;

describe('routes util', () => {
  let server;
  let req;

  describe('simple config', () => {
    beforeAll((done) => {
      server = testServer.startAwaitingCompilation(config, { port }, done);
      req = request(server.app);
    });

    afterAll(testServer.close);

    it('should handles GET request to sockjs bundle', async () => {
      const res = await req.get('/__webpack_dev_server__/sockjs.bundle.js');
      expect(res.headers['content-type']).toEqual('application/javascript');
      expect(res.statusCode).toEqual(200);
    });

    it('should handle HEAD request to sockjs bundle', async () => {
      const res = await req.head('/__webpack_dev_server__/sockjs.bundle.js');
      expect(res.headers['content-type']).toEqual('application/javascript');
      expect(res.statusCode).toEqual(200);
    });

    it('should handle GET request to invalidate endpoint', async () => {
      const res = await req.get('/webpack-dev-server/invalidate');
      expect(res.headers['content-type']).not.toEqual('text/html');
      expect(res.statusCode).toEqual(200);
    });

    it('should handle GET request to live html', async () => {
      const res = await req.get('/webpack-dev-server/');
      expect(res.headers['content-type']).toEqual('text/html');
      expect(res.statusCode).toEqual(200);
    });

    it('should handle HEAD request to live html', async () => {
      const res = await req.head('/webpack-dev-server/');
      expect(res.headers['content-type']).toEqual('text/html');
      expect(res.statusCode).toEqual(200);
    });

    it('should handle GET request to directory index', async () => {
      const res = await req.get('/webpack-dev-server');
      expect(res.headers['content-type']).toEqual('text/html');
      expect(res.statusCode).toEqual(200);
      expect(res.text).toMatchSnapshot();
    });

    it('should handle HEAD request to directory index', async () => {
      const res = await req.head('/webpack-dev-server');
      expect(res.headers['content-type']).toEqual('text/html');
      expect(res.statusCode).toEqual(200);
    });

    it('should handle GET request to magic async html', async () => {
      const res = await req.get('/main');
      expect(res.statusCode).toEqual(200);
    });

    it('should handle HEAD request to magic async html', async () => {
      const res = await req.head('/main');
      expect(res.statusCode).toEqual(200);
    });

    it('should handle GET request to main async chunk', async () => {
      const res = await req.get('/main.js');
      expect(res.statusCode).toEqual(200);
    });

    it('should handle HEAD request to main async chunk', async () => {
      const res = await req.head('/main.js');
      expect(res.statusCode).toEqual(200);
    });
  });

  describe('multi config', () => {
    beforeAll((done) => {
      server = testServer.startAwaitingCompilation(multiConfig, { port }, done);
      req = request(server.app);
    });

    afterAll(testServer.close);

    it('should handle GET request to directory index and list all middleware directories', async () => {
      const res = await req.get('/webpack-dev-server');
      expect(res.headers['content-type']).toEqual('text/html');
      expect(res.statusCode).toEqual(200);
      expect(res.text).toMatchSnapshot();
    });
  });
});
