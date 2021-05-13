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
const port = require('../ports-map')['transportMode-option'];

describe('transportMode', () => {
  describe('server', () => {
    let mockedTestServer;
    let testServer;
    let server;
    let req;
    let getSocketServerImplementation;

    const serverModes = [
      {
        title: 'as a string ("sockjs")',
        transportMode: 'sockjs',
      },
      {
        title: 'as a path ("sockjs")',
        transportMode: {
          server: require.resolve('../../lib/servers/SockJSServer'),
        },
      },
      {
        title: 'as a string ("ws")',
        transportMode: 'ws',
      },
      {
        title: 'as a path ("ws")',
        transportMode: {
          server: require.resolve('../../lib/servers/WebsocketServer'),
        },
      },
      {
        title: 'as a class (custom implementation)',
        transportMode: {
          server: class CustomServer {},
        },
      },
      {
        title: 'as a nonexistent path',
        transportMode: {
          server: '/bad/path/to/implementation',
        },
      },
    ];

    describe('is passed to getSocketServerImplementation correctly', () => {
      beforeEach(() => {
        jest.mock('../../lib/utils/getSocketServerImplementation');
        getSocketServerImplementation = require('../../lib/utils/getSocketServerImplementation');
        getSocketServerImplementation.mockImplementation(
          () =>
            class MockServer {
              // eslint-disable-next-line no-empty-function
              onConnection() {}
            }
        );
      });

      afterEach((done) => {
        jest.resetAllMocks();
        jest.resetModules();

        mockedTestServer.close(done);
      });

      serverModes.forEach((data) => {
        it(data.title, (done) => {
          mockedTestServer = require('../helpers/test-server');
          mockedTestServer.start(
            config,
            {
              transportMode: data.transportMode,
              port,
            },
            () => {
              expect(getSocketServerImplementation.mock.calls.length).toEqual(
                1
              );
              expect(
                getSocketServerImplementation.mock.calls[0].length
              ).toEqual(1);

              if (typeof data.transportMode === 'string') {
                expect(
                  getSocketServerImplementation.mock.calls[0][0].transportMode
                ).toMatchSnapshot();
              } else {
                expect(
                  getSocketServerImplementation.mock.calls[0][0].transportMode
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
        jest.unmock('../../lib/utils/getSocketServerImplementation');
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
              transportMode: {
                server: 'sockjs',
              },
              port,
            },
            done
          );
          req = request(`http://localhost:${port}`);
        });

        it('sockjs path responds with a 200', (done) => {
          req.get('/ws').expect(200, done);
        });
      });

      describe('as a path ("sockjs")', () => {
        beforeEach((done) => {
          server = testServer.start(
            config,
            {
              transportMode: {
                server: require.resolve('../../lib/servers/SockJSServer'),
              },
              port,
            },
            done
          );
          req = request(`http://localhost:${port}`);
        });

        it('sockjs path responds with a 200', (done) => {
          req.get('/ws').expect(200, done);
        });
      });

      describe('as a class ("sockjs")', () => {
        beforeEach((done) => {
          server = testServer.start(
            config,
            {
              transportMode: {
                server: SockJSServer,
              },
              port,
            },
            done
          );
          req = request(`http://localhost:${port}`);
        });

        it('sockjs path responds with a 200', (done) => {
          req.get('/ws').expect(200, done);
        });
      });

      describe('as a class (custom "sockjs" implementation)', () => {
        let customServerUsed = false;
        it('uses supplied server implementation', (done) => {
          server = testServer.start(
            config,
            {
              port,
              transportMode: {
                server: class MySockJSServer extends BaseServer {
                  constructor(serv) {
                    super(serv);
                    this.socket = sockjs.createServer({
                      // Use provided up-to-date sockjs-client
                      sockjs_url: '/__webpack_dev_server__/sockjs.bundle.js',
                      // Limit useless logs
                      log: (severity, line) => {
                        if (severity === 'error') {
                          this.server.logger.error(line);
                        } else if (severity === 'info') {
                          this.server.logger.log(line);
                        } else {
                          this.server.logger.debug(line);
                        }
                      },
                    });

                    this.socket.installHandlers(this.server.server, {
                      prefix: 'ws',
                    });

                    customServerUsed = true;
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
            },
            () => {
              expect(customServerUsed).toBeTruthy();
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
                transportMode: {
                  server: '/bad/path/to/implementation',
                },
                port,
              },
              () => {}
            );
          }).toThrow(/transportMode\.server must be a string/);
        });
      });

      describe('without a header', () => {
        let mockWarn;
        beforeAll((done) => {
          server = testServer.start(
            config,
            {
              port,
              transportMode: {
                server: class MySockJSServer extends BaseServer {
                  constructor(serv) {
                    super(serv);
                    this.socket = sockjs.createServer({
                      // Use provided up-to-date sockjs-client
                      sockjs_url: '/__webpack_dev_server__/sockjs.bundle.js',
                      // Limit useless logs
                      log: (severity, line) => {
                        if (severity === 'error') {
                          this.server.logger.error(line);
                        } else {
                          this.server.logger.debug(line);
                        }
                      },
                    });

                    this.socket.installHandlers(this.server.server, {
                      prefix: this.server.options.client.path,
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
            },
            done
          );

          mockWarn = jest
            .spyOn(server.logger, 'warn')
            .mockImplementation(() => {});
        });

        it('results in an error', (done) => {
          const data = [];
          const client = new SockJS(`http://localhost:${port}/ws`);

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
            const regExp =
              /transportMode\.server implementation must pass headers to the callback of onConnection\(f\)/;
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

      describe('with a bad host header', () => {
        beforeAll((done) => {
          server = testServer.start(
            config,
            {
              port,
              transportMode: {
                server: class MySockJSServer extends BaseServer {
                  constructor(serv) {
                    super(serv);
                    this.socket = sockjs.createServer({
                      // Use provided up-to-date sockjs-client
                      sockjs_url: '/__webpack_dev_server__/sockjs.bundle.js',
                      // Limit useless logs
                      log: (severity, line) => {
                        if (severity === 'error') {
                          this.server.logger.error(line);
                        } else if (severity === 'info') {
                          this.server.logger.log(line);
                        } else {
                          this.server.logger.debug(line);
                        }
                      },
                    });

                    this.socket.installHandlers(this.server.server, {
                      prefix: this.server.options.client.path,
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
            },
            done
          );
        });

        it('results in an error', (done) => {
          const data = [];
          const client = new SockJS(`http://localhost:${port}/ws`);

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
    });

    describe('server', () => {
      let MockWebsocketServer;
      beforeEach((done) => {
        jest.mock('../../lib/servers/WebsocketServer');
        mockedTestServer = require('../helpers/test-server');
        MockWebsocketServer = require('../../lib/servers/WebsocketServer');

        server = mockedTestServer.start(
          config,
          {
            port,
          },
          done
        );
      });

      afterEach((done) => {
        mockedTestServer.close(done);
        jest.resetAllMocks();
        jest.resetModules();

        server = null;
      });

      it('should use server implementation correctly', () => {
        const mockServerInstance = MockWebsocketServer.mock.instances[0];

        const connectionObj = {
          foo: 'bar',
        };
        // this simulates a client connecting to the server
        mockServerInstance.onConnection.mock.calls[0][0](connectionObj, {
          host: `localhost:${port}`,
          origin: `http://localhost:${port}`,
        });

        expect(server.sockets.length).toEqual(1);
        expect(server.sockets).toMatchSnapshot();

        // this simulates a client leaving the server
        mockServerInstance.onConnectionClose.mock.calls[0][1](connectionObj);

        expect(server.sockets.length).toEqual(0);

        // check that the dev server was passed to the socket server implementation constructor
        expect(MockWebsocketServer.mock.calls[0].length).toEqual(1);
        expect(MockWebsocketServer.mock.calls[0][0].options.port).toEqual(port);

        expect(mockServerInstance.onConnection.mock.calls).toMatchSnapshot();
        expect(mockServerInstance.send.mock.calls.length).toEqual(5);
        // call 0 to the send() method is hot
        expect(mockServerInstance.send.mock.calls[0]).toMatchSnapshot();
        // call 1 to the send() method is liveReload
        expect(mockServerInstance.send.mock.calls[1]).toMatchSnapshot();
        // call 3 to the send() method is hash data, so we skip it
        // call 4 to the send() method is the "ok" message
        expect(mockServerInstance.send.mock.calls[4]).toMatchSnapshot();
        // close should not be called because the server never forcefully closes
        // a successful client connection
        expect(mockServerInstance.close.mock.calls.length).toEqual(0);
        expect(
          mockServerInstance.onConnectionClose.mock.calls
        ).toMatchSnapshot();
      });

      it('should close client with bad headers', () => {
        const mockServerInstance = MockWebsocketServer.mock.instances[0];

        // this simulates a client connecting to the server
        mockServerInstance.onConnection.mock.calls[0][0](
          {
            foo: 'bar',
          },
          {
            host: null,
          }
        );
        expect(server.sockets.length).toEqual(0);
        expect(MockWebsocketServer.mock.calls[0].length).toEqual(1);
        expect(MockWebsocketServer.mock.calls[0][0].options.port).toEqual(port);
        expect(mockServerInstance.onConnection.mock.calls).toMatchSnapshot();
        // the only call to send() here should be an invalid header message
        expect(mockServerInstance.send.mock.calls).toMatchSnapshot();
        expect(mockServerInstance.close.mock.calls).toMatchSnapshot();
        // onConnectionClose should never get called since the client should be closed first
        expect(mockServerInstance.onConnectionClose.mock.calls.length).toEqual(
          0
        );
      });
    });
  });

  describe('client', () => {
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
