'use strict';

const testServer = require('../helpers/test-server');
const sockjsConfig = require('../fixtures/provide-plugin-sockjs-config/webpack.config');
const wsConfig = require('../fixtures/provide-plugin-ws-config/webpack.config');
const runBrowser = require('../helpers/run-browser');
const port = require('../ports-map').ProvidePlugin;
const { beforeBrowserCloseDelay } = require('../helpers/puppeteer-constants');

describe('ProvidePlugin', () => {
  describe('default client.transport (ws)', () => {
    beforeAll((done) => {
      const options = {
        port,
        host: '0.0.0.0',
      };
      testServer.startAwaitingCompilation(wsConfig, options, done);
    });

    afterAll(testServer.close);

    describe('on browser client', () => {
      it('should inject ws client implementation', (done) => {
        runBrowser().then(({ page, browser }) => {
          page.waitForNavigation({ waitUntil: 'load' }).then(() => {
            page.waitForTimeout(beforeBrowserCloseDelay).then(() => {
              page
                .evaluate(() => window.injectedClient === window.expectedClient)
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

  describe('with client.transport sockjs', () => {
    beforeAll((done) => {
      const options = {
        port,
        host: '0.0.0.0',
        client: {
          transport: 'sockjs',
        },
      };
      testServer.startAwaitingCompilation(sockjsConfig, options, done);
    });

    afterAll(testServer.close);

    describe('on browser client', () => {
      it('should inject sockjs client implementation', (done) => {
        runBrowser().then(({ page, browser }) => {
          page.waitForNavigation({ waitUntil: 'load' }).then(() => {
            page.waitForTimeout(beforeBrowserCloseDelay).then(() => {
              page
                .evaluate(() => window.injectedClient === window.expectedClient)
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
