'use strict';

const http = require('http');
const express = require('express');
const sockjs = require('sockjs');
const SockJSClient = require('../../../client-src/clients/SockJSClient');
const timer = require('../../helpers/timer');
const port = require('../../ports-map').sockJSClient;

describe('SockJSClient', () => {
  let socketServer;
  let listeningApp;

  beforeAll((done) => {
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

  describe('client', () => {
    it('should open, receive message, and close', async () => {
      socketServer.on('connection', async (connection) => {
        connection.write('hello world');

        await timer(1000);
        connection.close();
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
