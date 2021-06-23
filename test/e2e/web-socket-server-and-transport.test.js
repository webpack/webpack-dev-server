'use strict';

const webpack = require('webpack');
const Server = require('../../lib/Server');
const defaultConfig = require('../fixtures/provide-plugin-default/webpack.config');
const sockjsConfig = require('../fixtures/provide-plugin-sockjs-config/webpack.config');
const wsConfig = require('../fixtures/provide-plugin-ws-config/webpack.config');
const customConfig = require('../fixtures/provide-plugin-custom/webpack.config');
const runBrowser = require('../helpers/run-browser');
const port = require('../ports-map')['web-socket-server-and-transport'];

describe('web socket server and transport', () => {
  it('should use default transport ("ws")', async () => {
    const compiler = webpack(defaultConfig);
    const devServerOptions = {
      port,
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

    const consoleMessages = [];

    page.on('console', (message) => {
      consoleMessages.push(message);
    });

    await page.goto(`http://localhost:${port}/main`, {
      waitUntil: 'networkidle0',
    });

    const isCorrectTransport = await page.evaluate(
      () => window.injectedClient === window.expectedClient
    );

    expect(isCorrectTransport).toBe(true);
    expect(consoleMessages.map((message) => message.text())).toMatchSnapshot();

    await browser.close();

    await new Promise((resolve) => {
      server.close(() => {
        resolve();
      });
    });
  });

  it('should use "sockjs" transport', async () => {
    const compiler = webpack(sockjsConfig);
    const devServerOptions = {
      port,
      host: '0.0.0.0',
      client: {
        transport: 'sockjs',
      },
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

    const consoleMessages = [];

    page.on('console', (message) => {
      consoleMessages.push(message);
    });

    await page.goto(`http://localhost:${port}/main.js`, {
      waitUntil: 'networkidle0',
    });

    const isCorrectTransport = await page.evaluate(
      () => window.injectedClient === window.expectedClient
    );

    expect(isCorrectTransport).toBe(true);
    expect(consoleMessages.map((message) => message.text())).toMatchSnapshot();

    await browser.close();

    await new Promise((resolve) => {
      server.close(() => {
        resolve();
      });
    });
  });

  it('should use "ws" transport', async () => {
    const compiler = webpack(wsConfig);
    const devServerOptions = {
      port,
      host: '0.0.0.0',
      client: {
        transport: 'ws',
      },
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

    const consoleMessages = [];

    page.on('console', (message) => {
      consoleMessages.push(message);
    });

    await page.goto(`http://localhost:${port}/main`, {
      waitUntil: 'networkidle0',
    });

    const isCorrectTransport = await page.evaluate(
      () => window.injectedClient === window.expectedClient
    );

    expect(isCorrectTransport).toBe(true);
    expect(consoleMessages.map((message) => message.text())).toMatchSnapshot();

    await browser.close();

    await new Promise((resolve) => {
      server.close(() => {
        resolve();
      });
    });
  });

  it('should use "sockjs" transport and "sockjs" web socket server', async () => {
    const compiler = webpack(sockjsConfig);
    const devServerOptions = {
      port,
      host: '0.0.0.0',
      client: {
        transport: 'sockjs',
      },
      webSocketServer: 'sockjs',
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

    const consoleMessages = [];

    page.on('console', (message) => {
      consoleMessages.push(message);
    });

    await page.goto(`http://localhost:${port}/main`, {
      waitUntil: 'networkidle0',
    });

    const isCorrectTransport = await page.evaluate(
      () => window.injectedClient === window.expectedClient
    );

    expect(isCorrectTransport).toBe(true);
    expect(consoleMessages.map((message) => message.text())).toMatchSnapshot();

    await browser.close();

    await new Promise((resolve) => {
      server.close(() => {
        resolve();
      });
    });
  });

  it('should use "ws" transport and "ws" web socket server', async () => {
    const compiler = webpack(wsConfig);
    const devServerOptions = {
      port,
      host: '0.0.0.0',
      client: {
        transport: 'ws',
      },
      webSocketServer: 'ws',
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

    const consoleMessages = [];

    page.on('console', (message) => {
      consoleMessages.push(message);
    });

    await page.goto(`http://localhost:${port}/main`, {
      waitUntil: 'networkidle0',
    });

    const isCorrectTransport = await page.evaluate(
      () => window.injectedClient === window.expectedClient
    );

    expect(isCorrectTransport).toBe(true);
    expect(consoleMessages.map((message) => message.text())).toMatchSnapshot();

    await browser.close();

    await new Promise((resolve) => {
      server.close(() => {
        resolve();
      });
    });
  });

  it('should use custom transport and "sockjs" web socket server', async () => {
    const compiler = webpack(customConfig);
    const devServerOptions = {
      port,
      host: '0.0.0.0',
      client: {
        transport: require.resolve(
          '../fixtures/custom-client/CustomSockJSClient'
        ),
      },
      webSocketServer: 'sockjs',
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

    const consoleMessages = [];

    page.on('console', (message) => {
      consoleMessages.push(message);
    });

    await page.goto(`http://localhost:${port}/main`, {
      waitUntil: 'networkidle0',
    });

    const isCorrectTransport = await page.evaluate(
      () => window.injectedClient === window.expectedClient
    );

    expect(isCorrectTransport).toBe(true);
    expect(consoleMessages.map((message) => message.text())).toMatchSnapshot();

    await browser.close();

    await new Promise((resolve) => {
      server.close(() => {
        resolve();
      });
    });
  });
});
