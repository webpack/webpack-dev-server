'use strict';

/* eslint-disable
  no-undef
*/
const fs = require('fs');
const { resolve } = require('path');
const reloadConfig = require('../fixtures/reload-config/webpack.config');
const { writeAsync } = require('../helpers/fs');
const testServer = require('../helpers/test-server');
const runBrowser = require('../helpers/run-browser');
const port = require('../ports-map').Client;

const cssFilePath = resolve(__dirname, '../fixtures/reload-config/main.css');

describe('reload', () => {
  describe('hot', () => {
    beforeAll((done) => {
      fs.writeFileSync(
        cssFilePath,
        'body { background-color: rgb(0, 0, 255); }'
      );
      const options = {
        port,
        host: '0.0.0.0',
        inline: true,
        hot: true,
        watchOptions: {
          poll: 500,
        },
      };
      testServer.startAwaitingCompilation(reloadConfig, options, done);
    });

    afterAll((done) => {
      fs.unlinkSync(cssFilePath);
      testServer.close(done);
    });

    describe('on browser client', () => {
      it('should hot reload without page refresh', async () => {
        const { page, browser } = await runBrowser();
        let refreshed = false;

        page.goto(`http://localhost:${port}/main`);
        await page.waitForNavigation({ waitUntil: 'load' });

        {
          const color = await page.evaluate(() => {
            const body = document.body;
            const bgColor = getComputedStyle(body)['background-color'];
            return bgColor;
          });
          expect(color).toEqual('rgb(0, 0, 255)');
        }

        await page.setRequestInterception(true);

        page.on('request', (req) => {
          if (
            req.isNavigationRequest() &&
            req.frame() === page.mainFrame() &&
            req.url() === `http://localhost:${port}/main`
          ) {
            refreshed = true;
          }
          req.continue();
        });

        await writeAsync(
          cssFilePath,
          'body { background-color: rgb(255, 0, 0); }'
        );

        await page.waitFor(10000);

        expect(refreshed).toBeFalsy();

        {
          const color = await page.evaluate(() => {
            const body = document.body;
            const bgColor = getComputedStyle(body)['background-color'];
            return bgColor;
          });
          expect(color).toEqual('rgb(255, 0, 0)');
        }
        await browser.close();
      });
    });
  });
});
