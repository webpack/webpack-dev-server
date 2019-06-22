'use strict';

/* eslint-disable
  no-undef
*/
const fs = require('fs');
const { resolve } = require('path');
const testServer = require('../helpers/test-server');
const reloadConfig = require('../fixtures/reload-config/webpack.config');
const runBrowser = require('../helpers/run-browser');
const startProxy = require('../helpers/start-proxy');
const [port1, port2] = require('../ports-map').PublicPath;

const cssFilePath = resolve(__dirname, '../fixtures/reload-config/main.css');

describe('publicPath', () => {
  describe('hot', () => {
    let proxy;
    beforeAll((done) => {
      fs.writeFileSync(
        cssFilePath,
        'body { background-color: rgb(0, 0, 255); }'
      );
      const options = {
        port: port1,
        host: '0.0.0.0',
        inline: true,
        hot: true,
        watchOptions: {
          poll: 500,
        },
        publicPath: '/long/dist/path/',
      };
      testServer.startAwaitingCompilation(reloadConfig, options, () => {
        proxy = startProxy(port2, port1, done);
      });
    });

    afterAll((done) => {
      fs.unlinkSync(cssFilePath);
      testServer.close(() => {
        proxy.close(done);
      });
    });

    describe('on browser client', () => {
      it('should hot reload and request correct hot-update.json path', (done) => {
        runBrowser().then(({ page, browser }) => {
          let refreshed = false;
          let requestedHotUpdate = false;
          const hotUpdateRegExp = new RegExp(
            // eslint-disable-next-line no-useless-escape
            `^http\:\/\/localhost\:${port1}\/long\/dist\/path\/.*\.hot\-update\.json$`,
            'g'
          );
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
                      req.url() === `http://localhost:${port2}/main`
                    ) {
                      refreshed = true;
                    } else if (hotUpdateRegExp.test(req.url())) {
                      requestedHotUpdate = true;
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
                          expect(requestedHotUpdate).toBeTruthy();
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

          page.goto(`http://localhost:${port1}/long/dist/path/main`);
        });
      });
    });
  });
});
