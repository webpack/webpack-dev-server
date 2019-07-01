'use strict';

/* eslint-disable
  class-methods-use-this
*/
const request = require('supertest');
const sockjs = require('sockjs');
const SockJS = require('sockjs-client/dist/sockjs');
const SockJSServer = require('../../lib/servers/SockJSServer');
const config = require('../fixtures/simple-config/webpack.config');
const BaseServer = require('../../lib/servers/BaseServer');
const port = require('../ports-map')['serverMode-option'];

describe('serverMode option', () => {
  let mockedTestServer;
  let testServer;
  let server;
  let req;
  let getSocketServerImplementation;

  const serverModes = [
    {
      title: 'as a string ("sockjs")',
      serverMode: 'sockjs',
    },
    {
      title: 'as a path ("sockjs")',
      serverMode: require.resolve('../../lib/servers/SockJSServer'),
    },
    {
      title: 'as a string ("ws")',
      serverMode: 'ws',
    },
    {
      title: 'as a path ("ws")',
      serverMode: require.resolve('../../lib/servers/WebsocketServer'),
    },
    {
      title: 'as a class (custom implementation)',
      serverMode: class CustomServer {},
    },
    {
      title: 'as a nonexistent path',
      serverMode: '/bad/path/to/implementation',
    },
  ];

  describe('is passed to getSocketServerImplementation correctly', () => {
    beforeEach(() => {
      jest.mock('../../lib/utils/getSocketServerImplementation');
      // eslint-disable-next-line global-require
      getSocketServerImplementation = require('../../lib/utils/getSocketServerImplementation');
      getSocketServerImplementation.mockImplementation(() => {
        return class MockServer {
          // eslint-disable-next-line no-empty-function
          onConnection() {}
        };
      });
    });

    afterEach((done) => {
      jest.resetAllMocks();
      jest.resetModules();

      mockedTestServer.close(done);
    });

    serverModes.forEach((data) => {
      it(data.title, (done) => {
        // eslint-disable-next-line global-require
        mockedTestServer = require('../helpers/test-server');
        mockedTestServer.start(
          config,
          {
            serverMode: data.serverMode,
            port,
          },
          () => {
            expect(getSocketServerImplementation.mock.calls.length).toEqual(1);
            expect(getSocketServerImplementation.mock.calls[0].length).toEqual(
              1
            );
            expect(
              getSocketServerImplementation.mock.calls[0][0].serverMode
            ).toEqual(data.serverMode);
            done();
          }
        );
      });
    });
  });

  describe('passed to server', () => {
    beforeAll(() => {
      jest.unmock('../../lib/utils/getSocketServerImplementation');
      // eslint-disable-next-line global-require
      testServer = require('../helpers/test-server');
    });

    afterEach((done) => {
      testServer.close(done);
      req = null;
      server = null;
    });

    describe('as a string ("sockjs")', () => {
      beforeEach((done) => {
        server = testServer.start(
          config,
          {
            serverMode: 'sockjs',
            port,
          },
          done
        );
        req = request(`http://localhost:${port}`);
      });

      it('sockjs path responds with a 200', (done) => {
        req.get('/sockjs-node').expect(200, done);
      });
    });

    describe('as a path ("sockjs")', () => {
      beforeEach((done) => {
        server = testServer.start(
          config,
          {
            serverMode: require.resolve('../../lib/servers/SockJSServer'),
            port,
          },
          done
        );
        req = request(`http://localhost:${port}`);
      });

      it('sockjs path responds with a 200', (done) => {
        req.get('/sockjs-node').expect(200, done);
      });
    });

    describe('as a class ("sockjs")', () => {
      beforeEach((done) => {
        server = testServer.start(
          config,
          {
            serverMode: SockJSServer,
            port,
          },
          done
        );
        req = request(`http://localhost:${port}`);
      });

      it('sockjs path responds with a 200', (done) => {
        req.get('/sockjs-node').expect(200, done);
      });
    });

    describe('as a class (custom "sockjs" implementation)', () => {
      let sockPath;
      it('uses supplied server implementation', (done) => {
        server = testServer.start(
          config,
          {
            port,
            sockPath: '/foo/test/bar/',
            serverMode: class MySockJSServer extends BaseServer {
              constructor(serv) {
                super(serv);
                this.socket = sockjs.createServer({
                  // Use provided up-to-date sockjs-client
                  sockjs_url: '/__webpack_dev_server__/sockjs.bundle.js',
                  // Limit useless logs
                  log: (severity, line) => {
                    if (severity === 'error') {
                      this.server.log.error(line);
                    } else {
                      this.server.log.debug(line);
                    }
                  },
                });

                this.socket.installHandlers(this.server.listeningApp, {
                  prefix: this.server.sockPath,
                });

                sockPath = server.options.sockPath;
              }

              send(connection, message) {
                connection.write(message);
              }

              close(connection) {
                connection.close();
              }

              onConnection(f) {
                this.socket.on('connection', (connection) => {
                  f(connection, connection.headers);
                });
              }

              onConnectionClose(connection, f) {
                connection.on('close', f);
              }
            },
          },
          () => {
            expect(sockPath).toEqual('/foo/test/bar/');
            done();
          }
        );
      });
    });

    describe('as a path with nonexistent path', () => {
      it('should throw an error', () => {
        expect(() => {
          server = testServer.start(
            config,
            {
              serverMode: '/bad/path/to/implementation',
              port,
            },
            () => {}
          );
        }).toThrow(/serverMode must be a string/);
      });
    });
  });

  describe('with a bad host header', () => {
    beforeAll((done) => {
      server = testServer.start(
        config,
        {
          port,
          serverMode: class MySockJSServer extends BaseServer {
            constructor(serv) {
              super(serv);
              this.socket = sockjs.createServer({
                // Use provided up-to-date sockjs-client
                sockjs_url: '/__webpack_dev_server__/sockjs.bundle.js',
                // Limit useless logs
                log: (severity, line) => {
                  if (severity === 'error') {
                    this.server.log.error(line);
                  } else {
                    this.server.log.debug(line);
                  }
                },
              });

              this.socket.installHandlers(this.server.listeningApp, {
                prefix: this.server.sockPath,
              });
            }

            send(connection, message) {
              connection.write(message);
            }

            close(connection) {
              connection.close();
            }

            onConnection(f) {
              this.socket.on('connection', (connection) => {
                f(connection, {
                  host: null,
                });
              });
            }

            onConnectionClose(connection, f) {
              connection.on('close', f);
            }
          },
        },
        done
      );
    });

    it('results in an error', (done) => {
      const data = [];
      const client = new SockJS(`http://localhost:${port}/sockjs-node`);

      client.onopen = () => {
        data.push('open');
      };

      client.onmessage = (e) => {
        data.push(e.data);
      };

      client.onclose = () => {
        data.push('close');
      };

      setTimeout(() => {
        expect(data).toMatchSnapshot();
        done();
      }, 5000);
    });
  });

  describe('without a header', () => {
    let mockWarn;
    beforeAll((done) => {
      server = testServer.start(
        config,
        {
          port,
          serverMode: class MySockJSServer extends BaseServer {
            constructor(serv) {
              super(serv);
              this.socket = sockjs.createServer({
                // Use provided up-to-date sockjs-client
                sockjs_url: '/__webpack_dev_server__/sockjs.bundle.js',
                // Limit useless logs
                log: (severity, line) => {
                  if (severity === 'error') {
                    this.server.log.error(line);
                  } else {
                    this.server.log.debug(line);
                  }
                },
              });

              this.socket.installHandlers(this.server.listeningApp, {
                prefix: this.server.sockPath,
              });
            }

            send(connection, message) {
              connection.write(message);
            }

            close(connection) {
              connection.close();
            }

            onConnection(f) {
              this.socket.on('connection', (connection) => {
                f(connection);
              });
            }

            onConnectionClose(connection, f) {
              connection.on('close', f);
            }
          },
        },
        done
      );

      mockWarn = jest.spyOn(server.log, 'warn').mockImplementation(() => {});
    });

    it('results in an error', (done) => {
      const data = [];
      const client = new SockJS(`http://localhost:${port}/sockjs-node`);

      client.onopen = () => {
        data.push('open');
      };

      client.onmessage = (e) => {
        data.push(e.data);
      };

      client.onclose = () => {
        data.push('close');
      };

      setTimeout(() => {
        expect(data).toMatchSnapshot();
        const calls = mockWarn.mock.calls;
        mockWarn.mockRestore();

        let foundWarning = false;
        const regExp = /serverMode implementation must pass headers to the callback of onConnection\(f\)/;
        calls.every((call) => {
          if (regExp.test(call)) {
            foundWarning = true;
            return false;
          }
          return true;
        });

        expect(foundWarning).toBeTruthy();

        done();
      }, 5000);
    });
  });
});
