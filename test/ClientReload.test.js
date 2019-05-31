'use strict';

/* eslint-disable
  no-undef
*/
const fs = require('fs');
const path = require('path');
const testServer = require('./helpers/test-server');
const reloadConfig = require('./fixtures/reload-config/webpack.config');
const runBrowser = require('./helpers/run-browser');

describe('reload', () => {
  describe('hot', () => {
    const cssFilePath = path.resolve(__dirname, 'temp/main.css');
    beforeAll((done) => {
      fs.writeFileSync(
        cssFilePath,
        'body { background-color: rgb(0, 0, 255); }'
      );
      const options = {
        port: 9000,
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
      testServer.close(done);
    });

    describe('on browser client', () => {
      jest.setTimeout(30000);

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
                expect(color).toEqual('rgb(0, 0, 255)');

                page.setRequestInterception(true).then(() => {
                  page.on('request', (req) => {
                    if (
                      req.isNavigationRequest() &&
                      req.frame() === page.mainFrame() &&
                      req.url() === 'http://localhost:9000/main'
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
                    expect(refreshed).toBeFalsy();

                    page
                      .evaluate(() => {
                        const body = document.body;
                        const bgColor = getComputedStyle(body)[
                          'background-color'
                        ];
                        return bgColor;
                      })
                      .then((color2) => {
                        expect(color2).toEqual('rgb(255, 0, 0)');
                        browser.close().then(done);
                      });
                  });
                });
              });
          });

          page.goto('http://localhost:9000/main');
        });
      });
    });
  });

  describe('inline', () => {
    const cssFilePath = path.resolve(__dirname, 'temp/main.css');
    beforeAll((done) => {
      fs.writeFileSync(
        cssFilePath,
        'body { background-color: rgb(0, 0, 255); }'
      );
      const options = {
        port: 9000,
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
      testServer.close(done);
    });

    describe('on browser client', () => {
      jest.setTimeout(30000);

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
                expect(color).toEqual('rgb(0, 0, 255)');

                page.setRequestInterception(true).then(() => {
                  page.on('request', (req) => {
                    if (
                      req.isNavigationRequest() &&
                      req.frame() === page.mainFrame() &&
                      req.url() === 'http://localhost:9000/main'
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
                    expect(refreshed).toBeTruthy();

                    page
                      .evaluate(() => {
                        const body = document.body;
                        const bgColor = getComputedStyle(body)[
                          'background-color'
                        ];
                        return bgColor;
                      })
                      .then((color2) => {
                        expect(color2).toEqual('rgb(255, 0, 0)');
                        browser.close().then(done);
                      });
                  });
                });
              });
          });

          page.goto('http://localhost:9000/main');
        });
      });
    });
  });
});
