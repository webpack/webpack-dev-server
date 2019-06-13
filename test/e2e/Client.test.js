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
      it('should hot reload without page refresh', (done) => {
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
                  fs.writeFileSync(
                    cssFilePath,
                    'body { background-color: rgb(255, 0, 0); }'
                  );
                  page.waitFor(10000).then(() => {
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
                          expect(refreshed).toBeFalsy();
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

  describe('inline', () => {
    beforeAll((done) => {
      fs.writeFileSync(
        cssFilePath,
        'body { background-color: rgb(0, 0, 255); }'
      );
      const options = {
        port,
        host: '0.0.0.0',
        inline: true,
        hot: false,
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
      it('should reload with page refresh', (done) => {
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
                  fs.writeFileSync(
                    cssFilePath,
                    'body { background-color: rgb(255, 0, 0); }'
                  );
                  page.waitFor(10000).then(() => {
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
                          expect(refreshed).toBeTruthy();
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
