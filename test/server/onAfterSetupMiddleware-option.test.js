'use strict';

const request = require('supertest');
const testServer = require('../helpers/test-server');
const config = require('../fixtures/simple-config/webpack.config');
const port = require('../ports-map')['onAfterSetupMiddleware-option'];

describe('onAfterSetupMiddleware option', () => {
  let server;
  let req;

  beforeAll((done) => {
    server = testServer.start(
      config,
      {
        onAfterSetupMiddleware: ({ app, compiler }) => {
          if (!app) {
            throw new Error('app is not defined');
          }

          if (!compiler) {
            throw new Error('compiler is not defined');
          }

          app.get('/after/some/path', (_, response) => {
            response.send('after');
          });

          app.post('/after/some/path', (_, response) => {
            response.send('after POST');
          });
        },
        port,
      },
      done
    );
    req = request(server.app);
  });

  afterAll(testServer.close);

  it('should handle after route', () => {
    return req
      .get('/after/some/path')
      .expect('Content-Type', 'text/html; charset=utf-8')
      .expect(200)
      .then((response) => {
        expect(response.text).toBe('after');
      });
  });

  it('should handle POST requests to after route', () => {
    return req
      .post('/after/some/path')
      .expect('Content-Type', 'text/html; charset=utf-8')
      .expect(200)
      .then((response) => {
        expect(response.text).toBe('after POST');
      });
  });
});
