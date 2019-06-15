'use strict';

const testServer = require('../helpers/test-server');
const config = require('../fixtures/provide-plugin-config/webpack.config');
const runBrowser = require('../helpers/run-browser');
const port = require('../ports-map').ProvidePlugin;

describe('ProvidePlugin', () => {
  describe('inline', () => {
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
      it('should inject SockJS client implementation', async () => {
        const { page, browser } = await runBrowser();

        page.goto(`http://localhost:${port}/main`);
        await page.waitForNavigation({ waitUntil: 'load' });

        const isCorrectClient = await page.evaluate(() => {
          return window.injectedClient === window.expectedClient;
        });

        await browser.close();

        expect(isCorrectClient).toBeTruthy();
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
      it('should not inject client implementation', async () => {
        const { page, browser } = await runBrowser();

        page.goto(`http://localhost:${port}/main`);

        await page.waitForNavigation({ waitUntil: 'load' });

        const isCorrectClient = await page.evaluate(() => {
          // eslint-disable-next-line no-undefined
          return window.injectedClient === undefined;
        });

        await browser.close();

        expect(isCorrectClient).toBeTruthy();
      });
    });
  });
});
