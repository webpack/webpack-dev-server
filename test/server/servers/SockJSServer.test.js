'use strict';

const http = require('http');
const express = require('express');
const SockJS = require('sockjs-client/dist/sockjs');
const SockJSServer = require('../../../lib/servers/SockJSServer');
const timer = require('../../helpers/timer');

describe('SockJSServer', () => {
  let socketServer;
  let listeningApp;

  beforeAll((done) => {
    // eslint-disable-next-line new-cap
    const app = new express();

    listeningApp = http.createServer(app);
    listeningApp.listen(8080, 'localhost', () => {
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

      socketServer.onConnection(async (connection) => {
        data.push('open');
        socketServer.send(connection, 'hello world');

        await timer(1000);

        socketServer.close(connection);
      });

      const client = new SockJS('http://localhost:8080/sockjs-node');

      client.onmessage = (e) => {
        data.push(e.data);
      };

      client.onclose = () => {
        data.push('close');
      };

      await timer(3000);

      expect(data.length).toEqual(3);
      expect(data[0]).toEqual('open');
      expect(data[1]).toEqual('hello world');
      expect(data[2]).toEqual('close');
    });
  });

  afterAll((done) => {
    listeningApp.close(done);
  });
});
