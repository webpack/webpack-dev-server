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
        before: (app, server, compiler) => {
          if (!app) {
            throw new Error('app is not defined');
          }

          if (!server) {
            throw new Error('server is not defined');
          }

          if (!compiler) {
            throw new Error('compiler is not defined');
          }

          app.get('/before/some/path', (req, res) => {
            res.send('before');
          });
        },
        after: (app, server, compiler) => {
          if (!app) {
            throw new Error('app is not defined');
          }

          if (!server) {
            throw new Error('server is not defined');
          }

          if (!compiler) {
            throw new Error('compiler is not defined');
          }

          app.get('/after/some/path', (req, res) => {
            res.send('after');
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
