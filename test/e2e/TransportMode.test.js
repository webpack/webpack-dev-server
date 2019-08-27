'use strict';

const testServer = require('../helpers/test-server');
const config = require('../fixtures/client-config/webpack.config');
const runBrowser = require('../helpers/run-browser');
const port = require('../ports-map').TransportMode;
const {
  initConsoleDelay,
  awaitServerCloseDelay,
} = require('../helpers/puppeteer-constants');

describe('transportMode client', () => {
  const modes = [
    {
      title: 'sockjs',
      options: {
        transportMode: 'sockjs',
      },
    },
    {
      title: 'ws',
      options: {
        transportMode: 'ws',
      },
    },
    {
      title: 'custom client',
      options: {
        transportMode: {
          server: 'sockjs',
          client: require.resolve(
            '../fixtures/custom-client/CustomSockJSClient'
          ),
        },
      },
    },
  ];

  modes.forEach((mode) => {
    describe(mode.title, () => {
      beforeAll((done) => {
        const options = Object.assign(
          {},
          {
            port,
            host: '0.0.0.0',
            inline: true,
          },
          mode.options
        );
        testServer.startAwaitingCompilation(config, options, done);
      });

      describe('on browser client', () => {
        it('logs correctly', (done) => {
          runBrowser().then(({ page, browser }) => {
            const res = [];
            page.goto(`http://localhost:${port}/main`);
            page.on('console', ({ _text }) => {
              res.push(_text);
            });

            page.waitFor(initConsoleDelay).then(() => {
              testServer.close(() => {
                // make sure the client gets the close message
                page.waitFor(awaitServerCloseDelay).then(() => {
                  browser.close().then(() => {
                    for (let i = res.length - 1; i >= 0; i--) {
                      if (res[i] === '[WDS] Disconnected!') {
                        break;
                      } else if (
                        res[i] === 'close' ||
                        res[i].includes('net::ERR_CONNECTION_REFUSED')
                      ) {
                        // remove additional logging for the now failing connection,
                        // since this could be a variable number of error messages
                        res.splice(i, 1);
                      }
                    }
                    expect(res).toMatchSnapshot();
                    done();
                  });
                });
              });
            });
          });
        });
      });
    });
  });
});
