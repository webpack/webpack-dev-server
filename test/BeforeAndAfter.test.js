'use strict';

const request = require('supertest');
const helper = require('./helper');
const config = require('./fixtures/simple-config/webpack.config');

describe('Before And After options', () => {
  let server;
  let req;

  beforeAll((done) => {
    server = helper.start(
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
        after: (appArg, serverArg, compilerArg) => {
          if (!appArg) {
            throw new Error('app is not defined');
          }

          if (!serverArg) {
            throw new Error('server is not defined');
          }

          if (!compilerArg) {
            throw new Error('compiler is not defined');
          }

          appArg.get('/after/some/path', (_, response) => {
            response.send('after');
          });
        },
      },
      done
    );
    req = request(server.app);
  });

  afterAll(helper.close);

  it('should handle before route', () => {
    return req
      .get('/before/some/path')
      .expect('Content-Type', 'text/html; charset=utf-8')
      .expect(200)
      .then((response) => {
        expect(response.text).toBe('before');
      });
  });

  it('should handle after route', () => {
    return req
      .get('/after/some/path')
      .expect('Content-Type', 'text/html; charset=utf-8')
      .expect(200)
      .then((response) => {
        expect(response.text).toBe('after');
      });
  });
});
