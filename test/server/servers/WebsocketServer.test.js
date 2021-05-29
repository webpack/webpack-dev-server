'use strict';

const http = require('http');
const express = require('express');
const ws = require('ws');
const WebsocketServer = require('../../../lib/servers/WebsocketServer');
const port = require('../../ports-map').WebsocketServer;

describe('WebsocketServer', () => {
  let socketServer;
  let server;

  beforeEach((done) => {
    // eslint-disable-next-line new-cap
    const app = new express();

    server = http.createServer(app);
    server.listen(port, 'localhost', () => {
      socketServer = new WebsocketServer({
        options: {
          webSocketServer: {
            options: {
              path: '/ws-server',
            },
          },
        },
        server,
        webSocketHeartbeatInterval: 800,
      });
      done();
    });
  });

  it('should receive connection, send message, and close client', (done) => {
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

    // the heartbeat interval was shortened greatly above
    // so that the client is quickly pinged
    client.on('ping', () => {
      data.push('ping');
    });

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

  it('should terminate a client that is not alive', (done) => {
    let receivedClientClose = false;
    socketServer.onConnection((connection) => {
      // this makes the server think the client did not respond
      // to a ping in time, so the server will terminate it
      connection.isAlive = false;
      socketServer.onConnectionClose(connection, () => {
        receivedClientClose = true;
      });
    });

    // eslint-disable-next-line new-cap, no-unused-vars
    const client = new ws(`http://localhost:${port}/ws-server`);

    setTimeout(() => {
      expect(receivedClientClose).toBeTruthy();
      done();
    }, 3000);
  });

  afterEach((done) => {
    server.close(done);
  });
});
