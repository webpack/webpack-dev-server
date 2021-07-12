'use strict';

/* eslint-disable
  class-methods-use-this
*/
const sockjs = require('sockjs');
const SockJS = require('sockjs-client/dist/sockjs');
const config = require('../fixtures/simple-config/webpack.config');
const BaseServer = require('../../lib/servers/BaseServer');
const port = require('../ports-map')['web-socket-server-option'];

describe('webSocketServer', () => {
  describe('server', () => {
    let testServer;
    let server;

    describe('passed to server', () => {
      beforeAll(() => {
        jest.unmock('../../lib/utils/getSocketServerImplementation');
        testServer = require('../helpers/test-server');
      });

      afterEach((done) => {
        testServer.close(done);
        server = null;
      });

      describe.skip('without a header', () => {
        let mockWarn;

        beforeAll((done) => {
          server = testServer.start(
            config,
            {
              port,
              client: { transport: 'sockjs' },
              webSocketServer: class MySockJSServer extends BaseServer {
                constructor(serv) {
                  super(serv);
                  this.implementation = sockjs.createServer({
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

                  this.implementation.installHandlers(this.server.server, {
                    prefix: '/ws',
                  });
                }

                send(connection, message) {
                  connection.write(message);
                }

                close(callback) {
                  [...this.server.webSocketConnections].forEach((socket) => {
                    this.closeConnection(socket);
                  });

                  if (callback) {
                    callback();
                  }
                }

                closeConnection(connection) {
                  connection.close();
                }

                onConnection(f) {
                  this.implementation.on('connection', (connection) => {
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
              /webSocketServer implementation must pass headers to the callback of onConnection\(f\)/;

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

      describe.skip('with a bad host header', () => {
        beforeAll((done) => {
          server = testServer.start(
            config,
            {
              port,
              client: { transport: 'sockjs' },
              webSocketServer: class MySockJSServer extends BaseServer {
                constructor(serv) {
                  super(serv);
                  this.implementation = sockjs.createServer({
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

                  this.implementation.installHandlers(this.server.server, {
                    prefix: '/ws',
                  });
                }

                send(connection, message) {
                  connection.write(message);
                }

                close(callback) {
                  [...this.server.webSocketConnections].forEach((socket) => {
                    this.closeConnection(socket);
                  });

                  if (callback) {
                    callback();
                  }
                }

                closeConnection(connection) {
                  connection.close();
                }

                onConnection(f) {
                  this.implementation.on('connection', (connection) => {
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
  });
});
