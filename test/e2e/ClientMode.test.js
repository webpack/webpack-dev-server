'use strict';

const testServer = require('../helpers/test-server');
const config = require('../fixtures/client-config/webpack.config');
const runBrowser = require('../helpers/run-browser');
const port = require('../ports-map').ClientMode;

describe('clientMode', () => {
  const modes = [
    {
      title: 'sockjs',
      options: {
        clientMode: 'sockjs',
      },
    },
    {
      title: 'ws',
      options: {
        clientMode: 'ws',
        serverMode: require.resolve('../../lib/servers/WebsocketServer'),
      },
    },
    {
      title: 'custom client',
      options: {
        clientMode: require.resolve(
          '../fixtures/custom-client/CustomSockJSClient'
        ),
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
});
