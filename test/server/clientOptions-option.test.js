'use strict';

const request = require('supertest');
const config = require('../fixtures/simple-config/webpack.config');
const testServer = require('../helpers/test-server');
const port = require('../ports-map')['client-option'];

describe('client option', () => {
  let server;
  let req;

  afterEach((done) => {
    testServer.close(done);
    req = null;
    server = null;
  });

  describe('default behavior', () => {
    beforeEach((done) => {
      server = testServer.start(
        config,
        {
          transportMode: 'sockjs',
          port,
        },
        done
      );
      req = request(`http://localhost:${port}`);
    });

    it('defaults to a path', () => {
      expect(
        server.options.client.path.match(/\/[a-z0-9\-/]+[^/]$/)
      ).toBeTruthy();
    });

    it('overlay true by default', () => {
      expect(server.options.client.overlay).toBe(true);
    });

    it('responds with a 200', (done) => {
      req.get('/ws').expect(200, done);
    });
  });

  describe('path option', () => {
    const path = '/foo/test/bar';

    beforeEach((done) => {
      server = testServer.start(
        config,
        {
          transportMode: 'sockjs',
          client: {
            path: '/foo/test/bar/',
          },
          port,
        },
        done
      );
      req = request(`http://localhost:${port}`);
    });

    it('sets the sock path correctly and strips leading and trailing /s', () => {
      expect(server.options.client.path).toEqual(path);
    });

    it('responds with a 200 second', (done) => {
      req.get(path).expect(200, done);
    });
  });

  describe('configure client entry', () => {
    it('disables client entry', (done) => {
      server = testServer.start(
        config,
        {
          client: {
            needClientEntry: false,
          },
          port,
        },
        () => {
          request(server.app)
            .get('/main.js')
            .then((res) => {
              expect(res.text).not.toMatch(/client\/index\.js/);
            })
            .then(done, done);
        }
      );
    });

    it('disables hot entry', (done) => {
      server = testServer.start(
        config,
        {
          client: {
            needHotEntry: false,
          },
          port,
        },
        () => {
          request(server.app)
            .get('/main.js')
            .then((res) => {
              expect(res.text).not.toMatch(/webpack\/hot\/dev-server\.js/);
            })
            .then(done, done);
        }
      );
    });
  });
});
