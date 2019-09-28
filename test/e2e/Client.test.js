/**
 * @jest-environment node
 */

'use strict';

/* eslint-disable
  no-undef
*/
const fs = require('fs');
const { resolve } = require('path');
const testServer = require('../helpers/test-server');
const reloadConfig = require('../fixtures/reload-config/webpack.config');
const runBrowser = require('../helpers/run-browser');
const port = require('../ports-map').Client;
const {
  reloadReadyDelay,
  completeReloadDelay,
} = require('../helpers/puppeteer-constants');

const cssFilePath = resolve(__dirname, '../fixtures/reload-config/main.css');

describe('reload', () => {
  const modes = [
    {
      title: 'hot with default transportMode.client (sockjs)',
      options: {
        hot: true,
      },
      shouldRefresh: false,
    },
    {
      title: 'hot with transportMode.client ws',
      options: {
        hot: true,
        transportMode: 'ws',
      },
      shouldRefresh: false,
    },
    {
      title: 'inline',
      options: {
        hot: false,
      },
      shouldRefresh: true,
    },
  ];

  modes.forEach((mode) => {
    describe(mode.title, () => {
      beforeAll((done) => {
        fs.writeFileSync(
          cssFilePath,
          'body { background-color: rgb(0, 0, 255); }'
        );
        const options = Object.assign(
          {},
          {
            port,
            host: '0.0.0.0',
            inline: true,
            watchOptions: {
              poll: true,
            },
          },
          mode.options
        );
        testServer.startAwaitingCompilation(reloadConfig, options, done);
      });

      afterAll((done) => {
        fs.unlinkSync(cssFilePath);
        testServer.close(done);
      });

      describe('on browser client', () => {
        it(`should reload ${
          mode.shouldRefresh ? 'with' : 'without'
        } page refresh`, (done) => {
          runBrowser().then(({ page, browser }) => {
            let refreshed = false;
            page.waitForNavigation({ waitUntil: 'load' }).then(() => {
              page
                .evaluate(() => {
                  const body = document.body;
                  const bgColor = getComputedStyle(body)['background-color'];
                  return bgColor;
                })
                .then((color) => {
                  page.setRequestInterception(true).then(() => {
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
                    page.waitFor(reloadReadyDelay).then(() => {
                      fs.writeFileSync(
                        cssFilePath,
                        'body { background-color: rgb(255, 0, 0); }'
                      );
                      page.waitFor(completeReloadDelay).then(() => {
                        page
                          .evaluate(() => {
                            const body = document.body;
                            const bgColor = getComputedStyle(body)[
                              'background-color'
                            ];
                            return bgColor;
                          })
                          .then((color2) => {
                            browser.close().then(() => {
                              expect(color).toEqual('rgb(0, 0, 255)');
                              expect(color2).toEqual('rgb(255, 0, 0)');
                              expect(refreshed).toEqual(mode.shouldRefresh);
                              done();
                            });
                          });
                      });
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
});
