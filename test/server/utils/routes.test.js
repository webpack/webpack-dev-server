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

  it('should handles GET request to live bundle', async () => {
    const { headers, statusCode } = await req.get(
      '/__webpack_dev_server__/live.bundle.js'
    );

    expect(headers['content-type']).toEqual('application/javascript');
    expect(statusCode).toEqual(200);
  });

  it('should handles HEAD request to live bundle', async () => {
    const { headers, statusCode } = await req.head(
      '/__webpack_dev_server__/live.bundle.js'
    );

    expect(headers['content-type']).toEqual('application/javascript');
    expect(statusCode).toEqual(200);
  });

  it('should handles GET request to sockjs bundle', async () => {
    const { headers, statusCode } = await req.get(
      '/__webpack_dev_server__/sockjs.bundle.js'
    );

    expect(headers['content-type']).toEqual('application/javascript');
    expect(statusCode).toEqual(200);
  });

  it('should handles HEAD request to sockjs bundle', async () => {
    const { headers, statusCode } = await req.head(
      '/__webpack_dev_server__/sockjs.bundle.js'
    );

    expect(headers['content-type']).toEqual('application/javascript');
    expect(statusCode).toEqual(200);
  });

  it('should handles GET request to inline bundle', async () => {
    const { headers, statusCode } = await req.get('/webpack-dev-server.js');

    expect(headers['content-type']).toEqual('application/javascript');
    expect(statusCode).toEqual(200);
  });

  it('should handles HEAD request to inline bundle', async () => {
    const { headers, statusCode } = await req.head('/webpack-dev-server.js');

    expect(headers['content-type']).toEqual('application/javascript');
    expect(statusCode).toEqual(200);
  });

  it('should handles GET request to live html', async () => {
    const { headers, statusCode } = await req.get('/webpack-dev-server/');

    expect(headers['content-type']).toEqual('text/html');
    expect(statusCode).toEqual(200);
  });

  it('should handles HEAD request to live html', async () => {
    const { headers, statusCode } = await req.head('/webpack-dev-server/');

    expect(headers['content-type']).toEqual('text/html');
    expect(statusCode).toEqual(200);
  });

  it('should handles GET request to directory index', async () => {
    const { headers, statusCode } = await req.get('/webpack-dev-server');

    expect(headers['content-type']).toEqual('text/html');
    expect(statusCode).toEqual(200);
  });

  it('should handles HEAD request to directory index', async () => {
    const { headers, statusCode } = await req.head('/webpack-dev-server');

    expect(headers['content-type']).toEqual('text/html');
    expect(statusCode).toEqual(200);
  });

  it('should handles GET request to magic html', async () => {
    const { statusCode } = await req.get('/main');

    expect(statusCode).toEqual(200);
  });

  it('should handles HEAD request to magic html', async () => {
    const { statusCode } = await req.head('/main');

    expect(statusCode).toEqual(200);
  });

  it('should handles GET request to main chunk', async () => {
    const { statusCode } = await req.get('/main.js');

    expect(statusCode).toEqual(200);
  });

  it('should handles HEAD request to main chunk', async () => {
    const { statusCode } = await req.head('/main.js');

    expect(statusCode).toEqual(200);
  });
});
