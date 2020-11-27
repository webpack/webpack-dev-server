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

    it('should handles GET request to sockjs bundle', (done) => {
      req.get('/__webpack_dev_server__/sockjs.bundle.js').then(({ res }) => {
        expect(res.headers['content-type']).toEqual('application/javascript');
        expect(res.statusCode).toEqual(200);
        done();
      });
    });

    it('should handle HEAD request to sockjs bundle', (done) => {
      req.head('/__webpack_dev_server__/sockjs.bundle.js').then(({ res }) => {
        expect(res.headers['content-type']).toEqual('application/javascript');
        expect(res.statusCode).toEqual(200);
        done();
      });
    });

    it('should handle GET request to inline bundle', (done) => {
      req.get('/webpack-dev-server.js').then(({ res }) => {
        expect(res.headers['content-type']).toEqual('application/javascript');
        expect(res.statusCode).toEqual(200);
        done();
      });
    });

    it('should handle HEAD request to inline bundle', (done) => {
      req.head('/webpack-dev-server.js').then(({ res }) => {
        expect(res.headers['content-type']).toEqual('application/javascript');
        expect(res.statusCode).toEqual(200);
        done();
      });
    });

    it('should handle GET request to invalidate endpoint', (done) => {
      req.get('/webpack-dev-server/invalidate').then(({ res }) => {
        expect(res.headers['content-type']).not.toEqual('text/html');
        expect(res.statusCode).toEqual(200);
        done();
      });
    });

    it('should handle GET request to live html', (done) => {
      req.get('/webpack-dev-server/').then(({ res }) => {
        expect(res.headers['content-type']).toEqual('text/html');
        expect(res.statusCode).toEqual(200);
        done();
      });
    });

    it('should handle HEAD request to live html', (done) => {
      req.head('/webpack-dev-server/').then(({ res }) => {
        expect(res.headers['content-type']).toEqual('text/html');
        expect(res.statusCode).toEqual(200);
        done();
      });
    });

    it('should handle GET request to directory index', (done) => {
      req.get('/webpack-dev-server').then(({ res }) => {
        expect(res.headers['content-type']).toEqual('text/html');
        expect(res.statusCode).toEqual(200);
        expect(res.text).toMatchSnapshot();
        done();
      });
    });

    it('should handle HEAD request to directory index', (done) => {
      req.head('/webpack-dev-server').then(({ res }) => {
        expect(res.headers['content-type']).toEqual('text/html');
        expect(res.statusCode).toEqual(200);
        done();
      });
    });

    it('should handle GET request to magic html', (done) => {
      req.get('/main').then(({ res }) => {
        expect(res.statusCode).toEqual(200);
        done();
      });
    });

    it('should handle HEAD request to magic html', (done) => {
      req.head('/main').then(({ res }) => {
        expect(res.statusCode).toEqual(200);
        done();
      });
    });

    it('should handle GET request to main chunk', (done) => {
      req.get('/main.js').then(({ res }) => {
        expect(res.statusCode).toEqual(200);
        done();
      });
    });

    it('should handle HEAD request to main chunk', (done) => {
      req.head('/main.js').then(({ res }) => {
        expect(res.statusCode).toEqual(200);
        done();
      });
    });
  });

  describe('multi config', () => {
    beforeAll((done) => {
      server = testServer.startAwaitingCompilation(multiConfig, { port }, done);
      req = request(server.app);
    });

    afterAll(testServer.close);

    it('should handle GET request to directory index and list all middleware directories', (done) => {
      req.get('/webpack-dev-server').then(({ res }) => {
        expect(res.headers['content-type']).toEqual('text/html');
        expect(res.statusCode).toEqual(200);
        expect(res.text).toMatchSnapshot();
        done();
      });
    });
  });
});
