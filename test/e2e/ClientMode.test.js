'use strict';

const testServer = require('../helpers/test-server');
const config = require('../fixtures/client-config/webpack.config');
const runBrowser = require('../helpers/run-browser');
const port = require('../ports-map').ClientMode;

describe('clientMode', () => {
  describe('sockjs', () => {
    beforeAll((done) => {
      const options = {
        port,
        host: '0.0.0.0',
        inline: true,
        clientMode: 'sockjs',
      };
      testServer.startAwaitingCompilation(config, options, done);
    });

    describe('on browser client', () => {
      it('logs as usual', (done) => {
        runBrowser().then(({ page, browser }) => {
          const res = [];
          page.goto(`http://localhost:${port}/main`);
          page.on('console', ({ _text }) => {
            res.push(_text);
          });

          setTimeout(() => {
            testServer.close(() => {
              // make sure the client gets the close message
              setTimeout(() => {
                browser.close().then(() => {
                  expect(res).toMatchSnapshot();
                  done();
                });
              }, 1000);
            });
          }, 3000);
        });
      });
    });
  });

  describe('custom client', () => {
    beforeAll((done) => {
      const options = {
        port,
        host: '0.0.0.0',
        inline: true,
        clientMode: require.resolve(
          '../fixtures/custom-client/CustomSockJSClient'
        ),
      };
      testServer.startAwaitingCompilation(config, options, done);
    });

    describe('on browser client', () => {
      it('logs additional messages to console', (done) => {
        runBrowser().then(({ page, browser }) => {
          const res = [];
          page.goto(`http://localhost:${port}/main`);
          page.on('console', ({ _text }) => {
            res.push(_text);
          });

          setTimeout(() => {
            testServer.close(() => {
              // make sure the client gets the close message
              setTimeout(() => {
                browser.close().then(() => {
                  expect(res).toMatchSnapshot();
                  done();
                });
              }, 1000);
            });
          }, 3000);
        });
      });
    });
  });
});
