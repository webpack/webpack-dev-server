'use strict';

const request = require('supertest');
const config = require('../fixtures/simple-config/webpack.config');
const testServer = require('../helpers/test-server');
const port = require('../ports-map')['client-option'];

describe('client option', () => {
  let server;
  let req;

  afterEach((done) => {
    testServer.close(done);
    req = null;
    server = null;
  });

  describe('default behavior', () => {
    beforeEach((done) => {
      server = testServer.start(
        config,
        {
          client: {
            transport: 'sockjs',
          },
          webSocketServer: 'sockjs',
          port,
        },
        done
      );
      req = request(`http://localhost:${port}`);
    });

    it('overlay true by default', () => {
      expect(server.options.client.overlay).toBe(true);
    });

    it('responds with a 200', async () => {
      const res = await req.get('/ws');
      expect(res.status).toEqual(200);
    });
  });

  describe('path option', () => {
    const path = '/foo/test/bar';

    beforeEach((done) => {
      server = testServer.start(
        config,
        {
          client: {
            transport: 'sockjs',
          },
          webSocketServer: {
            type: 'sockjs',
            options: {
              host: 'localhost',
              port,
              path: '/foo/test/bar',
            },
          },
          port,
        },
        done
      );
      req = request(`http://localhost:${port}`);
    });

    it('responds with a 200 second', async () => {
      const res = await req.get(path);
      expect(res.status).toEqual(200);
    });
  });

  describe('configure client entry', () => {
    it('disables client entry', (done) => {
      server = testServer.start(
        config,
        {
          client: {
            needClientEntry: false,
          },
          port,
        },
        async () => {
          const res = await request(server.app).get('/main.js');
          expect(res.text).not.toMatch(/client\/index\.js/);
          done();
        }
      );
    });

    it('disables hot entry', (done) => {
      server = testServer.start(
        config,
        {
          client: {
            hotEntry: false,
          },
          port,
        },
        async () => {
          const res = await request(server.app).get('/main.js');
          expect(res.text).not.toMatch(/webpack\/hot\/dev-server\.js/);
          done();
        }
      );
    });
  });

  describe('transport', () => {
    const clientModes = [
      {
        title: 'as a string ("sockjs")',
        client: {
          transport: 'sockjs',
        },
        webSocketServer: 'sockjs',
        shouldThrow: false,
      },
      {
        title: 'as a path ("sockjs")',
        client: {
          transport: require.resolve('../../client-src/clients/SockJSClient'),
        },
        webSocketServer: 'sockjs',
        shouldThrow: false,
      },
      {
        title: 'as a nonexistent path',
        client: {
          transport: '/bad/path/to/implementation',
        },
        webSocketServer: 'sockjs',
        shouldThrow: true,
      },
    ];

    describe('passed to server', () => {
      beforeAll(() => {
        jest.unmock('../../lib/utils/getSocketClientPath');
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
                client: data.client,
                port,
              },
              done
            );
          };
          if (data.shouldThrow) {
            expect(res).toThrow(/client\.transport must be a string/);
            done();
          } else {
            expect(res).not.toThrow();
          }
        });
      });
    });
  });
});
