/**
 * @jest-environment node
 */

'use strict';

const path = require('path');
const WebSocket = require('ws');
const SockJS = require('sockjs-client');
const webpack = require('webpack');
const request = require('supertest');
const fs = require('graceful-fs');
const Server = require('../../lib/Server');
const reloadConfig = require('../fixtures/reload-config/webpack.config');
const runBrowser = require('../helpers/run-browser');
const port = require('../ports-map')['hot-and-live-reload'];

const cssFilePath = path.resolve(
  __dirname,
  '../fixtures/reload-config/main.css'
);

const INVALID_MESSAGE = '[webpack-dev-server] App updated. Recompiling...';

describe('hot and live reload', () => {
  // "sockjs" client cannot add additional headers
  const modes = [
    {
      title: 'should work and refresh content using hot module replacement',
    },
    // Default web socket serve ("ws")
    {
      title:
        'should work and refresh content using hot module replacement when hot enabled',
      options: {
        hot: true,
      },
    },
    {
      title:
        'should work and refresh content using hot module replacement when live reload enabled',
      options: {
        liveReload: true,
      },
    },
    {
      title: 'should not refresh content when hot and no live reload disabled',
      noWebSocketServer: true,
      options: {
        hot: false,
        liveReload: false,
      },
    },
    {
      title:
        'should work and refresh content using hot module replacement when live reload disabled and hot enabled',
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
        'should work and refresh content using hot module replacement when live reload enabled and hot disabled',
      options: {
        liveReload: true,
        hot: true,
      },
    },
    // "ws" web socket serve
    {
      title:
        'should work and refresh content using hot module replacement when hot enabled',
      options: {
        webSocketServer: 'ws',
        hot: true,
      },
    },
    {
      title:
        'should work and refresh content using hot module replacement when live reload enabled',
      options: {
        webSocketServer: 'ws',
        liveReload: true,
      },
    },
    {
      title: 'should not refresh content when hot and no live reload disabled',
      noWebSocketServer: true,
      options: {
        webSocketServer: 'ws',
        hot: false,
        liveReload: false,
      },
    },
    {
      title:
        'should work and refresh content using hot module replacement when live reload disabled and hot enabled',
      options: {
        webSocketServer: 'ws',
        liveReload: false,
        hot: true,
      },
    },
    {
      title:
        'should work and refresh content using live reload when live reload enabled and hot disabled',
      options: {
        webSocketServer: 'ws',
        liveReload: true,
        hot: false,
      },
    },
    {
      title:
        'should work and refresh content using hot module replacement when live reload and hot enabled',
      options: {
        webSocketServer: 'ws',
        liveReload: true,
        hot: true,
      },
    },
    // "sockjs" web socket serve
    {
      title:
        'should work and refresh content using hot module replacement when hot enabled',
      options: {
        allowedHosts: 'all',

        webSocketServer: 'sockjs',
        hot: true,
      },
    },
    {
      title:
        'should work and refresh content using hot module replacement when live reload enabled',
      options: {
        allowedHosts: 'all',

        webSocketServer: 'sockjs',
        liveReload: true,
      },
    },
    {
      title: 'should not refresh content when hot and no live reload disabled',
      noWebSocketServer: true,
      options: {
        allowedHosts: 'all',

        webSocketServer: 'sockjs',
        hot: false,
        liveReload: false,
      },
    },
    {
      title:
        'should work and refresh content using hot module replacement when live reload disabled and hot enabled',
      options: {
        allowedHosts: 'all',

        webSocketServer: 'sockjs',
        liveReload: false,
        hot: true,
      },
    },
    {
      title:
        'should work and refresh content using live reload when live reload disabled and hot enabled',
      options: {
        allowedHosts: 'all',

        webSocketServer: 'sockjs',
        liveReload: true,
        hot: false,
      },
    },
    {
      title:
        'should work and refresh content using hot module replacement when live reload and hot enabled',
      options: {
        allowedHosts: 'all',

        webSocketServer: 'sockjs',
        liveReload: true,
        hot: true,
      },
    },
    {
      title:
        'should work and allow to disable hot module replacement using the "webpack-dev-server-hot=false"',
      query: '?webpack-dev-server-hot=false',
      options: {
        liveReload: true,
        hot: true,
      },
    },
    {
      title:
        'should work and allow to disable live reload using the "webpack-dev-server-live-reload=false"',
      query: '?webpack-dev-server-live-reload=false',
      options: {
        liveReload: true,
        hot: false,
      },
    },
    {
      title:
        'should work and allow to disable hot module replacement and live reload using the "webpack-dev-server-live-reload=false"',
      query:
        '?webpack-dev-server-hot=false&webpack-dev-server-live-reload=false',
      options: {
        liveReload: true,
        hot: true,
      },
    },
    {
      title: 'should work with manual client setup',
      webpackOptions: {
        entry: [
          require.resolve('../../client-src/index.js'),
          require.resolve('../fixtures/reload-config/foo.js'),
        ],
      },
      options: {
        client: false,
        liveReload: true,
        hot: true,
      },
    },
    // TODO we still output logs from webpack, need to improve this
    {
      title:
        'should work with manual client setup and allow to disable hot module replacement',
      webpackOptions: {
        entry: [
          `${require.resolve('../../client-src/index.js')}?hot=false`,
          require.resolve('../fixtures/reload-config/foo.js'),
        ],
      },
      options: {
        client: false,
        liveReload: true,
        hot: true,
      },
    },
    {
      title:
        'should work with manual client setup and allow to disable live reload',
      webpackOptions: {
        entry: [
          `${require.resolve('../../client-src/index.js')}?live-reload=false`,
          require.resolve('../fixtures/reload-config/foo.js'),
        ],
      },
      options: {
        client: false,
        liveReload: true,
        hot: false,
      },
    },
  ];

  modes.forEach((mode) => {
    const webSocketServerTitle =
      mode.options && mode.options.webSocketServer
        ? mode.options.webSocketServer
        : 'default';

    it(`${mode.title} (${webSocketServerTitle})`, async () => {
      fs.writeFileSync(
        cssFilePath,
        'body { background-color: rgb(0, 0, 255); }'
      );

      const webpackOptions = { ...reloadConfig, ...mode.webpackOptions };
      const compiler = webpack(webpackOptions);
      const devServerOptions = {
        host: '0.0.0.0',
        port,
        ...mode.options,
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

      await new Promise((resolve, reject) => {
        request(`http://127.0.0.1:${devServerOptions.port}`)
          .get('/main')
          .expect(200, (error) => {
            if (error) {
              reject(error);

              return;
            }

            resolve();
          });
      });

      const hot =
        mode.options && typeof mode.options.hot !== 'undefined'
          ? mode.options.hot
          : true;
      const liveReload =
        mode.options && typeof mode.options.liveReload !== 'undefined'
          ? mode.options.liveReload
          : true;

      await new Promise((resolve) => {
        const webSocketServer =
          mode.options && typeof mode.options.webSocketServer !== 'undefined'
            ? mode.options.webSocketServer
            : 'ws';

        const webSocketServerLaunched = hot || liveReload;

        if (webSocketServer === 'ws') {
          const ws = new WebSocket(
            `ws://127.0.0.1:${devServerOptions.port}/ws`,
            {
              headers: {
                host: `127.0.0.1:${devServerOptions.port}`,
                origin: `http://127.0.0.1:${devServerOptions.port}`,
              },
            }
          );

          let opened = false;
          let received = false;
          let errored = false;

          ws.on('error', (error) => {
            if (webSocketServerLaunched) {
              errored = true;
            } else if (!webSocketServerLaunched && /404/.test(error)) {
              errored = true;

              ws.close();
            }
          });

          ws.on('open', () => {
            opened = true;
          });

          ws.on('message', (data) => {
            const message = JSON.parse(data);

            if (message.type === 'ok') {
              received = true;

              ws.close();
            }
          });

          ws.on('close', () => {
            if (webSocketServerLaunched && opened && received && !errored) {
              resolve();
            } else if (!webSocketServerLaunched && errored) {
              resolve();
            }
          });
        } else {
          const sockjs = new SockJS(
            `http://127.0.0.1:${devServerOptions.port}/ws`
          );

          let opened = false;
          let received = false;
          let errored = false;

          sockjs.onerror = () => {
            errored = true;
          };

          sockjs.onopen = () => {
            opened = true;
          };

          sockjs.onmessage = ({ data }) => {
            const message = JSON.parse(data);

            if (message.type === 'ok') {
              received = true;

              sockjs.close();
            }
          };

          sockjs.onclose = (event) => {
            if (webSocketServerLaunched && opened && received && !errored) {
              resolve();
            } else if (
              !webSocketServerLaunched &&
              event &&
              event.reason === 'Cannot connect to server'
            ) {
              resolve();
            }
          };
        }
      });

      const { page, browser } = await runBrowser();

      const consoleMessages = [];
      const pageErrors = [];

      let doneHotUpdate = false;

      page
        .on('console', (message) => {
          consoleMessages.push(message.text());
        })
        .on('pageerror', (error) => {
          pageErrors.push(error);
        })
        .on('request', (requestObj) => {
          if (/\.hot-update\.json$/.test(requestObj.url())) {
            doneHotUpdate = true;
          }
        });

      await page.goto(`http://localhost:${port}/main${mode.query || ''}`, {
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

      const query = mode.query || '';
      let allowToHotModuleReplacement = true;

      if (query.indexOf('webpack-dev-server-hot=false') !== -1) {
        allowToHotModuleReplacement = false;
      }

      if (
        Array.isArray(webpackOptions.entry) &&
        webpackOptions.entry.map((item) => item.includes('hot=false'))
      ) {
        allowToHotModuleReplacement = false;
      }

      let allowToLiveReload = true;

      if (query.indexOf('webpack-dev-server-live-reload=false') !== -1) {
        allowToLiveReload = false;
      }

      if (
        Array.isArray(webpackOptions.entry) &&
        webpackOptions.entry.map((item) => item.includes('live-reload=false'))
      ) {
        allowToLiveReload = false;
      }

      if (
        allowToHotModuleReplacement &&
        ((hot && liveReload) || (hot && !liveReload))
      ) {
        await page.waitForFunction(
          () =>
            getComputedStyle(document.body)['background-color'] ===
            'rgb(255, 0, 0)'
        );

        expect(doneHotUpdate).toBe(true);
      } else if (liveReload && allowToLiveReload) {
        await page.waitForNavigation({
          waitUntil: 'networkidle0',
        });
      } else {
        if (!mode.noWebSocketServer) {
          await new Promise((resolve) => {
            const interval = setInterval(() => {
              if (consoleMessages.includes(INVALID_MESSAGE)) {
                clearInterval(interval);

                resolve();
              }
            }, 100);
          });
        }

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

      expect(consoleMessages).toMatchSnapshot('console messages');
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
