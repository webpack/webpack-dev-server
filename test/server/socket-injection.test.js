'use strict';

/* eslint-disable
  no-unused-vars
*/

const request = require('supertest');
const testServer = require('../helpers/test-server');
const port = require('../ports-map').WebsocketClient;
const config = require('../fixtures/client-config/webpack.config');

describe('websocket client injection', () => {
  let req;
  let server;

  describe('testing when liveReload enabled (default)', () => {
    beforeAll((done) => {
      const options = {
        port,
        liveReload: true,
      };
      server = testServer.start(config, options, done);
      req = request(`http://localhost:${port}`);
    });

    afterAll(testServer.close);

    it('should be injected', (done) => {
      req
        .get('/sockjs-node/info')
        .expect(200)
        .then(({ res }) => {
          expect(JSON.parse(res.text).websocket).toBe(true);
          done();
        });
    });
  });
  describe('testing when hot enabled', () => {
    beforeAll((done) => {
      const options = {
        port,
        hot: true,
      };
      server = testServer.start(config, options, done);
      req = request(`http://localhost:${port}`);
    });

    afterAll(testServer.close);

    it('should be injected', (done) => {
      req
        .get('/sockjs-node/info')
        .expect(200)
        .then(({ res }) => {
          expect(JSON.parse(res.text).websocket).toBe(true);
          done();
        });
    });
  });
  describe('testing when hot enabled and liveReload disabled', () => {
    beforeAll((done) => {
      const options = {
        port,
        hot: true,
        liveReload: false,
      };
      server = testServer.start(config, options, done);
      req = request(`http://localhost:${port}`);
    });

    afterAll(testServer.close);

    it('should be injected', (done) => {
      req
        .get('/sockjs-node/info')
        .expect(200)
        .then(({ res }) => {
          expect(JSON.parse(res.text).websocket).toBe(true);
          done();
        });
    });
  });
  describe('testing when hot & liveReload disabled', () => {
    beforeAll((done) => {
      const options = {
        port,
        hot: false,
        liveReload: false,
      };
      server = testServer.start(config, options, done);
      req = request(`http://localhost:${port}`);
    });

    afterAll(testServer.close);

    it('should not be injected', (done) => {
      req
        .get('/sockjs-node/info')
        .expect(404)
        .then(({ res }) => {
          expect(res.text.includes('Cannot GET /sockjs-node/info')).toBe(true);
          done();
        });
    });
  });
});
