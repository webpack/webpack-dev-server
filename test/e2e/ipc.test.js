'use strict';

const os = require('os');
const net = require('net');
const path = require('path');
const http = require('http');
const webpack = require('webpack');
const httpProxy = require('http-proxy');
const Server = require('../../lib/Server');
const config = require('../fixtures/client-config/webpack.config');
const runBrowser = require('../helpers/run-browser');
const port1 = require('../ports-map').ipc;

const webSocketServers = ['ws', 'sockjs'];

describe('web socket server URL', () => {
  for (const webSocketServer of webSocketServers) {
    const websocketURLProtocol = webSocketServer === 'ws' ? 'ws' : 'http';

    it(`should work with the "ipc" option using "true" value ("${webSocketServer}")`, async () => {
      const devServerHost = '127.0.0.1';
      const proxyHost = devServerHost;
      const proxyPort = port1;

      const compiler = webpack(config);
      const devServerOptions = {
        webSocketServer,
        host: devServerHost,
        ipc: true,
      };
      const server = new Server(devServerOptions, compiler);

      // Avoid racing between CLI test and this test
      server.options.ipc = server.options.ipc.replace(
        /webpack-dev-server/,
        `webpack-dev-server.${process.pid}-1`
      );

      await new Promise((resolve, reject) => {
        server.listen((error) => {
          if (error) {
            reject(error);

            return;
          }

          resolve();
        });
      });

      function startProxy(callback) {
        const proxy = httpProxy.createProxyServer({
          target: { socketPath: server.options.ipc },
        });

        const proxyServer = http.createServer((request, response) => {
          // You can define here your custom logic to handle the request
          // and then proxy the request.
          proxy.web(request, response);
        });

        proxyServer.on('upgrade', (request, socket, head) => {
          proxy.ws(request, socket, head);
        });

        return proxyServer.listen(proxyPort, proxyHost, callback);
      }

      const proxy = await new Promise((resolve) => {
        const proxyCreated = startProxy(() => {
          resolve(proxyCreated);
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
        `${websocketURLProtocol}://${devServerHost}:${proxyPort}/ws`
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

    it.only(`should work with the "ipc" option using "string" value ("${webSocketServer}")`, async () => {
      const isWindows = process.platform === 'win32';
      const localRelative = path.relative(process.cwd(), `${os.tmpdir()}/`);
      const pipePrefix = isWindows ? '\\\\.\\pipe\\' : localRelative;
      const pipeName = `webpack-dev-server.${process.pid}-1.sock`;
      const ipc = path.join(pipePrefix, pipeName);

      const devServerHost = '127.0.0.1';
      const proxyHost = devServerHost;
      const proxyPort = port1;

      const compiler = webpack(config);
      const devServerOptions = {
        webSocketServer,
        host: devServerHost,
        ipc,
      };
      const server = new Server(devServerOptions, compiler);

      await new Promise((resolve, reject) => {
        server.listen((error) => {
          if (error) {
            reject(error);

            return;
          }

          resolve();
        });
      });

      function startProxy(callback) {
        const proxy = httpProxy.createProxyServer({
          target: { socketPath: ipc },
        });

        const proxyServer = http.createServer((request, response) => {
          // You can define here your custom logic to handle the request
          // and then proxy the request.
          proxy.web(request, response);
        });

        proxyServer.on('upgrade', (request, socket, head) => {
          proxy.ws(request, socket, head);
        });

        return proxyServer.listen(proxyPort, proxyHost, callback);
      }

      const proxy = await new Promise((resolve) => {
        const proxyCreated = startProxy(() => {
          resolve(proxyCreated);
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
        `${websocketURLProtocol}://${devServerHost}:${proxyPort}/ws`
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

    // TODO un skip after implement new API
    it.skip(`should work with the "ipc" option using "string" value and remove old ("${webSocketServer}")`, async () => {
      const isWindows = process.platform === 'win32';
      const localRelative = path.relative(process.cwd(), `${os.tmpdir()}/`);
      const pipePrefix = isWindows ? '\\\\.\\pipe\\' : localRelative;
      const pipeName = `webpack-dev-server.${process.pid}-2.sock`;
      const ipc = path.join(pipePrefix, pipeName);

      const ipcServer = await new Promise((resolve, reject) => {
        const server = net.Server();

        server.on('error', (error) => {
          reject(error);
        });

        return server.listen(ipc, () => {
          resolve();
        });
      });

      const devServerHost = '127.0.0.1';
      const proxyHost = devServerHost;
      const proxyPort = port1;

      const compiler = webpack(config);
      const devServerOptions = {
        webSocketServer,
        host: devServerHost,
        ipc,
      };
      const server = new Server(devServerOptions, compiler);

      await new Promise((resolve, reject) => {
        server.listen((error) => {
          if (error) {
            reject(error);

            return;
          }

          resolve();
        });
      });

      function startProxy(callback) {
        const proxy = httpProxy.createProxyServer({
          target: { socketPath: ipc },
        });

        const proxyServer = http.createServer((request, response) => {
          // You can define here your custom logic to handle the request
          // and then proxy the request.
          proxy.web(request, response);
        });

        proxyServer.on('upgrade', (request, socket, head) => {
          proxy.ws(request, socket, head);
        });

        return proxyServer.listen(proxyPort, proxyHost, callback);
      }

      console.log('HERE');
      const proxy = await new Promise((resolve) => {
        const proxyCreated = startProxy(() => {
          resolve(proxyCreated);
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

      console.log(`http://${proxyHost}:${proxyPort}/main`);
      await page.goto(`http://${proxyHost}:${proxyPort}/main`, {
        waitUntil: 'networkidle0',
      });

      const webSocketRequest = webSocketRequests[0];

      expect(webSocketRequest.url).toContain(
        `${websocketURLProtocol}://${devServerHost}:${proxyPort}/ws`
      );
      expect(consoleMessages.map((message) => message.text())).toMatchSnapshot(
        'console messages'
      );
      expect(pageErrors).toMatchSnapshot('page errors');

      proxy.close();

      await new Promise((resolve, reject) => {
        ipcServer.close((error) => {
          if (error) {
            reject(error);

            return;
          }

          resolve();
        });
      });
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
