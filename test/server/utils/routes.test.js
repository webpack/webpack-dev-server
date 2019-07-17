'use strict';

const request = require('supertest');
const testServer = require('../../helpers/test-server');
const config = require('../../fixtures/simple-config/webpack.config');
const port = require('../../ports-map').routes;

describe('routes util', () => {
  let server;
  let req;

  beforeAll((done) => {
    server = testServer.startAwaitingCompilation(config, { port }, done);
    req = request(server.app);
  });

  afterAll(testServer.close);

  it('should handles GET request to live bundle', (done) => {
    req.get('/__webpack_dev_server__/live.bundle.js').then(({ res }) => {
      expect(res.headers['content-type']).toEqual('application/javascript');
      expect(res.statusCode).toEqual(200);
      done();
    });
  });

  it('should handles HEAD request to live bundle', (done) => {
    req.head('/__webpack_dev_server__/live.bundle.js').then(({ res }) => {
      expect(res.headers['content-type']).toEqual('application/javascript');
      expect(res.statusCode).toEqual(200);
      done();
    });
  });

  it('should handles GET request to sockjs bundle', (done) => {
    req.get('/__webpack_dev_server__/sockjs.bundle.js').then(({ res }) => {
      expect(res.headers['content-type']).toEqual('application/javascript');
      expect(res.statusCode).toEqual(200);
      done();
    });
  });

  it('should handles HEAD request to sockjs bundle', (done) => {
    req.head('/__webpack_dev_server__/sockjs.bundle.js').then(({ res }) => {
      expect(res.headers['content-type']).toEqual('application/javascript');
      expect(res.statusCode).toEqual(200);
      done();
    });
  });

  it('should handles GET request to inline bundle', (done) => {
    req.get('/webpack-dev-server.js').then(({ res }) => {
      expect(res.headers['content-type']).toEqual('application/javascript');
      expect(res.statusCode).toEqual(200);
      done();
    });
  });

  it('should handles HEAD request to inline bundle', (done) => {
    req.head('/webpack-dev-server.js').then(({ res }) => {
      expect(res.headers['content-type']).toEqual('application/javascript');
      expect(res.statusCode).toEqual(200);
      done();
    });
  });

  it('should handles GET request to live html', (done) => {
    req.get('/webpack-dev-server/').then(({ res }) => {
      expect(res.headers['content-type']).toEqual('text/html');
      expect(res.statusCode).toEqual(200);
      done();
    });
  });

  it('should handles HEAD request to live html', (done) => {
    req.head('/webpack-dev-server/').then(({ res }) => {
      expect(res.headers['content-type']).toEqual('text/html');
      expect(res.statusCode).toEqual(200);
      done();
    });
  });

  it('should handles GET request to directory index', (done) => {
    req.get('/webpack-dev-server').then(({ res }) => {
      expect(res.headers['content-type']).toEqual('text/html');
      expect(res.statusCode).toEqual(200);
      expect(res.text).toMatchSnapshot();
      done();
    });
  });

  it('should handles HEAD request to directory index', (done) => {
    req.head('/webpack-dev-server').then(({ res }) => {
      expect(res.headers['content-type']).toEqual('text/html');
      expect(res.statusCode).toEqual(200);
      done();
    });
  });

  it('should handles GET request to magic html', (done) => {
    req.get('/main').then(({ res }) => {
      expect(res.statusCode).toEqual(200);
      done();
    });
  });

  it('should handles HEAD request to magic html', (done) => {
    req.head('/main').then(({ res }) => {
      expect(res.statusCode).toEqual(200);
      done();
    });
  });

  it('should handles GET request to main chunk', (done) => {
    req.get('/main.js').then(({ res }) => {
      expect(res.statusCode).toEqual(200);
      done();
    });
  });

  it('should handles HEAD request to main chunk', (done) => {
    req.head('/main.js').then(({ res }) => {
      expect(res.statusCode).toEqual(200);
      done();
    });
  });
});
