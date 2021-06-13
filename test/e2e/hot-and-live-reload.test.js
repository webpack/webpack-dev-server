/**
 * @jest-environment node
 */

'use strict';

const path = require('path');
const webpack = require('webpack');
const fs = require('graceful-fs');
const Server = require('../../lib/Server');
const reloadConfig = require('../fixtures/reload-config/webpack.config');
const runBrowser = require('../helpers/run-browser');
const port = require('../ports-map')['hot-and-live-reload'];

const cssFilePath = path.resolve(
  __dirname,
  '../fixtures/reload-config/main.css'
);

// TODO no request and no websocket server when hot and liveRealod disables
describe('hot and live reload', () => {
  const modes = [
    {
      title:
        'should work with default web socket server ("ws") and refresh content using hot module replacement',
    },
    // Default web socket serve ("ws")
    {
      title: 'should work and refresh content using hot module replacement',
      options: {
        hot: true,
      },
    },
    {
      title: 'should work and refresh content using hot module replacement',
      options: {
        webSocketServer: 'ws',
        liveReload: true,
      },
    },
    {
      title: 'should not refresh content when hot and no live reload disabled',
      options: {
        hot: false,
        liveReload: false,
      },
    },
    {
      title: 'should work and refresh content using hot module replacement',
      options: {
        liveReload: false,
        hot: true,
      },
    },
    {
      title: 'should work and refresh content using live reload',
      options: {
        liveReload: true,
        hot: false,
      },
    },
    {
      title:
        'should work and refresh content using hot module replacement when hot and live reload enabled',
      options: {
        liveReload: true,
        hot: true,
      },
    },
    // "ws" web socket serve
    {
      title: 'should work and refresh content using hot module replacement',
      options: {
        webSocketServer: 'ws',
        hot: true,
      },
    },
    {
      title: 'should work and refresh content using hot module replacement',
      options: {
        webSocketServer: 'ws',
        liveReload: true,
      },
    },
    {
      title: 'should not refresh content when hot and no live reload disabled',
      options: {
        webSocketServer: 'ws',
        hot: false,
        liveReload: false,
      },
    },
    {
      title: 'should work and refresh content using hot module replacement',
      options: {
        webSocketServer: 'ws',
        liveReload: false,
        hot: true,
      },
    },
    {
      title: 'should work and refresh content using live reload',
      options: {
        webSocketServer: 'ws',
        liveReload: true,
        hot: false,
      },
    },
    {
      title:
        'should work and refresh content using hot module replacement when hot and live reload enabled',
      options: {
        webSocketServer: 'ws',
        liveReload: true,
        hot: true,
      },
    },
    // "sockjs" web socket serve
    {
      title: 'should work and refresh content using hot module replacement',
      options: {
        webSocketServer: 'sockjs',
        hot: true,
      },
    },
    {
      title: 'should work and refresh content using hot module replacement',
      options: {
        webSocketServer: 'sockjs',
        liveReload: true,
      },
    },
    {
      title: 'should not refresh content when hot and no live reload disabled',
      options: {
        webSocketServer: 'sockjs',
        hot: false,
        liveReload: false,
      },
    },
    {
      title: 'should work and refresh content using hot module replacement',
      options: {
        webSocketServer: 'sockjs',
        liveReload: false,
        hot: true,
      },
    },
    {
      title: 'should work and refresh content using live reload',
      options: {
        webSocketServer: 'sockjs',
        liveReload: true,
        hot: false,
      },
    },
    {
      title:
        'should work and refresh content using hot module replacement when hot and live reload enabled',
      options: {
        webSocketServer: 'sockjs',
        liveReload: true,
        hot: true,
      },
    },
  ];

  modes.forEach((mode) => {
    it(mode.title, async () => {
      fs.writeFileSync(
        cssFilePath,
        'body { background-color: rgb(0, 0, 255); }'
      );

      const compiler = webpack(reloadConfig);
      const devServerOptions = Object.assign(
        {},
        {
          host: '0.0.0.0',
          port,
        },
        mode.options
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

      const consoleMessages = [];
      const pageErrors = [];

      let doneHotUpdate = false;

      page
        .on('console', (message) => consoleMessages.push(message))
        .on('pageerror', (error) => pageErrors.push(error))
        .on('request', (request) => {
          if (/\.hot-update\.json$/.test(request.url())) {
            doneHotUpdate = true;
          }
        });

      await page.goto(`http://localhost:${port}/main`, {
        waitUntil: 'networkidle0',
      });

      const backgroundColorBefore = await page.evaluate(() => {
        const body = document.body;

        return getComputedStyle(body)['background-color'];
      });

      expect(backgroundColorBefore).toEqual('rgb(0, 0, 255)');

      fs.writeFileSync(
        cssFilePath,
        'body { background-color: rgb(255, 0, 0); }'
      );

      let doNothing = false;

      const hot =
        mode.options && typeof mode.options.hot !== 'undefined'
          ? mode.options.hot
          : true;
      const liveReload =
        mode.options && typeof mode.options.liveReload !== 'undefined'
          ? mode.options.liveReload
          : true;

      if ((hot && liveReload) || (hot && !liveReload)) {
        await new Promise((resolve) => {
          const timer = setInterval(() => {
            if (doneHotUpdate) {
              clearInterval(timer);

              resolve();
            }
          }, 100);
        });
      } else if (liveReload) {
        await page.waitForNavigation();
      } else {
        doNothing = true;
      }

      const backgroundColorAfter = await page.evaluate(() => {
        const body = document.body;

        return getComputedStyle(body)['background-color'];
      });

      if (doNothing) {
        expect(backgroundColorAfter).toEqual('rgb(0, 0, 255)');
      } else {
        expect(backgroundColorAfter).toEqual('rgb(255, 0, 0)');
      }

      expect(consoleMessages.map((message) => message.text())).toMatchSnapshot(
        'console messages'
      );
      expect(pageErrors).toMatchSnapshot('page errors');

      fs.unlinkSync(cssFilePath);

      await browser.close();

      await new Promise((resolve) => {
        server.close(() => {
          resolve();
        });
      });
    });
  });
});
