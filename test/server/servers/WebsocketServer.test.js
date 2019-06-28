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

      let headers;
      socketServer.onConnection((connection, h) => {
        headers = h;
        data.push('open');
        socketServer.send(connection, 'hello world');
        setTimeout(() => {
          // the server closes the connection with the client
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
        expect(headers.host).toMatchSnapshot();
        expect(data).toMatchSnapshot();
        done();
      }, 3000);
    });

    it('should receive client close event', (done) => {
      let receivedClientClose = false;
      socketServer.onConnection((connection) => {
        socketServer.onConnectionClose(connection, () => {
          receivedClientClose = true;
        });
      });

      // eslint-disable-next-line new-cap
      const client = new ws(`http://localhost:${port}/ws-server`);

      setTimeout(() => {
        // the client closes itself, the server does not close it
        client.close();
      }, 1000);

      setTimeout(() => {
        expect(receivedClientClose).toBeTruthy();
        done();
      }, 3000);
    });
  });

  afterAll((done) => {
    listeningApp.close(done);
  });
});
