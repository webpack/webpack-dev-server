'use strict';

const webpack = require('webpack');
const Server = require('../../lib/Server');
const defaultConfig = require('../fixtures/provide-plugin-default/webpack.config');
const sockjsConfig = require('../fixtures/provide-plugin-sockjs-config/webpack.config');
const wsConfig = require('../fixtures/provide-plugin-ws-config/webpack.config');
const runBrowser = require('../helpers/run-browser');
const port = require('../ports-map').ProvidePlugin;

describe('transport', () => {
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

    await page.goto(`http://localhost:${port}/main`, {
      waitUntil: 'networkidle0',
    });

    const isCorrectTransport = await page.evaluate(
      () => window.injectedClient === window.expectedClient
    );

    expect(isCorrectTransport).toBe(true);

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

    await page.goto(`http://localhost:${port}/main`, {
      waitUntil: 'networkidle0',
    });

    const isCorrectTransport = await page.evaluate(
      () => window.injectedClient === window.expectedClient
    );

    expect(isCorrectTransport).toBe(true);

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

    await page.goto(`http://localhost:${port}/main`, {
      waitUntil: 'networkidle0',
    });

    const isCorrectTransport = await page.evaluate(
      () => window.injectedClient === window.expectedClient
    );

    expect(isCorrectTransport).toBe(true);

    await browser.close();

    await new Promise((resolve) => {
      server.close(() => {
        resolve();
      });
    });
  });
});
