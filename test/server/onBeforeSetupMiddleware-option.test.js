'use strict';

const request = require('supertest');
const testServer = require('../helpers/test-server');
const config = require('../fixtures/simple-config/webpack.config');
const port = require('../ports-map')['on-before-setup-middleware-option'];

describe('onBeforeSetupMiddleware option', () => {
  let server;
  let req;

  beforeAll((done) => {
    server = testServer.start(
      config,
      {
        onBeforeSetupMiddleware: ({ app, compiler }) => {
          if (!app) {
            throw new Error('app is not defined');
          }

          if (!compiler) {
            throw new Error('compiler is not defined');
          }

          app.get('/before/some/path', (_, response) => {
            response.send('before');
          });
        },
        port,
      },
      done
    );
    req = request(server.app);
  });

  afterAll(testServer.close);

  it('should handle before route', () =>
    req
      .get('/before/some/path')
      .expect('Content-Type', 'text/html; charset=utf-8')
      .expect(200)
      .then((response) => {
        expect(response.text).toBe('before');
      }));
});
