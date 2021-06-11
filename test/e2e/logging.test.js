'use strict';

const testServer = require('../helpers/test-server');
const config = require('../fixtures/client-config/webpack.config');
const runBrowser = require('../helpers/run-browser');
const port = require('../ports-map').logging;

describe('logging', () => {
  const baseOptions = {
    host: '0.0.0.0',
    port,
  };
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

  webSocketServerTypesLog.forEach(async (mode) => {
    cases.forEach(({ title, options }) => {
      title += ` (${
        Object.keys(mode).length ? mode.webSocketServer : 'default'
      })`;

      options = { ...mode, ...options };

      it(title, (done) => {
        testServer.startAwaitingCompilation(
          config,
          Object.assign({}, baseOptions, options),
          async () => {
            const { page, browser } = await runBrowser();

            const consoleMessages = [];

            page.on('console', (message) => {
              consoleMessages.push(message);
            });

            await page.goto(`http://localhost:${port}/main`, {
              waitUntil: 'networkidle0',
            });

            await browser.close();

            // Order doesn't matter, maybe we should improve that in future
            expect(
              consoleMessages.map((message) => message.text())
            ).toMatchSnapshot();

            await testServer.close(done);
          }
        );
      });
    });
  });
});
