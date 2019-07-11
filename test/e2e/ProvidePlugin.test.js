'use strict';

const testServer = require('../helpers/test-server');
const config = require('../fixtures/provide-plugin-config/webpack.config');
const wsConfig = require('../fixtures/provide-plugin-ws-config/webpack.config');
const runBrowser = require('../helpers/run-browser');
const port = require('../ports-map').ProvidePlugin;
const { beforeBrowserCloseDelay } = require('../helpers/puppeteer-constants');

describe('ProvidePlugin', () => {
  describe('inline with default transportMode.client (sockjs)', () => {
    beforeAll((done) => {
      const options = {
        port,
        host: '0.0.0.0',
        inline: true,
        watchOptions: {
          poll: true,
        },
      };
      testServer.startAwaitingCompilation(config, options, done);
    });

    afterAll(testServer.close);

    describe('on browser client', () => {
      it('should inject SockJS client implementation', (done) => {
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

  describe('inline with transportMode.client ws', () => {
    beforeAll((done) => {
      const options = {
        port,
        host: '0.0.0.0',
        inline: true,
        transportMode: 'ws',
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

  describe('not inline', () => {
    beforeAll((done) => {
      const options = {
        port,
        host: '0.0.0.0',
        inline: false,
        watchOptions: {
          poll: true,
        },
      };
      testServer.startAwaitingCompilation(config, options, done);
    });

    afterAll(testServer.close);

    describe('on browser client', () => {
      it('should not inject client implementation', (done) => {
        runBrowser().then(({ page, browser }) => {
          page.waitForNavigation({ waitUntil: 'load' }).then(() => {
            page.waitFor(beforeBrowserCloseDelay).then(() => {
              page
                .evaluate(() => {
                  // eslint-disable-next-line no-undefined
                  return window.injectedClient === undefined;
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
