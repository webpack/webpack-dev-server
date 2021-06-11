'use strict';

const webpack = require('webpack');
const Server = require('../../lib/Server');
const config = require('../fixtures/client-config/webpack.config');
const runBrowser = require('../helpers/run-browser');
const port = require('../ports-map').logging;

describe('logging', () => {
  const webSocketServerTypesLog = [
    {},
    { webSocketServer: 'sockjs' },
    { webSocketServer: 'ws' },
  ];

  const cases = [
    {
      title: 'hot disabled',
      options: {
        hot: false,
      },
    },
    {
      title: 'hot enabled',
      options: {
        hot: true,
      },
    },
    {
      title: 'liveReload disabled',
      options: {
        liveReload: false,
      },
    },
    {
      title: 'liveReload enabled',
      options: {
        liveReload: true,
      },
    },
    {
      title: 'liveReload & hot are disabled',
      options: {
        liveReload: false,
        hot: false,
      },
    },
    {
      title: 'liveReload & hot are enabled',
      options: {
        liveReload: true,
        hot: true,
      },
    },
    {
      title: 'client logging is none',
      options: {
        client: {
          logging: 'none',
        },
      },
    },
  ];

  webSocketServerTypesLog.forEach((mode) => {
    cases.forEach(({ title, options }) => {
      title += ` (${
          Object.keys(mode).length ? mode.webSocketServer : 'default'
      })`;

      options = { ...mode, ...options };

      it(title, async () => {
        const compiler = webpack(config);
        const devServerOptions = Object.assign(
            {},
            {
              host: '0.0.0.0',
              port,
              static: false,
            },
            options
        );
        const server = new Server(devServerOptions, compiler);

        await new Promise((resolve, reject) => {
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
        });

        const { page, browser } = await runBrowser();

        const consoleMessages = [];

        page.on('console', (message) => {
          consoleMessages.push(message);
        });

        await page.goto(`http://localhost:${port}/main`, {
          waitUntil: 'networkidle0',
        });

        await browser.close();

        expect(
            consoleMessages.map((message) => message.text())
        ).toMatchSnapshot();

        await new Promise((resolve) => {
          server.close(() => {
            resolve();
          });
        });
      });
    });
  });
});
