'use strict';

/* eslint-disable
  class-methods-use-this
*/
const request = require('supertest');
const sockjs = require('sockjs');
const SockJSServer = require('../../lib/servers/SockJSServer');
const config = require('../fixtures/simple-config/webpack.config');
const testServer = require('../helpers/test-server');
const BaseServer = require('../../lib/servers/BaseServer');
const port = require('../ports-map')['serverMode-option'];

describe('serverMode option', () => {
  let server;
  let req;

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

    it('sockjs path responds with a 200', async () => {
      await req.get('/sockjs-node').expect(200);
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

    it('sockjs path responds with a 200', async () => {
      await req.get('/sockjs-node').expect(200);
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

    it('sockjs path responds with a 200', async () => {
      await req.get('/sockjs-node').expect(200);
    });
  });

  describe('as a class (custom "sockjs" implementation)', () => {
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

              expect(server.options.sockPath).toEqual('/foo/test/bar/');
            }

            send(connection, message) {
              connection.write(message);
            }

            close(connection) {
              connection.close();
            }

            onConnection(f) {
              this.socket.on('connection', f);
            }
          },
        },
        done
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
          },
          () => {}
        );
      }).toThrow(/serverMode must be a string/);
    });
  });
});
