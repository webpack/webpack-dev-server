'use strict';

const webpack = require('webpack');
const WebSocket = require('ws');
const Server = require('../../lib/Server');
const WebsocketServer = require('../../lib/servers/WebsocketServer');
const config = require('../fixtures/client-config/webpack.config');
const runBrowser = require('../helpers/run-browser');
const port = require('../ports-map')['web-socket-heartbeat'];

describe('web socket communication', () => {
  const webSocketServers = ['ws', 'sockjs'];

  webSocketServers.forEach((websocketServer) => {
    it(`should work and close web socket client connection when web socket server closed ("${websocketServer}")`, async () => {
      WebsocketServer.heartbeatInterval = 100;

      const compiler = webpack(config);
      const devServerOptions = Object.assign(
        {},
        {
          host: '127.0.0.1',
          port,
          webSocketServer: websocketServer,
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

      const { page, browser } = await runBrowser();

      const pageErrors = [];
      const consoleMessages = [];

      page
        .on('console', (message) => {
          consoleMessages.push(message);
        })
        .on('pageerror', (error) => {
          pageErrors.push(error);
        });

      await page.goto(`http://127.0.0.1:${port}/main`, {
        waitUntil: 'networkidle0',
      });

      await new Promise((resolve, reject) => {
        server.close((error) => {
          if (error) {
            reject(error);

            return;
          }

          resolve();
        });
      });

      await new Promise((resolve) => {
        const interval = setInterval(() => {
          if (server.webSocketConnections.length === 0) {
            clearInterval(interval);
            resolve();
          }
        }, 100);
      });

      expect(consoleMessages.map((message) => message.text())).toMatchSnapshot(
        'console messages'
      );
      expect(pageErrors).toMatchSnapshot('page errors');

      await browser.close();
      await new Promise((resolve, reject) => {
        server.close((error) => {
          if (error) {
            reject(error);

            return;
          }

          resolve();
        });
      });
    });

    it(`should work and terminate client that is not alive ("${websocketServer}")`, async () => {
      WebsocketServer.heartbeatInterval = 100;

      const compiler = webpack(config);
      const devServerOptions = Object.assign(
        {},
        {
          host: '127.0.0.1',
          port,
          webSocketServer: websocketServer,
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

      const { page, browser } = await runBrowser();

      const pageErrors = [];
      const consoleMessages = [];

      page
        .on('console', (message) => {
          consoleMessages.push(message);
        })
        .on('pageerror', (error) => {
          pageErrors.push(error);
        });

      await page.goto(`http://127.0.0.1:${port}/main`, {
        waitUntil: 'networkidle0',
      });
      await browser.close();

      // Wait heartbeat
      await new Promise((resolve) => {
        setTimeout(() => {
          resolve();
        }, 200);
      });

      expect(server.webSocketConnections).toHaveLength(0);
      expect(consoleMessages.map((message) => message.text())).toMatchSnapshot(
        'console messages'
      );
      expect(pageErrors).toMatchSnapshot('page errors');

      await new Promise((resolve, reject) => {
        server.close((error) => {
          if (error) {
            reject(error);

            return;
          }

          resolve();
        });
      });
    });

    it(`should work and reconnect when the connection is lost ("${websocketServer}")`, async () => {
      WebsocketServer.heartbeatInterval = 100;

      const compiler = webpack(config);
      const devServerOptions = Object.assign(
        {},
        {
          host: '127.0.0.1',
          port,
          webSocketServer: websocketServer,
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

      const { page, browser } = await runBrowser();

      const pageErrors = [];
      const consoleMessages = [];

      page
        .on('console', (message) => {
          consoleMessages.push(message);
        })
        .on('pageerror', (error) => {
          pageErrors.push(error);
        });

      await page.goto(`http://127.0.0.1:${port}/main`, {
        waitUntil: 'networkidle0',
      });

      await new Promise((resolve, reject) => {
        server.close((error) => {
          if (error) {
            reject(error);

            return;
          }

          resolve();
        });
      });

      await new Promise((resolve, reject) => {
        server.listen(devServerOptions.port, devServerOptions.host, (error) => {
          if (error) {
            reject(error);

            return;
          }

          resolve();
        });
      });

      await page.waitForNavigation({
        waitUntil: 'networkidle0',
      });

      expect(consoleMessages.map((message) => message.text())).toMatchSnapshot(
        'console messages'
      );
      expect(pageErrors).toMatchSnapshot('page errors');

      await browser.close();
      await new Promise((resolve, reject) => {
        server.close((error) => {
          if (error) {
            reject(error);

            return;
          }

          resolve();
        });
      });
    });
  });

  it(`should work and do heartbeat using ("ws" web socket server)`, async () => {
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

    await new Promise((resolve) => {
      server.close(() => {
        resolve();
      });
    });
  });
});
