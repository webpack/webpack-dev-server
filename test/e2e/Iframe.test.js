'use strict';

const testServer = require('../helpers/test-server');
const config = require('../fixtures/client-config/webpack.config');
const runBrowser = require('../helpers/run-browser');
const port = require('../ports-map').Iframe;

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

  for (const { title, options } of cases) {
    it(title, () => {
      const res = [];
      const testOptions = Object.assign({}, baseOptions, options);

      // TODO: use async/await when Node.js v6 support is dropped
      return Promise.resolve()
        .then(() => {
          return new Promise((resolve) => {
            testServer.startAwaitingCompilation(config, testOptions, resolve);
          });
        })
        .then(runBrowser)
        .then(({ page, browser }) => {
          return new Promise((resolve) => {
            page.goto(`http://localhost:${port}/webpack-dev-server/main`);
            page.on('console', ({ _text }) => {
              res.push(_text);
            });
            setTimeout(() => {
              browser.close().then(() => {
                expect(res).toMatchSnapshot();
                resolve();
              });
            }, 3000);
          });
        })
        .then(() => {
          return new Promise((resolve) => {
            testServer.close(resolve);
          });
        });
    });
  }
});
