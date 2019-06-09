'use strict';

const request = require('supertest');
const testServer = require('../helpers/test-server');
const config = require('../fixtures/simple-config/webpack.config');
const port = require('../ports-map')['before-option'];

describe('before option', () => {
  let server;
  let req;

  beforeAll((done) => {
    server = testServer.start(
      config,
      {
        before: (appArg, serverArg, compilerArg) => {
          if (!appArg) {
            throw new Error('app is not defined');
          }

          if (!serverArg) {
            throw new Error('server is not defined');
          }

          if (!compilerArg) {
            throw new Error('compiler is not defined');
          }

          appArg.get('/before/some/path', (_, response) => {
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

  it('should handle before route', async () => {
    const res = await req
      .get('/before/some/path')
      .expect('Content-Type', 'text/html; charset=utf-8')
      .expect(200);

    expect(res.text).toBe('before');
  });
});
