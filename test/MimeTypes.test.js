'use strict';

const request = require('supertest');
const testServer = require('./helpers/test-server');
const config = require('./fixtures/simple-config/webpack.config');

describe('MimeTypes configuration', () => {
  afterEach(testServer.close);

  it('remapping mime type without force should throw an error', () => {
    expect(() => {
      testServer.start(config, {
        mimeTypes: { 'application/octet-stream': ['js'] },
      });
    }).toThrow(/Attempt to change mapping for/);
  });

  it('remapping mime type with force should not throw an error', (done) => {
    testServer.start(
      config,
      {
        mimeTypes: {
          typeMap: { 'application/octet-stream': ['js'] },
          force: true,
        },
      },
      done
    );
  });
});

describe('custom mimeTypes', () => {
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
      },
      done
    );
    req = request(server.app);
  });

  afterAll(testServer.close);

  it('request to bundle file with modified mime type', (done) => {
    req
      .get('/main.js')
      .expect('Content-Type', /application\/octet-stream/)
      .expect(200, done);
  });
});
