'use strict';

const testServer = require('../helpers/test-server');
const config = require('../fixtures/client-config/webpack.config');
const runBrowser = require('../helpers/run-browser');
const port = require('../ports-map').logging;
const { beforeBrowserCloseDelay } = require('../helpers/puppeteer-constants');

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
      title: 'client logging is none',
      options: {
        client: {
          logging: 'none',
        },
      },
    },
  ];

  webSocketServerTypesLog.forEach(async (mode) => {
    cases.forEach(async ({ title, options }) => {
      title += ` (${
        Object.keys(mode).length ? mode.webSocketServer : 'default'
      })`;

      options = { ...mode, ...options };

      const testOptions = Object.assign({}, baseOptions, options);

      it(title, (done) => {
        testServer.startAwaitingCompilation(config, testOptions, async () => {
          const res = [];
          const { page, browser } = await runBrowser();

          page.goto(`http://localhost:${port}/main`);
          page.on('console', ({ _text }) => {
            res.push(_text);
          });

          // wait for load before closing the browser
          await page.waitForNavigation({ waitUntil: 'load' });
          await page.waitForTimeout(beforeBrowserCloseDelay);
          await browser.close();

          // Order doesn't matter, maybe we should improve that in future
          await expect(res.sort()).toMatchSnapshot();
          await testServer.close(done);
        });
      });
    });
  });
});
