/**
 * @jest-environment node
 */

'use strict';

/* eslint-disable
  no-undef
*/
const { resolve } = require('path');
const fs = require('graceful-fs');
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
      title: 'hot with default transportMode.client (ws)',
      shouldRefresh: false,
    },
    {
      title: 'hot with sockjs websocket server',
      options: {
        webSocketServer: 'sockjs',
      },
      shouldRefresh: false,
    },
    {
      title: 'hot with ws websocket server',
      options: {
        webSocketServer: 'ws',
      },
      shouldRefresh: false,
    },
    {
      title: 'reload without hot',
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
            static: false,
            port,
            host: '0.0.0.0',
          },
          mode.options
        );

        // we need a delay between file writing and the start
        // of the compilation due to a bug in webpack@4, as not doing
        // so results in the done hook being called repeatedly
        setTimeout(() => {
          testServer.startAwaitingCompilation(reloadConfig, options, done);
        }, 2000);
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
                      console.log(req.url());
                      if (
                        req.isNavigationRequest() &&
                        req.frame() === page.mainFrame() &&
                        req.url() === `http://localhost:${port}/main`
                      ) {
                        refreshed = true;
                      }

                      req.continue();
                    });
                    page.waitForTimeout(reloadReadyDelay).then(() => {
                      fs.writeFileSync(
                        cssFilePath,
                        'body { background-color: rgb(255, 0, 0); }'
                      );
                      page.waitForTimeout(completeReloadDelay).then(() => {
                        page
                          .evaluate(() => {
                            const body = document.body;
                            const bgColor =
                              getComputedStyle(body)['background-color'];

                            return bgColor;
                          })
                          .then((color2) => {
                            expect(color).toEqual('rgb(0, 0, 255)');
                            expect(color2).toEqual('rgb(255, 0, 0)');
                            expect(refreshed).toEqual(mode.shouldRefresh);

                            return browser.close();
                          })
                          .then(() => {
                            done();
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
