'use strict';

const testServer = require('../helpers/test-server');
const sockjsConfig = require('../fixtures/provide-plugin-sockjs-config/webpack.config');
const wsConfig = require('../fixtures/provide-plugin-ws-config/webpack.config');
const runBrowser = require('../helpers/run-browser');
const port = require('../ports-map').ProvidePlugin;
const { beforeBrowserCloseDelay } = require('../helpers/puppeteer-constants');

describe('ProvidePlugin', () => {
  describe('default transportMode.client (ws)', () => {
    beforeAll((done) => {
      const options = {
        port,
        host: '0.0.0.0',
        watchOptions: {
          poll: true,
        },
      };
      testServer.startAwaitingCompilation(wsConfig, options, done);
    });

    afterAll(testServer.close);

    describe('on browser client', () => {
      it('should inject ws client implementation', (done) => {
        runBrowser().then(({ page, browser }) => {
          page.waitForNavigation({ waitUntil: 'load' }).then(() => {
            page.waitFor(beforeBrowserCloseDelay).then(() => {
              page
                .evaluate(() => {
                  return window.injectedClient === window.expectedClient;
                })
                .then((isCorrectClient) => {
                  browser.close().then(() => {
                    expect(isCorrectClient).toBeTruthy();
                    done();
                  });
                });
            });
          });
          page.goto(`http://localhost:${port}/main`);
        });
      });
    });
  });

  describe('with transportMode.client sockjs', () => {
    beforeAll((done) => {
      const options = {
        port,
        host: '0.0.0.0',
        transportMode: 'sockjs',
        watchOptions: {
          poll: true,
        },
      };
      testServer.startAwaitingCompilation(sockjsConfig, options, done);
    });

    afterAll(testServer.close);

    describe('on browser client', () => {
      it('should inject sockjs client implementation', (done) => {
        runBrowser().then(({ page, browser }) => {
          page.waitForNavigation({ waitUntil: 'load' }).then(() => {
            page.waitFor(beforeBrowserCloseDelay).then(() => {
              page
                .evaluate(() => {
                  return window.injectedClient === window.expectedClient;
                })
                .then((isCorrectClient) => {
                  browser.close().then(() => {
                    expect(isCorrectClient).toBeTruthy();
                    done();
                  });
                });
            });
          });
          page.goto(`http://localhost:${port}/main`);
        });
      });
    });
  });
});
