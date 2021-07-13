'use strict';

const webpack = require('webpack');
const Server = require('../../lib/Server');
const WebsocketServer = require('../../lib/servers/WebsocketServer');
const defaultConfig = require('../fixtures/provide-plugin-default/webpack.config');
const sockjsConfig = require('../fixtures/provide-plugin-sockjs-config/webpack.config');
const wsConfig = require('../fixtures/provide-plugin-ws-config/webpack.config');
const customConfig = require('../fixtures/provide-plugin-custom/webpack.config');
const runBrowser = require('../helpers/run-browser');
const port = require('../ports-map')['web-socket-server-and-transport'];

describe('web socket server and transport', () => {
  it('should use default web socket server ("ws")', async () => {
    const compiler = webpack(defaultConfig);
    const devServerOptions = {
      port,
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

  it('should use "ws" web socket server when specify "ws" value', async () => {
    const compiler = webpack(defaultConfig);
    const devServerOptions = {
      port,
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

  it('should use "ws" web socket server when specify "ws" value using object', async () => {
    const compiler = webpack(defaultConfig);
    const devServerOptions = {
      port,
      webSocketServer: {
        type: 'ws',
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

  it('should use "sockjs" web socket server when specify "sockjs" value', async () => {
    const compiler = webpack(sockjsConfig);
    const devServerOptions = {
      port,
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

  it('should use "sockjs" web socket server when specify "sockjs" value using object', async () => {
    const compiler = webpack(sockjsConfig);
    const devServerOptions = {
      port,
      webSocketServer: {
        type: 'sockjs',
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

  it('should use custom web socket server when specify class', async () => {
    const compiler = webpack(defaultConfig);
    const devServerOptions = {
      port,
      client: {
        webSocketTransport: 'ws',
      },
      webSocketServer: WebsocketServer,
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

  it('should use custom web socket server when specify class using object', async () => {
    const compiler = webpack(defaultConfig);
    const devServerOptions = {
      port,
      client: {
        webSocketTransport: 'ws',
      },
      webSocketServer: {
        type: WebsocketServer,
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

  it('should use custom web socket server when specify path to class', async () => {
    const compiler = webpack(defaultConfig);
    const devServerOptions = {
      port,
      client: {
        webSocketTransport: 'ws',
      },
      webSocketServer: require.resolve('../../lib/servers/WebsocketServer'),
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

  it('should use custom web socket server when specify path to class using object', async () => {
    const compiler = webpack(defaultConfig);
    const devServerOptions = {
      port,
      client: {
        webSocketTransport: 'ws',
      },
      webSocketServer: {
        type: require.resolve('../../lib/servers/WebsocketServer'),
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

  it('should throw an error on wrong path', async () => {
    const compiler = webpack(defaultConfig);
    const devServerOptions = {
      port,
      webSocketServer: {
        type: '/bad/path/to/implementation',
      },
    };
    const server = new Server(devServerOptions, compiler);

    await expect(
      async () =>
        new Promise((resolve, reject) => {
          server.listen(
            devServerOptions.port,
            devServerOptions.host,
            (error) => {
              if (error) {
                reject(error);

                return;
              }

              resolve();
            }
          );
        })
    ).rejects.toThrowErrorMatchingSnapshot();
  });

  it('should use "sockjs" transport, when web socket server is not specify', async () => {
    const compiler = webpack(sockjsConfig);
    const devServerOptions = {
      port,
      client: {
        webSocketTransport: 'sockjs',
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

  it('should use "ws" transport, when web socket server is not specify', async () => {
    const compiler = webpack(wsConfig);
    const devServerOptions = {
      port,
      client: {
        webSocketTransport: 'ws',
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
      client: {
        webSocketTransport: 'sockjs',
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
      client: {
        webSocketTransport: 'ws',
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
      client: {
        webSocketTransport: require.resolve(
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
