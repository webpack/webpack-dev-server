/**
 * @jest-environment jsdom
 */

'use strict';

const http = require('http');
const express = require('express');
const sockjs = require('sockjs');
const port = require('../../ports-map').sockJSClient;

jest.setMock('../../../client-src/utils/log', {
  log: {
    error: jest.fn(),
  },
});

describe('SockJSClient', () => {
  const SockJSClient = require('../../../client-src/clients/SockJSClient');
  const { log } = require('../../../client-src/utils/log');
  let consoleMock;
  let socketServer;
  let server;

  beforeAll((done) => {
    consoleMock = jest.spyOn(console, 'log').mockImplementation();

    // eslint-disable-next-line new-cap
    const app = new express();

    server = http.createServer(app);
    server.listen(port, 'localhost', () => {
      socketServer = sockjs.createServer();
      socketServer.installHandlers(server, {
        prefix: '/ws',
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

      const client = new SockJSClient(`http://localhost:${port}/ws`);
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

      client.sock.onerror(testError);

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
