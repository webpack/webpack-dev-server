/**
 * @jest-environment jsdom
 */

'use strict';

const http = require('http');
const express = require('express');
const ws = require('ws');
const port = require('../../ports-map')['web-socket-client'];

jest.setMock('../../../client-src/utils/log', {
  log: {
    error: jest.fn(),
  },
});

describe('WebsocketClient', () => {
  const WebsocketClient = require('../../../client-src/clients/WebsocketClient');
  const { log } = require('../../../client-src/utils/log');

  let socketServer;
  let server;

  beforeAll((done) => {
    // eslint-disable-next-line new-cap
    const app = new express();

    server = http.createServer(app);
    server.listen(port, 'localhost', () => {
      socketServer = new ws.Server({
        server,
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

      const client = new WebsocketClient(`ws://localhost:${port}/ws-server`);
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

      const testError = new Error('test');

      client.client.onerror(testError);

      expect(log.error.mock.calls.length).toEqual(1);
      expect(log.error.mock.calls[0]).toEqual([testError]);

      setTimeout(() => {
        expect(data).toMatchSnapshot();

        done();
      }, 3000);
    });
  });

  afterAll((done) => {
    server.close(() => {
      done();
    });
  });
});
