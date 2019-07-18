'use strict';

/* eslint-disable
  no-unused-vars
*/
const http = require('http');
const request = require('supertest');
const express = require('express');
const ws = require('ws');
const WebsocketClient = require('../../../client-src/clients/WebsocketClient');
const port = require('../../ports-map').WebsocketClient;
const testServer = require('../../helpers/test-server');
const config = require('../../fixtures/client-config/webpack.config');

describe('WebsocketClient', () => {
  let socketServer;
  let listeningApp;

  beforeAll((done) => {
    // eslint-disable-next-line new-cap
    const app = new express();

    listeningApp = http.createServer(app);
    listeningApp.listen(port, 'localhost', () => {
      socketServer = new ws.Server({
        server: listeningApp,
        path: '/ws-server',
      });
      done();
    });
  });

  describe('client', () => {
    it('should open, receive message, and close', (done) => {
      socketServer.on('connection', (connection) => {
        connection.send('hello world');

        setTimeout(() => {
          connection.close();
        }, 1000);
      });

      const client = new WebsocketClient(`http://localhost:${port}/ws-server`);
      const data = [];

      client.onOpen(() => {
        data.push('open');
      });
      client.onClose(() => {
        data.push('close');
      });
      client.onMessage((msg) => {
        data.push(msg);
      });

      setTimeout(() => {
        expect(data).toMatchSnapshot();
        done();
      }, 3000);
    });
  });

  afterAll((done) => {
    listeningApp.close(() => {
      done();
    });
  });
});

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
