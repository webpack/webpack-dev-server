'use strict';

const express = require('express');
const webpack = require('webpack');
const internalIp = require('internal-ip');
const { createProxyMiddleware } = require('http-proxy-middleware');
const Server = require('../../lib/Server');
const config = require('../fixtures/client-config/webpack.config');
const runBrowser = require('../helpers/run-browser');
const [port1, port2] = require('../ports-map')['web-socket-server-url'];

const webSocketServers = ['ws', 'sockjs'];

describe('web socket server URL', () => {
  for (const webSocketServer of webSocketServers) {
    const websocketURLProtocol = webSocketServer === 'ws' ? 'ws' : 'http';

    it(`should work behind proxy, when hostnames are same and ports are different ("${webSocketServer}")`, async () => {
      const devServerHost = '127.0.0.1';
      const devServerPort = port1;
      const proxyHost = devServerHost;
      const proxyPort = port2;

      function startProxy(callback) {
        const app = express();
        app.use(
          '/',
          createProxyMiddleware({
            target: `http://${devServerHost}:${devServerPort}`,
            ws: true,
            changeOrigin: true,
            logLevel: 'warn',
          })
        );

        return app.listen(proxyPort, proxyHost, callback);
      }

      const proxy = await new Promise((resolve) => {
        const proxyCreated = startProxy(() => {
          resolve(proxyCreated);
        });
      });

      const compiler = webpack(config);
      const devServerOptions = {
        webSocketServer,
        port: devServerPort,
        host: devServerHost,
        allowedHosts: 'all',
      };
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

      const webSocketRequests = [];

      if (webSocketServer === 'ws') {
        const client = page._client;

        client.on('Network.webSocketCreated', (test) => {
          webSocketRequests.push(test);
        });
      } else {
        page.on('request', (request) => {
          if (/\/ws\//.test(request.url())) {
            webSocketRequests.push({ url: request.url() });
          }
        });
      }

      await page.goto(`http://${proxyHost}:${proxyPort}/main`, {
        waitUntil: 'networkidle0',
      });

      const webSocketRequest = webSocketRequests[0];

      expect(webSocketRequest.url).toContain(
        `${websocketURLProtocol}://${devServerHost}:${devServerPort}/ws`
      );
      expect(consoleMessages.map((message) => message.text())).toMatchSnapshot(
        'console messages'
      );
      expect(pageErrors).toMatchSnapshot('page errors');

      proxy.close();
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

    it(`should work behind proxy, when hostnames are different and ports are same ("${webSocketServer}")`, async () => {
      const devServerHost = '127.0.0.1';
      const devServerPort = port1;
      const proxyHost = internalIp.v4.sync();
      const proxyPort = port1;

      function startProxy(callback) {
        const app = express();
        app.use(
          '/',
          createProxyMiddleware({
            target: `http://${devServerHost}:${devServerPort}`,
            ws: true,
            changeOrigin: true,
            logLevel: 'warn',
          })
        );

        return app.listen(proxyPort, proxyHost, callback);
      }

      const proxy = await new Promise((resolve) => {
        const proxyCreated = startProxy(() => {
          resolve(proxyCreated);
        });
      });

      const compiler = webpack(config);
      const devServerOptions = {
        webSocketServer,
        port: devServerPort,
        host: devServerHost,
        allowedHosts: 'all',
      };
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

      const webSocketRequests = [];

      if (webSocketServer === 'ws') {
        const client = page._client;

        client.on('Network.webSocketCreated', (test) => {
          webSocketRequests.push(test);
        });
      } else {
        page.on('request', (request) => {
          if (/\/ws\//.test(request.url())) {
            webSocketRequests.push({ url: request.url() });
          }
        });
      }

      await page.goto(`http://${proxyHost}:${proxyPort}/main`, {
        waitUntil: 'networkidle0',
      });

      const webSocketRequest = webSocketRequests[0];

      expect(webSocketRequest.url).toContain(
        `${websocketURLProtocol}://${devServerHost}:${devServerPort}/ws`
      );
      expect(consoleMessages.map((message) => message.text())).toMatchSnapshot(
        'console messages'
      );
      expect(pageErrors).toMatchSnapshot('page errors');

      proxy.close();
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

    it(`should work behind proxy, when hostnames are different and ports are different ("${webSocketServer}")`, async () => {
      const devServerHost = '127.0.0.1';
      const devServerPort = port1;
      const proxyHost = internalIp.v4.sync();
      const proxyPort = port2;

      function startProxy(callback) {
        const app = express();
        app.use(
          '/',
          createProxyMiddleware({
            target: `http://${devServerHost}:${devServerPort}`,
            ws: true,
            changeOrigin: true,
            logLevel: 'warn',
          })
        );

        return app.listen(proxyPort, proxyHost, callback);
      }

      const proxy = await new Promise((resolve) => {
        const proxyCreated = startProxy(() => {
          resolve(proxyCreated);
        });
      });

      const compiler = webpack(config);
      const devServerOptions = {
        client: {
          webSocketURL: {
            host: devServerHost,
          },
        },
        webSocketServer,
        port: devServerPort,
        host: devServerHost,
        allowedHosts: 'all',
      };
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

      const webSocketRequests = [];

      if (webSocketServer === 'ws') {
        const client = page._client;

        client.on('Network.webSocketCreated', (test) => {
          webSocketRequests.push(test);
        });
      } else {
        page.on('request', (request) => {
          if (/\/ws\//.test(request.url())) {
            webSocketRequests.push({ url: request.url() });
          }
        });
      }

      await page.goto(`http://${proxyHost}:${proxyPort}/main`, {
        waitUntil: 'networkidle0',
      });

      const webSocketRequest = webSocketRequests[0];

      expect(webSocketRequest.url).toContain(
        `${websocketURLProtocol}://${devServerHost}:${devServerPort}/ws`
      );
      expect(consoleMessages.map((message) => message.text())).toMatchSnapshot(
        'console messages'
      );
      expect(pageErrors).toMatchSnapshot('page errors');

      proxy.close();
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

    it(`should work with the "client.webSocketURL.protocol" option ("${webSocketServer}")`, async () => {
      const compiler = webpack(config);
      const devServerOptions = {
        client: {
          webSocketURL: {
            protocol: 'ws:',
          },
        },
        webSocketServer,
        port: port1,
        host: '0.0.0.0',
        allowedHosts: 'all',
      };
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

      const webSocketRequests = [];

      if (webSocketServer === 'ws') {
        const client = page._client;

        client.on('Network.webSocketCreated', (test) => {
          webSocketRequests.push(test);
        });
      } else {
        page.on('request', (request) => {
          if (/\/ws\//.test(request.url())) {
            webSocketRequests.push({ url: request.url() });
          }
        });
      }

      await page.goto(`http://localhost:${port1}/main`, {
        waitUntil: 'networkidle0',
      });

      const webSocketRequest = webSocketRequests[0];

      expect(webSocketRequest.url).toContain(
        `${websocketURLProtocol}://localhost:${port1}/ws`
      );
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

    it(`should work with the "client.webSocketURL.protocol" option using "auto:" value ("${webSocketServer}")`, async () => {
      const compiler = webpack(config);
      const devServerOptions = {
        client: {
          webSocketURL: {
            protocol: 'auto:',
          },
        },
        webSocketServer,
        port: port1,
        host: '0.0.0.0',
        allowedHosts: 'all',
      };
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

      const webSocketRequests = [];

      if (webSocketServer === 'ws') {
        const client = page._client;

        client.on('Network.webSocketCreated', (test) => {
          webSocketRequests.push(test);
        });
      } else {
        page.on('request', (request) => {
          if (/\/ws\//.test(request.url())) {
            webSocketRequests.push({ url: request.url() });
          }
        });
      }

      await page.goto(`http://localhost:${port1}/main`, {
        waitUntil: 'networkidle0',
      });

      const webSocketRequest = webSocketRequests[0];

      expect(webSocketRequest.url).toContain(
        `${websocketURLProtocol}://localhost:${port1}/ws`
      );
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

    it(`should work with the "client.webSocketURL.protocol" option using "http:" value and covert to "ws:" ("${webSocketServer}")`, async () => {
      const compiler = webpack(config);
      const devServerOptions = {
        client: {
          webSocketURL: {
            protocol: 'http:',
          },
        },
        webSocketServer,
        port: port1,
        host: '0.0.0.0',
        allowedHosts: 'all',
      };
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

      const webSocketRequests = [];

      if (webSocketServer === 'ws') {
        const client = page._client;

        client.on('Network.webSocketCreated', (test) => {
          webSocketRequests.push(test);
        });
      } else {
        page.on('request', (request) => {
          if (/\/ws\//.test(request.url())) {
            webSocketRequests.push({ url: request.url() });
          }
        });
      }

      await page.goto(`http://localhost:${port1}/main`, {
        waitUntil: 'networkidle0',
      });

      const webSocketRequest = webSocketRequests[0];

      expect(webSocketRequest.url).toContain(
        `${websocketURLProtocol}://localhost:${port1}/ws`
      );
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

    it(`should work with the "client.webSocketURL.host" option ("${webSocketServer}")`, async () => {
      const compiler = webpack(config);
      const devServerOptions = {
        client: {
          webSocketURL: {
            host: '127.0.0.1',
          },
        },
        webSocketServer,
        port: port1,
        host: '0.0.0.0',
        allowedHosts: 'all',
      };
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

      const webSocketRequests = [];

      if (webSocketServer === 'ws') {
        const client = page._client;

        client.on('Network.webSocketCreated', (test) => {
          webSocketRequests.push(test);
        });
      } else {
        page.on('request', (request) => {
          if (/\/ws\//.test(request.url())) {
            webSocketRequests.push({ url: request.url() });
          }
        });
      }

      await page.goto(`http://127.0.0.1:${port1}/main`, {
        waitUntil: 'networkidle0',
      });

      const webSocketRequest = webSocketRequests[0];

      expect(webSocketRequest.url).toContain(
        `${websocketURLProtocol}://127.0.0.1:${port1}/ws`
      );
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

    it(`should work with the "client.webSocketURL.host" option using "0.0.0.0" value ("${webSocketServer}")`, async () => {
      const compiler = webpack(config);
      const devServerOptions = {
        client: {
          webSocketURL: {
            host: '0.0.0.0',
          },
        },
        webSocketServer,
        port: port1,
        host: '0.0.0.0',
        allowedHosts: 'all',
      };
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

      const webSocketRequests = [];

      if (webSocketServer === 'ws') {
        const client = page._client;

        client.on('Network.webSocketCreated', (test) => {
          webSocketRequests.push(test);
        });
      } else {
        page.on('request', (request) => {
          if (/\/ws\//.test(request.url())) {
            webSocketRequests.push({ url: request.url() });
          }
        });
      }

      await page.goto(`http://127.0.0.1:${port1}/main`, {
        waitUntil: 'networkidle0',
      });

      const webSocketRequest = webSocketRequests[0];

      expect(webSocketRequest.url).toContain(
        `${websocketURLProtocol}://127.0.0.1:${port1}/ws`
      );
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

    it(`should work with the "client.webSocketURL.port" option ("${webSocketServer}")`, async () => {
      const compiler = webpack(config);
      const devServerOptions = {
        client: {
          webSocketURL: {
            port: port1,
          },
        },
        webSocketServer,
        port: port1,
        host: '0.0.0.0',
        allowedHosts: 'all',
      };
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

      const webSocketRequests = [];

      if (webSocketServer === 'ws') {
        const client = page._client;

        client.on('Network.webSocketCreated', (test) => {
          webSocketRequests.push(test);
        });
      } else {
        page.on('request', (request) => {
          if (/\/ws\//.test(request.url())) {
            webSocketRequests.push({ url: request.url() });
          }
        });
      }

      await page.goto(`http://127.0.0.1:${port1}/main`, {
        waitUntil: 'networkidle0',
      });

      const webSocketRequest = webSocketRequests[0];

      expect(webSocketRequest.url).toContain(
        `${websocketURLProtocol}://127.0.0.1:${port1}/ws`
      );
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

    it(`should work with the "client.webSocketURL.port" option as string ("${webSocketServer}")`, async () => {
      const compiler = webpack(config);
      const devServerOptions = {
        client: {
          webSocketURL: {
            port: `${port1}`,
          },
        },
        webSocketServer,
        port: port1,
        host: '0.0.0.0',
        allowedHosts: 'all',
      };
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

      const webSocketRequests = [];

      if (webSocketServer === 'ws') {
        const client = page._client;

        client.on('Network.webSocketCreated', (test) => {
          webSocketRequests.push(test);
        });
      } else {
        page.on('request', (request) => {
          if (/\/ws\//.test(request.url())) {
            webSocketRequests.push({ url: request.url() });
          }
        });
      }

      await page.goto(`http://127.0.0.1:${port1}/main`, {
        waitUntil: 'networkidle0',
      });

      const webSocketRequest = webSocketRequests[0];

      expect(webSocketRequest.url).toContain(
        `${websocketURLProtocol}://127.0.0.1:${port1}/ws`
      );
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

    it(`should work with "client.webSocketURL.port" and "webSocketServer.options.port" options as string ("${webSocketServer}")`, async () => {
      const compiler = webpack(config);
      const devServerOptions = {
        webSocketServer: {
          type: webSocketServer,
          options: {
            host: '0.0.0.0',
            // "sockjs" doesn't support external server
            port: webSocketServer === 'sockjs' ? `${port1}` : `${port2}`,
          },
        },
        port: port1,
        host: '0.0.0.0',
        client: {
          webSocketURL: {
            port: webSocketServer === 'sockjs' ? `${port1}` : `${port2}`,
          },
        },
        allowedHosts: 'all',
      };
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

      const webSocketRequests = [];

      if (webSocketServer === 'ws') {
        const client = page._client;

        client.on('Network.webSocketCreated', (test) => {
          webSocketRequests.push(test);
        });
      } else {
        page.on('request', (request) => {
          if (/\/ws\//.test(request.url())) {
            webSocketRequests.push({ url: request.url() });
          }
        });
      }

      await page.goto(`http://127.0.0.1:${port1}/main`, {
        waitUntil: 'networkidle0',
      });

      const webSocketRequest = webSocketRequests[0];

      expect(webSocketRequest.url).toContain(
        webSocketServer === 'sockjs'
          ? `${websocketURLProtocol}://127.0.0.1:${port1}/ws`
          : `${websocketURLProtocol}://127.0.0.1:${port2}/ws`
      );
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

    it(`should work with the "client.webSocketURL.port" option using "0" value ("${webSocketServer}")`, async () => {
      const compiler = webpack(config);
      const devServerOptions = {
        client: {
          webSocketURL: {
            port: 0,
          },
        },
        webSocketServer,
        port: port1,
        host: '0.0.0.0',
        allowedHosts: 'all',
      };
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

      const webSocketRequests = [];

      if (webSocketServer === 'ws') {
        const client = page._client;

        client.on('Network.webSocketCreated', (test) => {
          webSocketRequests.push(test);
        });
      } else {
        page.on('request', (request) => {
          if (/\/ws\//.test(request.url())) {
            webSocketRequests.push({ url: request.url() });
          }
        });
      }

      await page.goto(`http://127.0.0.1:${port1}/main`, {
        waitUntil: 'networkidle0',
      });

      const webSocketRequest = webSocketRequests[0];

      expect(webSocketRequest.url).toContain(
        `${websocketURLProtocol}://127.0.0.1:${port1}/ws`
      );
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

    it(`should work with the "client.webSocketURL.path" option ("${webSocketServer}")`, async () => {
      const compiler = webpack(config);
      const devServerOptions = {
        client: {
          webSocketURL: {
            path: '/ws',
          },
        },
        webSocketServer,
        port: port1,
        host: '0.0.0.0',
        allowedHosts: 'all',
      };
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

      const webSocketRequests = [];

      if (webSocketServer === 'ws') {
        const client = page._client;

        client.on('Network.webSocketCreated', (test) => {
          webSocketRequests.push(test);
        });
      } else {
        page.on('request', (request) => {
          if (/\/ws\//.test(request.url())) {
            webSocketRequests.push({ url: request.url() });
          }
        });
      }

      await page.goto(`http://127.0.0.1:${port1}/main`, {
        waitUntil: 'networkidle0',
      });

      const webSocketRequest = webSocketRequests[0];

      expect(webSocketRequest.url).toContain(
        `${websocketURLProtocol}://127.0.0.1:${port1}/ws`
      );
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

    it(`should work with the "client.webSocketURL.username" option ("${webSocketServer}")`, async () => {
      const compiler = webpack(config);
      const devServerOptions = {
        client: {
          webSocketURL: {
            username: 'zenitsu',
          },
        },
        webSocketServer,
        port: port1,
        host: '0.0.0.0',
        allowedHosts: 'all',
      };
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

      const webSocketRequests = [];

      if (webSocketServer === 'ws') {
        const client = page._client;

        client.on('Network.webSocketCreated', (test) => {
          webSocketRequests.push(test);
        });
      } else {
        page.on('request', (request) => {
          if (/\/ws\//.test(request.url())) {
            webSocketRequests.push({ url: request.url() });
          }
        });
      }

      await page.goto(`http://127.0.0.1:${port1}/main`, {
        waitUntil: 'networkidle0',
      });

      const webSocketRequest = webSocketRequests[0];

      expect(webSocketRequest.url).toContain(
        `${websocketURLProtocol}://zenitsu@127.0.0.1:${port1}/ws`
      );
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

    it(`should work with the "client.webSocketURL.password" option ("${webSocketServer}")`, async () => {
      const compiler = webpack(config);
      const devServerOptions = {
        client: {
          webSocketURL: {
            password: 'chuntaro',
          },
        },
        webSocketServer,
        port: port1,
        host: '0.0.0.0',
        allowedHosts: 'all',
      };
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

      const webSocketRequests = [];

      if (webSocketServer === 'ws') {
        const client = page._client;

        client.on('Network.webSocketCreated', (test) => {
          webSocketRequests.push(test);
        });
      } else {
        page.on('request', (request) => {
          if (/\/ws\//.test(request.url())) {
            webSocketRequests.push({ url: request.url() });
          }
        });
      }

      await page.goto(`http://127.0.0.1:${port1}/main`, {
        waitUntil: 'networkidle0',
      });

      const webSocketRequest = webSocketRequests[0];

      expect(webSocketRequest.url).toContain(
        // "sockjs" has bug with parsing URL
        webSocketServer === 'ws'
          ? `${websocketURLProtocol}://:chuntaro@127.0.0.1:${port1}/ws`
          : `${websocketURLProtocol}://127.0.0.1:${port1}/ws`
      );
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

    it(`should work with the "client.webSocketURL.username" and "client.webSocketURL.password" option ("${webSocketServer}")`, async () => {
      const compiler = webpack(config);
      const devServerOptions = {
        client: {
          webSocketURL: {
            username: 'zenitsu',
            password: 'chuntaro',
          },
        },
        webSocketServer,
        port: port1,
        host: '0.0.0.0',
        allowedHosts: 'all',
      };
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

      const webSocketRequests = [];

      if (webSocketServer === 'ws') {
        const client = page._client;

        client.on('Network.webSocketCreated', (test) => {
          webSocketRequests.push(test);
        });
      } else {
        page.on('request', (request) => {
          if (/\/ws\//.test(request.url())) {
            webSocketRequests.push({ url: request.url() });
          }
        });
      }

      await page.goto(`http://127.0.0.1:${port1}/main`, {
        waitUntil: 'networkidle0',
      });

      const webSocketRequest = webSocketRequests[0];

      expect(webSocketRequest.url).toContain(
        `${websocketURLProtocol}://zenitsu:chuntaro@127.0.0.1:${port1}/ws`
      );
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

    it(`should work with the "client.webSocketURL.path" option and custom web socket server "path" ("${webSocketServer}")`, async () => {
      const compiler = webpack(config);
      const devServerOptions = {
        client: {
          webSocketURL: {
            path: '/custom-ws',
          },
        },
        webSocketServer: {
          type: webSocketServer,
          options: {
            path: '/custom-ws',
          },
        },
        port: port1,
        host: '0.0.0.0',
        allowedHosts: 'all',
      };
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

      const webSocketRequests = [];

      if (webSocketServer === 'ws') {
        const client = page._client;

        client.on('Network.webSocketCreated', (test) => {
          webSocketRequests.push(test);
        });
      } else {
        page.on('request', (request) => {
          if (/\/custom-ws\//.test(request.url())) {
            webSocketRequests.push({ url: request.url() });
          }
        });
      }

      await page.goto(`http://127.0.0.1:${port1}/main`, {
        waitUntil: 'networkidle0',
      });

      const webSocketRequest = webSocketRequests[0];

      expect(webSocketRequest.url).toContain(
        `${websocketURLProtocol}://127.0.0.1:${port1}/custom-ws`
      );
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

    it.skip(`should work when "port" option is "auto" ("${webSocketServer}")`, async () => {
      const compiler = webpack(config);
      const devServerOptions = {
        webSocketServer,
        port: 'auto',
        host: '0.0.0.0',
      };
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

      const webSocketRequests = [];

      if (webSocketServer === 'ws') {
        const client = page._client;

        client.on('Network.webSocketCreated', (test) => {
          webSocketRequests.push(test);
        });
      } else {
        page.on('request', (request) => {
          if (/\/ws\//.test(request.url())) {
            webSocketRequests.push({ url: request.url() });
          }
        });
      }

      await page.goto(`http://127.0.0.1:8080/main`, {
        waitUntil: 'networkidle0',
      });

      const webSocketRequest = webSocketRequests[0];

      expect(webSocketRequest.url).toContain(
        `${websocketURLProtocol}://127.0.0.1:8080/ws`
      );
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

    it(`should work when "host" option is IPv4 ("${webSocketServer}")`, async () => {
      const compiler = webpack(config);
      const devServerOptions = {
        webSocketServer,
        port: port1,
        host: internalIp.v4.sync(),
      };
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

      const webSocketRequests = [];

      if (webSocketServer === 'ws') {
        const client = page._client;

        client.on('Network.webSocketCreated', (test) => {
          webSocketRequests.push(test);
        });
      } else {
        page.on('request', (request) => {
          if (/\/ws\//.test(request.url())) {
            webSocketRequests.push({ url: request.url() });
          }
        });
      }

      await page.goto(`http://${internalIp.v4.sync()}:${port1}/main`, {
        waitUntil: 'networkidle0',
      });

      const webSocketRequest = webSocketRequests[0];

      expect(webSocketRequest.url).toContain(
        `${websocketURLProtocol}://${internalIp.v4.sync()}:${port1}/ws`
      );
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

    it(`should work with "client.webSocketURL.*" options ("${webSocketServer}")`, async () => {
      const compiler = webpack(config);
      const devServerOptions = {
        client: {
          webSocketURL: {
            protocol: 'ws:',
            host: '127.0.0.1',
            port: port1,
            path: '/ws',
          },
        },
        webSocketServer,
        port: port1,
        host: '0.0.0.0',
        allowedHosts: 'all',
      };
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

      const webSocketRequests = [];

      if (webSocketServer === 'ws') {
        const client = page._client;

        client.on('Network.webSocketCreated', (test) => {
          webSocketRequests.push(test);
        });
      } else {
        page.on('request', (request) => {
          if (/\/ws\//.test(request.url())) {
            webSocketRequests.push({ url: request.url() });
          }
        });
      }

      await page.goto(`http://127.0.0.1:${port1}/main`, {
        waitUntil: 'networkidle0',
      });

      const webSocketRequest = webSocketRequests[0];

      expect(webSocketRequest.url).toContain(
        `${websocketURLProtocol}://127.0.0.1:${port1}/ws`
      );
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

    it(`should work with the "client.webSocketURL" option as "string" ("${webSocketServer}")`, async () => {
      const compiler = webpack(config);
      const devServerOptions = {
        client: {
          webSocketURL: `ws://127.0.0.1:${port1}/ws`,
        },
        webSocketServer,
        port: port1,
        host: '0.0.0.0',
        allowedHosts: 'all',
      };
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

      const webSocketRequests = [];

      if (webSocketServer === 'ws') {
        const client = page._client;

        client.on('Network.webSocketCreated', (test) => {
          webSocketRequests.push(test);
        });
      } else {
        page.on('request', (request) => {
          if (/\/ws\//.test(request.url())) {
            webSocketRequests.push({ url: request.url() });
          }
        });
      }

      await page.goto(`http://127.0.0.1:${port1}/main`, {
        waitUntil: 'networkidle0',
      });

      const webSocketRequest = webSocketRequests[0];

      expect(webSocketRequest.url).toContain(
        `${websocketURLProtocol}://127.0.0.1:${port1}/ws`
      );
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

    it(`should work and throw an error on invalid web socket URL ("${webSocketServer}")`, async () => {
      const compiler = webpack(config);
      const devServerOptions = {
        client: {
          webSocketURL: 'unknown://unknown.unknown/unknown',
        },
        webSocketServer,
        port: port1,
        host: '0.0.0.0',
        allowedHosts: 'all',
      };
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

      await page.goto(`http://localhost:${port1}/main`, {
        waitUntil: 'networkidle0',
      });

      expect(consoleMessages.map((message) => message.text())).toMatchSnapshot(
        'console messages'
      );
      expect(
        pageErrors.map((pageError) => pageError.message.split('\n')[0])
      ).toMatchSnapshot('page errors');

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

    it(`should not work and output disconnect wrong web socket URL ("${webSocketServer}")`, async () => {
      const compiler = webpack(config);
      const devServerOptions = {
        client: {
          webSocketURL: 'ws://unknown.unknown/unknown',
        },
        webSocketServer,
        port: port1,
        host: '0.0.0.0',
        allowedHosts: 'all',
      };
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

      await page.goto(`http://localhost:${port1}/main`, {
        waitUntil: 'networkidle0',
      });

      expect(
        consoleMessages.map((message) =>
          message.text().replace(/:[\d]+/g, ':<port>')
        )
      ).toMatchSnapshot('console messages');
      expect(
        pageErrors.map((pageError) => pageError.message.split('\n')[0])
      ).toMatchSnapshot('page errors');

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
  }
});
