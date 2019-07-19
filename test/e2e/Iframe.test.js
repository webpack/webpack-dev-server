'use strict';

const testServer = require('../helpers/test-server');
const config = require('../fixtures/client-config/webpack.config');
const runBrowser = require('../helpers/run-browser');
const port = require('../ports-map').Iframe;
const { beforeBrowserCloseDelay } = require('../helpers/puppeteer-constants');

// iframe mode should be tested while still supported, because
// its sources differ from those of inline mode, which can cause unexpected
// breaking changes: https://github.com/webpack/webpack-dev-server/issues/2006
describe('Client iframe console.log', () => {
  const baseOptions = {
    port,
    host: '0.0.0.0',
  };
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
      title: 'clientLogLevel is silent',
      options: {
        clientLogLevel: 'silent',
      },
    },
  ];

  cases.forEach(({ title, options }) => {
    it(title, (done) => {
      const res = [];
      const testOptions = Object.assign({}, baseOptions, options);

      // TODO: use async/await when Node.js v6 support is dropped
      Promise.resolve()
        .then(() => {
          return new Promise((resolve) => {
            testServer.startAwaitingCompilation(config, testOptions, resolve);
          });
        })
        .then(() => {
          // make sure the previous Promise is not passing along strange arguments to runBrowser
          return runBrowser();
        })
        .then(({ page, browser }) => {
          return new Promise((resolve) => {
            page.goto(`http://localhost:${port}/webpack-dev-server/main`);
            page.on('console', ({ _text }) => {
              res.push(_text);
            });
            page.waitForNavigation({ waitUntil: 'load' }).then(() => {
              page.waitFor(beforeBrowserCloseDelay).then(() => {
                browser.close().then(() => {
                  resolve();
                });
              });
            });
          });
        })
        .then(() => {
          return new Promise((resolve) => {
            testServer.close(resolve);
          });
        })
        .then(() => {
          expect(res).toMatchSnapshot();
          done();
        });
    });
  });
});
