'use strict';

/* eslint-disable
  no-undef
*/
const fs = require('fs');
const path = require('path');
const testServer = require('../helpers/test-server');
const reloadConfig = require('../fixtures/reload-config/webpack.config');
const runBrowser = require('../helpers/run-browser');

describe('client progress', () => {
  describe('using hot', () => {
    const cssFilePath = path.resolve(__dirname, '../temp/main.css');
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
      testServer.close(done);
    });

    describe('on browser client', () => {
      jest.setTimeout(30000);

      it('should console.log progress', (done) => {
        runBrowser().then(({ page, browser }) => {
          const res = [];
          page.waitForNavigation({ waitUntil: 'load' }).then(() => {
            fs.writeFileSync(
              cssFilePath,
              'body { background-color: rgb(255, 0, 0); }'
            );
            page.waitFor(10000).then(() => {
              expect(res.includes('[WDS] 0% - compiling.')).toBeTruthy();
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
