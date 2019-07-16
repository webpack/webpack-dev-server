'use strict';

const http = require('http');
const express = require('express');
const sockjs = require('sockjs');
const SockJSClient = require('../../../client-src/clients/SockJSClient');
const port = require('../../ports-map').sockJSClient;

describe('SockJSClient', () => {
  let consoleMock;
  let socketServer;
  let listeningApp;

  beforeAll((done) => {
    consoleMock = jest.spyOn(console, 'log').mockImplementation();

    // eslint-disable-next-line new-cap
    const app = new express();

    listeningApp = http.createServer(app);
    listeningApp.listen(port, 'localhost', () => {
      socketServer = sockjs.createServer();
      socketServer.installHandlers(listeningApp, {
        prefix: '/sockjs-node',
      });
      done();
    });
  });

  afterAll(() => {
    consoleMock.mockRestore();
  });

  describe('client', () => {
    it('should open, receive message, and close', (done) => {
      socketServer.on('connection', (connection) => {
        connection.write('hello world');

        setTimeout(() => {
          connection.close();
        }, 1000);
      });

      const client = new SockJSClient(`http://localhost:${port}/sockjs-node`);
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
