'use strict';

const testServer = require('../helpers/test-server');
const config = require('../fixtures/client-config/webpack.config');
const runBrowser = require('../helpers/run-browser');

describe('clientMode', () => {
  describe('sockjs', () => {
    beforeAll((done) => {
      const options = {
        port: 9000,
        host: '0.0.0.0',
        inline: true,
        clientMode: 'sockjs',
      };
      testServer.startAwaitingCompilation(config, options, done);
    });

    afterAll(testServer.close);

    describe('on browser client', () => {
      it('logs as usual', (done) => {
        runBrowser().then(({ page, browser }) => {
          const res = [];
          page.goto('http://localhost:9000/main');
          page.on('console', ({ _text }) => {
            res.push(_text);
          });

          setTimeout(() => {
            expect(res).toMatchSnapshot();
            browser.close().then(done);
          }, 3000);
        });
      });
    });
  });

  describe('custom client', () => {
    beforeAll((done) => {
      const options = {
        port: 9000,
        host: '0.0.0.0',
        inline: true,
        clientMode: require.resolve(
          '../fixtures/custom-client/CustomSockJSClient'
        ),
      };
      testServer.startAwaitingCompilation(config, options, done);
    });

    afterAll(testServer.close);

    describe('on browser client', () => {
      it('logs additional messages to console', (done) => {
        runBrowser().then(({ page, browser }) => {
          const res = [];
          page.goto('http://localhost:9000/main');
          page.on('console', ({ _text }) => {
            res.push(_text);
          });

          setTimeout(() => {
            expect(res).toMatchSnapshot();
            browser.close().then(done);
          }, 3000);
        });
      });
    });
  });
});
