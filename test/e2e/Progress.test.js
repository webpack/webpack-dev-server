'use strict';

/* eslint-disable
  no-undef
*/
const fs = require('fs');
const { resolve } = require('path');
const testServer = require('../helpers/test-server');
const reloadConfig = require('../fixtures/reload-config/webpack.config');
const runBrowser = require('../helpers/run-browser');

const cssFilePath = resolve(__dirname, '../fixtures/reload-config/main.css');

describe('client progress', () => {
  describe('using hot', () => {
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
        progress: true,
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
      it('should console.log progress', (done) => {
        runBrowser().then(({ page, browser }) => {
          const res = [];
          page.waitForNavigation({ waitUntil: 'load' }).then(() => {
            fs.writeFileSync(
              cssFilePath,
              'body { background-color: rgb(255, 0, 0); }'
            );
            page.waitFor(10000).then(() => {
              const testExp = /\[WDS\] [0-9]{1,3}% - compiling\./;
              const match = res.find((line) => {
                return testExp.test(line);
              });
              // eslint-disable-next-line no-undefined
              expect(match).not.toEqual(undefined);
              browser.close().then(done);
            });
          });

          page.goto('http://localhost:9000/main');
          page.on('console', ({ _text }) => {
            res.push(_text);
          });
        });
      });
    });
  });
});
