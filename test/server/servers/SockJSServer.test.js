'use strict';

const http = require('http');
const express = require('express');
const SockJS = require('sockjs-client/dist/sockjs');
const SockJSServer = require('../../../lib/servers/SockJSServer');
const timer = require('../../helpers/timer');
const port = require('../../ports-map').SockJSServer;

describe('SockJSServer', () => {
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
        sockPath: '/sockjs-node',
        listeningApp,
      };

      socketServer = new SockJSServer(server);

      done();
    });
  });

  describe('server', () => {
    it('should recieve connection, send message, and close client', async () => {
      const data = [];
      let headers;

      socketServer.onConnection(async (connection) => {
        data.push('open');
        socketServer.send(connection, 'hello world');

        await timer(1000);

        // the server closes the connection with the client
        socketServer.close(connection);
      });

      const client = new SockJS(`http://localhost:${port}/sockjs-node`);

      client.onmessage = (e) => {
        data.push(e.data);
      };

      client.onclose = () => {
        data.push('close');
      };

      await timer(3000);

      expect(headers.host).toMatchSnapshot();
      expect(data).toMatchSnapshot();
    });

    it('should receive client close event', async () => {
      let receivedClientClose = false;
      socketServer.onConnection((connection) => {
        socketServer.onConnectionClose(connection, () => {
          receivedClientClose = true;
        });
      });

      // eslint-disable-next-line new-cap
      const client = new SockJS(`http://localhost:${port}/sockjs-node`);

      await timer(1000);

      // the client closes itself, the server does not close it
      client.close();

      await timer(3000);

      expect(receivedClientClose).toBeTruthy();
    });
  });

  afterAll((done) => {
    listeningApp.close(done);
  });
});
