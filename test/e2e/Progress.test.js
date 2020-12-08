'use strict';

/* eslint-disable
  no-undef
*/
const fs = require('fs');
const { resolve } = require('path');
const reloadConfig = require('../fixtures/reload-config-2/webpack.config');
const runBrowser = require('../helpers/run-browser');
const port = require('../ports-map').Progress;
const {
  reloadReadyDelay,
  completeReloadDelay,
} = require('../helpers/puppeteer-constants');

const cssFilePath = resolve(__dirname, '../fixtures/reload-config-2/main.css');

describe('client progress', () => {
  let testServer;
  let processStderrMock;

  describe('using hot', () => {
    beforeAll((done) => {
      // ProgressPlugin uses process.stderr and reset webpack
      jest.resetModules();
      processStderrMock = jest
        .spyOn(process.stderr, 'write')
        .mockImplementation();
      testServer = require('../helpers/test-server');

      fs.writeFileSync(
        cssFilePath,
        'body { background-color: rgb(0, 0, 255); }'
      );

      const options = {
        port,
        host: '0.0.0.0',
        hot: true,
        client: {
          progress: true,
        },
      };

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
      processStderrMock.mockRestore();
    });

    describe('on browser client', () => {
      it('should console.log progress', (done) => {
        runBrowser().then(({ page, browser }) => {
          const res = [];
          page.waitForNavigation({ waitUntil: 'load' }).then(() => {
            page.waitForTimeout(reloadReadyDelay).then(() => {
              fs.writeFileSync(
                cssFilePath,
                'body { background-color: rgb(255, 0, 0); }'
              );
              page.waitForTimeout(completeReloadDelay).then(() => {
                browser.close().then(() => {
                  // check that there is some percentage progress output
                  const regExp = /^\[webpack-dev-server\] [0-9]{1,3}% - /;
                  const match = res.find((line) => regExp.test(line));
                  // eslint-disable-next-line no-undefined
                  expect(match).not.toEqual(undefined);
                  done();
                });
              });
            });
          });

          page.goto(`http://localhost:${port}/main`);
          page.on('console', (data) => {
            res.push(data.text());
          });
        });
      });
    });
  });
});
