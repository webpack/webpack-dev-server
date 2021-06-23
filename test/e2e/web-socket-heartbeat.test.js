'use strict';

const webpack = require('webpack');
const WebSocket = require('ws');
const Server = require('../../lib/Server');
const WebsocketServer = require('../../lib/servers/WebsocketServer');
const config = require('../fixtures/client-config/webpack.config');
const runBrowser = require('../helpers/run-browser');
const port = require('../ports-map')['web-socket-heartbeat'];

describe('heartbeat', () => {
  it(`should work using "ws" web socket server`, async () => {
    WebsocketServer.heartbeatInterval = 100;

    const compiler = webpack(config);
    const devServerOptions = Object.assign(
      {},
      {
        host: '127.0.0.1',
        port,
        webSocketServer: 'ws',
      }
    );
    const server = new Server(devServerOptions, compiler);

    await new Promise((resolve, reject) => {
      server.listen(devServerOptions.port, devServerOptions.host, (error) => {
        if (error) {
          reject(error);

          return;
        }

        resolve();
      });
    });

    server.webSocketServer.heartbeatInterval = 100;

    const { page, browser } = await runBrowser();

    await new Promise((resolve, reject) => {
      const ws = new WebSocket(`ws://127.0.0.1:${devServerOptions.port}/ws`, {
        headers: {
          host: `127.0.0.1:${devServerOptions.port}`,
          origin: `http://127.0.0.1:${devServerOptions.port}`,
        },
      });

      let opened = false;
      let received = false;

      ws.on('open', () => {
        opened = true;
      });

      ws.on('error', (error) => {
        reject(error);
      });

      ws.on('ping', () => {
        if (opened && received) {
          ws.close();
        }
      });

      ws.on('message', (data) => {
        const message = JSON.parse(data);

        if (message.type === 'ok') {
          received = true;
        }
      });

      ws.on('close', () => {
        resolve();
      });
    });

    const consoleMessages = [];

    page.on('console', (message) => {
      consoleMessages.push(message);
    });

    await page.goto(`http://localhost:${port}/main`, {
      waitUntil: 'networkidle0',
    });

    expect(consoleMessages.map((message) => message.text())).toMatchSnapshot();

    await browser.close();
    await new Promise((resolve) => {
      server.close(() => {
        resolve();
      });
    });
  });
});
