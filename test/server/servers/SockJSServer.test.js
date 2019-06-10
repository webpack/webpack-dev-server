'use strict';

const http = require('http');
const express = require('express');
const SockJS = require('sockjs-client/dist/sockjs');
const SockJSServer = require('../../../lib/servers/SockJSServer');
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
    it('should recieve connection, send message, and close client', (done) => {
      const data = [];

      socketServer.onConnection((connection) => {
        data.push('open');
        socketServer.send(connection, 'hello world');
        setTimeout(() => {
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
        expect(data.length).toEqual(3);
        expect(data[0]).toEqual('open');
        expect(data[1]).toEqual('hello world');
        expect(data[2]).toEqual('close');
        done();
      }, 3000);
    });
  });

  afterAll((done) => {
    listeningApp.close(done);
  });
});
