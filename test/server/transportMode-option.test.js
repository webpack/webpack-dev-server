'use strict';

/* eslint-disable
  class-methods-use-this
*/
const config = require('../fixtures/simple-config/webpack.config');
const port = require('../ports-map')['transportMode-option'];

describe('transportMode', () => {
  describe.skip('client', () => {
    let mockedTestServer;
    let testServer;
    let getSocketClientPath;

    const clientModes = [
      {
        title: 'as a string ("sockjs")',
        transportMode: 'sockjs',
        shouldThrow: false,
      },
      {
        title: 'as a path ("sockjs")',
        transportMode: {
          client: require.resolve('../../client-src/clients/SockJSClient'),
        },
        shouldThrow: false,
      },
      {
        title: 'as a nonexistent path',
        transportMode: {
          client: '/bad/path/to/implementation',
        },
        shouldThrow: true,
      },
    ];

    describe('is passed to getSocketClientPath correctly', () => {
      beforeEach(() => {
        jest.mock('../../lib/utils/getSocketClientPath');
        getSocketClientPath = require('../../lib/utils/getSocketClientPath');
      });

      afterEach((done) => {
        jest.resetAllMocks();
        jest.resetModules();

        mockedTestServer.close(done);
      });

      clientModes.forEach((data) => {
        it(data.title, (done) => {
          mockedTestServer = require('../helpers/test-server');
          mockedTestServer.start(
            config,
            {
              transportMode: data.transportMode,
              port,
            },
            () => {
              expect(getSocketClientPath.mock.calls.length).toEqual(1);
              expect(getSocketClientPath.mock.calls[0].length).toEqual(1);
              if (typeof data.transportMode === 'string') {
                expect(
                  getSocketClientPath.mock.calls[0][0].transportMode
                ).toMatchSnapshot();
              } else {
                expect(
                  getSocketClientPath.mock.calls[0][0].transportMode
                ).toEqual(data.transportMode);
              }

              done();
            }
          );
        });
      });
    });

    describe('passed to server', () => {
      beforeAll(() => {
        jest.unmock('../../lib/utils/getSocketClientPath');
        testServer = require('../helpers/test-server');
      });

      afterEach((done) => {
        testServer.close(done);
      });

      clientModes.forEach((data) => {
        it(`${data.title} ${
          data.shouldThrow ? 'should throw' : 'should not throw'
        }`, (done) => {
          const res = () => {
            testServer.start(
              config,
              {
                transportMode: data.transportMode,
                port,
              },
              done
            );
          };
          if (data.shouldThrow) {
            expect(res).toThrow(/transportMode\.client must be a string/);
            done();
          } else {
            expect(res).not.toThrow();
          }
        });
      });
    });
  });
});
