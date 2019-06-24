'use strict';

const http = require('http');
const express = require('express');
const ws = require('ws');
const WebsocketServer = require('../../../lib/servers/WebsocketServer');
const port = require('../../ports-map').WebsocketServer;

describe('WebsocketServer', () => {
  let socketServer;
  let listeningApp;

  beforeAll((done) => {
    // eslint-disable-next-line new-cap
    const app = new express();

    listeningApp = http.createServer(app);
    listeningApp.listen(port, 'localhost', () => {
      const server = {
        log: {
          error: () => {},
          debug: () => {},
        },
        sockPath: '/ws-server',
        listeningApp,
      };

      socketServer = new WebsocketServer(server);

      done();
    });
  });

  describe('server', () => {
    it('should recieve connection, send message, and close client', (done) => {
      const data = [];

      socketServer.onConnection((connection) => {
        data.push('open');
        socketServer.send(connection, 'hello world');
        setTimeout(() => {
          socketServer.close(connection);
        }, 1000);
      });

      // eslint-disable-next-line new-cap
      const client = new ws(`http://localhost:${port}/ws-server`);

      client.onmessage = (e) => {
        data.push(e.data);
      };

      client.onclose = () => {
        data.push('close');
      };

      setTimeout(() => {
        expect(data).toMatchSnapshot();
        done();
      }, 3000);
    });
  });

  afterAll((done) => {
    listeningApp.close(done);
  });
});
