'use strict';

const testServer = require('../helpers/test-server');
const config = require('../fixtures/provide-plugin-config/webpack.config');
const runBrowser = require('../helpers/run-browser');

describe('ProvidePlugin', () => {
  describe('inline', () => {
    beforeAll((done) => {
      const options = {
        port: 9000,
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
            page
              .evaluate(() => {
                return window.injectedClient === window.expectedClient;
              })
              .then((isCorrectClient) => {
                expect(isCorrectClient).toBeTruthy();
                browser.close().then(done);
              });
          });
          page.goto('http://localhost:9000/main');
        });
      });
    });
  });

  describe('not inline', () => {
    beforeAll((done) => {
      const options = {
        port: 9000,
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
            page
              .evaluate(() => {
                // eslint-disable-next-line no-undefined
                return window.injectedClient === undefined;
              })
              .then((isCorrectClient) => {
                expect(isCorrectClient).toBeTruthy();
                browser.close().then(done);
              });
          });
          page.goto('http://localhost:9000/main');
        });
      });
    });
  });
});
