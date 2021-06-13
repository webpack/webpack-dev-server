'use strict';

/* eslint-disable
  no-unused-vars
*/

const request = require('supertest');
const testServer = require('../helpers/test-server');
const port = require('../ports-map').SocketInjection;
const config = require('../fixtures/client-config/webpack.config');

// TODO
// test on error  const errorMsg = `WebSocket connection to 'ws://localhost:${port}/ws' failed: Error during WebSocket handshake: Unexpected response code: 404`;

describe('sockjs websocket client injection', () => {
  let req;
  let server;

  describe('testing default settings', () => {
    beforeAll((done) => {
      const options = {
        port,
        webSocketServer: 'sockjs',
      };
      server = testServer.start(config, options, done);
      req = request(`http://localhost:${port}`);
    });

    afterAll(testServer.close);

    it('should be injected', (done) => {
      req.get('/ws').expect(200, 'Welcome to SockJS!\n', done);
    });
  });

  describe('testing when liveReload is enabled', () => {
    beforeAll((done) => {
      const options = {
        port,
        liveReload: true,
        webSocketServer: 'sockjs',
      };
      server = testServer.start(config, options, done);
      req = request(`http://localhost:${port}`);
    });

    afterAll(testServer.close);

    it('should be injected', (done) => {
      req.get('/ws').expect(200, 'Welcome to SockJS!\n', done);
    });
  });

  describe('testing when liveReload is disabled', () => {
    beforeAll((done) => {
      const options = {
        port,
        liveReload: false,
        webSocketServer: 'sockjs',
      };
      server = testServer.start(config, options, done);
      req = request(`http://localhost:${port}`);
    });

    afterAll(testServer.close);

    it('should be injected', (done) => {
      req.get('/ws').expect(200, 'Welcome to SockJS!\n', done);
    });
  });

  describe('testing when hot is enabled', () => {
    beforeAll((done) => {
      const options = {
        port,
        hot: true,
        webSocketServer: 'sockjs',
      };
      server = testServer.start(config, options, done);
      req = request(`http://localhost:${port}`);
    });

    afterAll(testServer.close);

    it('should be injected', (done) => {
      req.get('/ws').expect(200, 'Welcome to SockJS!\n', done);
    });
  });

  describe('testing when hot is enabled and liveReload is disabled', () => {
    beforeAll((done) => {
      const options = {
        port,
        hot: true,
        liveReload: false,
        webSocketServer: 'sockjs',
      };
      server = testServer.start(config, options, done);
      req = request(`http://localhost:${port}`);
    });

    afterAll(testServer.close);

    it('should be injected', (done) => {
      req.get('/ws').expect(200, 'Welcome to SockJS!\n', done);
    });
  });

  describe('testing when hot is disabled and liveReload is enabled', () => {
    beforeAll((done) => {
      const options = {
        port,
        hot: false,
        liveReload: true,
        webSocketServer: 'sockjs',
      };
      server = testServer.start(config, options, done);
      req = request(`http://localhost:${port}`);
    });

    afterAll(testServer.close);

    it('should be injected', (done) => {
      req.get('/ws').expect(200, 'Welcome to SockJS!\n', done);
    });
  });

  describe('testing when hot and liveReload are disabled', () => {
    beforeAll((done) => {
      const options = {
        port,
        hot: false,
        liveReload: false,
        webSocketServer: 'sockjs',
      };
      server = testServer.start(config, options, done);
      req = request(`http://localhost:${port}`);
    });

    afterAll(testServer.close);

    it('should not be injected', (done) => {
      req
        .get('/ws')
        .expect(404)
        .then(({ res }) => {
          expect(res.text.includes('Cannot GET /ws')).toBe(true);
          done();
        });
    });
  });
});
