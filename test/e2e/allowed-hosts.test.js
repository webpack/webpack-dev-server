/**
 * @jest-environment node
 */

'use strict';

const webpack = require('webpack');
const Server = require('../../lib/Server');
const config = require('../fixtures/client-config/webpack.config');
const runBrowser = require('../helpers/run-browser');
const port = require('../ports-map')['allowed-hosts'];

describe('allowedHosts', () => {
  it("should work with allowedHosts 'all'", async () => {
    const compiler = webpack({ ...config });
    const devServerOptions = {
      host: '127.0.0.1',
      port,
      allowedHosts: 'all',
    };
    const server = new Server(devServerOptions, compiler);

    await new Promise((resolve, reject) => {
      server.listen(port, '127.0.0.1', (error) => {
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

  it("should work with allowedHosts 'auto'", async () => {
    const compiler = webpack({ ...config });
    const devServerOptions = {
      host: '127.0.0.1',
      port,
      allowedHosts: 'auto',
    };
    const server = new Server(devServerOptions, compiler);

    await new Promise((resolve, reject) => {
      server.listen(port, '127.0.0.1', (error) => {
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

    await page.goto(`http://localhost:${port}/main`, {
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

  it('should work with allowedHosts string', async () => {
    const compiler = webpack({ ...config });
    const devServerOptions = {
      host: '127.0.0.1',
      port,
      allowedHosts: 'temphost',
    };
    const server = new Server(devServerOptions, compiler);

    await new Promise((resolve, reject) => {
      server.listen(port, '127.0.0.1', (error) => {
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

  it('should work with allowedHosts array of hosts', async () => {
    const compiler = webpack({ ...config });
    const devServerOptions = {
      host: '127.0.0.1',
      port,
      allowedHosts: ['temphost1.com', 'temphost2.com'],
    };
    const server = new Server(devServerOptions, compiler);

    await new Promise((resolve, reject) => {
      server.listen(port, '127.0.0.1', (error) => {
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
