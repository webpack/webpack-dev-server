'use strict';

const http = require('http');
const express = require('express');
const SockJS = require('sockjs-client/dist/sockjs');
const SockJSServer = require('../../../lib/servers/SockJSServer');
const port = require('../../ports-map').SockJSServer;

describe('SockJSServer', () => {
  let socketServer;
  let listeningApp;

  beforeEach((done) => {
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

      const client = new SockJS(`http://localhost:${port}/sockjs-node`);

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
      const client = new SockJS(`http://localhost:${port}/sockjs-node`);

      setTimeout(() => {
        // the client closes itself, the server does not close it
        client.close();
      }, 1000);

      setTimeout(() => {
        expect(receivedClientClose).toBeTruthy();
        done();
      }, 3000);
    });

    it('should not throw an exception when connection is null', () => {
      const cb = jest.fn();

      socketServer.onConnection(cb);

      expect(() => {
        socketServer.socket.emit('connection', null);
      }).not.toThrow();
      expect(cb.mock.calls[0]).toEqual([null, null]);
    });
  });

  afterEach((done) => {
    listeningApp.close(done);
  });
});
