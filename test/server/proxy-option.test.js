'use strict';

const path = require('path');
const request = require('supertest');
const express = require('express');
const bodyParser = require('body-parser');
const WebSocket = require('ws');
const testServer = require('../helpers/test-server');
const config = require('../fixtures/proxy-config/webpack.config');
const [port1, port2, port3, port4] = require('../ports-map')['proxy-option'];

const WebSocketServer = WebSocket.Server;
const contentBase = path.resolve(__dirname, '../fixtures/proxy-config');

const proxyOptionPathsAsProperties = {
  '/proxy1': {
    target: `http://localhost:${port1}`,
  },
  '/api/proxy2': {
    target: `http://localhost:${port2}`,
    pathRewrite: { '^/api': '' },
  },
  '/foo': {
    bypass(req) {
      if (/\.html$/.test(req.path)) {
        return '/index.html';
      }

      return null;
    },
  },
  '/proxyfalse': {
    bypass(req) {
      if (/\/proxyfalse$/.test(req.path)) {
        return false;
      }
    },
  },
  '/proxy/async': {
    bypass(req, res) {
      if (/\/proxy\/async$/.test(req.path)) {
        return new Promise((resolve) => {
          setTimeout(() => {
            res.end('proxy async response');
            resolve(true);
          }, 10);
        });
      }
    },
  },
};

const proxyOption = {
  context: () => true,
  target: `http://localhost:${port1}`,
};

const proxyOptionOfArray = [
  { context: '/proxy1', target: proxyOption.target },
  function proxy(req, res, next) {
    return {
      context: '/api/proxy2',
      target: `http://localhost:${port2}`,
      pathRewrite: { '^/api': '' },
      bypass: () => {
        if (req && req.query.foo) {
          res.end(`foo+${next.name}+${typeof next}`);
          return false;
        }
      },
    };
  },
];

function startProxyServers() {
  const listeners = [];
  const proxy1 = express();
  const proxy2 = express();

  proxy1.get('/proxy1', (req, res) => {
    res.send('from proxy1');
  });
  proxy1.get('/api', (req, res) => {
    res.send('api response from proxy1');
  });
  proxy2.get('/proxy2', (req, res) => {
    res.send('from proxy2');
  });

  listeners.push(proxy1.listen(port1));
  listeners.push(proxy2.listen(port2));

  // return a function to shutdown proxy servers
  return function proxy(done) {
    Promise.all(
      listeners.map(
        (listener) =>
          new Promise((resolve) => {
            listener.close(() => {
              // ignore errors
              resolve();
            });
          })
      )
    ).then(() => {
      done();
    });
  };
}

describe('proxy option', () => {
  describe('as an object of paths with properties', () => {
    let server;
    let req;
    let closeProxyServers;

    beforeAll((done) => {
      closeProxyServers = startProxyServers();
      server = testServer.start(
        config,
        {
          static: {
            directory: contentBase,
            watch: false,
          },
          proxy: proxyOptionPathsAsProperties,
          port: port3,
        },
        done
      );
      req = request(server.app);
    });

    afterAll((done) => {
      testServer.close(() => {
        closeProxyServers(done);
      });
    });

    describe('target', () => {
      it('respects a proxy option when a request path is matched', async () => {
        const res = await req.get('/proxy1');
        expect(res.status).toEqual(200);
        expect(res.text).toContain('from proxy1');
      });
    });

    describe('pathRewrite', () => {
      it('respects a pathRewrite option', async () => {
        const res = await req.get('/api/proxy2');
        expect(res.status).toEqual(200);
        expect(res.text).toContain('from proxy2');
      });
    });

    describe('bypass', () => {
      it('can rewrite a request path', async () => {
        const res = await req.get('/foo/bar.html');
        expect(res.status).toEqual(200);
        expect(res.text).toContain('Hello');
      });

      it('can rewrite a request path regardless of the target defined a bypass option', async () => {
        const res = await req.get('/baz/hoge.html');
        expect(res.status).toEqual(200);
        expect(res.text).toContain('Hello');
      });

      it('should pass through a proxy when a bypass function returns null', async () => {
        const res = await req.get('/foo.js');
        expect(res.status).toEqual(200);
        expect(res.text).toContain('Hey');
      });

      it('should not pass through a proxy when a bypass function returns false', async () => {
        const res = await req.get('/proxyfalse');
        expect(res.status).toEqual(404);
      });

      it('should wait if bypass returns promise', async () => {
        const res = await req.get('/proxy/async');
        expect(res.status).toEqual(200);
        expect(res.text).toContain('proxy async response');
      });
    });
  });

  describe('as an option is an object', () => {
    let server;
    let req;
    let closeProxyServers;

    beforeAll((done) => {
      closeProxyServers = startProxyServers();
      server = testServer.start(
        config,
        {
          static: {
            directory: contentBase,
            watch: false,
          },
          proxy: proxyOption,
          port: port3,
        },
        done
      );
      req = request(server.app);
    });

    afterAll((done) => {
      testServer.close(() => {
        closeProxyServers(done);
      });
    });

    it('respects a proxy option', async () => {
      const res = await req.get('/proxy1');
      expect(res.status).toEqual(200);
      expect(res.text).toContain('from proxy1');
    });
  });

  describe('as an array', () => {
    let server;
    let req;
    let closeProxyServers;

    beforeAll((done) => {
      closeProxyServers = startProxyServers();
      server = testServer.start(
        config,
        {
          static: {
            directory: contentBase,
            watch: false,
          },
          proxy: proxyOptionOfArray,
          port: port3,
        },
        done
      );
      req = request(server.app);
    });

    afterAll((done) => {
      testServer.close(() => {
        closeProxyServers(done);
      });
    });

    it('respects a proxy option', async () => {
      const res = await req.get('/proxy1');
      expect(res.status).toEqual(200);
      expect(res.text).toContain('from proxy1');
    });

    it('respects a proxy option of function', async () => {
      const res = await req.get('/api/proxy2');
      expect(res.status).toEqual(200);
      expect(res.text).toContain('from proxy2');
    });

    it('should allow req, res, and next', async () => {
      const { text, statusCode } = await req.get('/api/proxy2?foo=true');

      expect(statusCode).toEqual(200);
      expect(text).toEqual('foo+next+function');
    });
  });

  describe('should sharing a proxy option', () => {
    let server;
    let req;
    let listener;
    const proxyTarget = {
      target: `http://localhost:${port1}`,
    };

    beforeAll((done) => {
      const proxy = express();

      proxy.get('*', (proxyReq, res) => {
        res.send('from proxy');
      });

      listener = proxy.listen(port1);

      server = testServer.start(
        config,
        {
          static: {
            directory: contentBase,
            watch: false,
          },
          proxy: {
            '/proxy1': proxyTarget,
            '/proxy2': proxyTarget,
          },
          port: port3,
        },
        done
      );
      req = request(server.app);
    });

    afterAll((done) => {
      testServer.close(() => {
        listener.close(done);
      });
    });

    it('respects proxy1 option', async () => {
      const res = await req.get('/proxy1');
      expect(res.status).toEqual(200);
      expect(res.text).toContain('from proxy');
    });

    it('respects proxy2 option', async () => {
      const res = await req.get('/proxy2');
      expect(res.status).toEqual(200);
      expect(res.text).toContain('from proxy');
    });
  });

  describe('should handles external websocket upgrade', () => {
    let ws;
    let webSocketServer;
    let responseMessage;

    const webSocketServerTypes = ['sockjs', 'ws'];

    webSocketServerTypes.forEach((webSocketServerType) => {
      describe(`with webSocketServerType: ${webSocketServerType}`, () => {
        beforeAll((done) => {
          testServer.start(
            config,
            {
              static: {
                directory: contentBase,
                watch: false,
              },
              webSocketServer: webSocketServerType,
              proxy: [
                {
                  context: '/',
                  target: `http://localhost:${port4}`,
                  ws: true,
                },
              ],
              port: port3,
            },
            done
          );

          webSocketServer = new WebSocketServer({ port: port4 });
          webSocketServer.on('connection', (server) => {
            server.on('message', (message) => {
              server.send(message);
            });
          });
        });

        beforeEach((done) => {
          ws = new WebSocket(`ws://localhost:${port3}/proxy3/socket`);
          ws.on('message', (message) => {
            responseMessage = message;
            done();
          });
          ws.on('open', () => {
            ws.send('foo');
          });
        });

        it('Should receive response', () => {
          expect(responseMessage).toEqual('foo');
        });

        afterAll((done) => {
          webSocketServer.close();
          testServer.close(done);
        });
      });
    });
  });

  describe('should supports http methods', () => {
    let server;
    let req;
    let listener;
    const proxyTarget = {
      target: `http://localhost:${port1}`,
    };

    beforeAll((done) => {
      const proxy = express();

      // Parse application/x-www-form-urlencoded
      proxy.use(bodyParser.urlencoded({ extended: false }));

      // Parse application/json
      proxy.use(bodyParser.json());

      // This forces Express to try to decode URLs, which is needed for the test
      // associated with the middleware below.
      proxy.all('*', (_req, res, next) => {
        next();
      });
      // We must define all 4 params in order for this to be detected as an
      // error handling middleware.
      // eslint-disable-next-line no-unused-vars
      proxy.use((error, proxyReq, res, next) => {
        res.status(500);
        res.send('error from proxy');
      });

      proxy.get('/get', (proxyReq, res) => {
        res.send('GET method from proxy');
      });

      proxy.head('/head', (proxyReq, res) => {
        res.send('HEAD method from proxy');
      });

      proxy.post('/post-x-www-form-urlencoded', (proxyReq, res) => {
        const id = proxyReq.body.id;

        res.status(200).send(`POST method from proxy (id: ${id})`);
      });

      proxy.post('/post-application-json', (proxyReq, res) => {
        const id = proxyReq.body.id;

        res.status(200).send({ answer: `POST method from proxy (id: ${id})` });
      });

      proxy.delete('/delete', (proxyReq, res) => {
        res.send('DELETE method from proxy');
      });

      listener = proxy.listen(port1);

      server = testServer.start(
        config,
        {
          static: {
            directory: contentBase,
            watch: false,
          },
          proxy: {
            '**': proxyTarget,
          },
          port: port3,
        },
        done
      );
      req = request(server.app);
    });

    afterAll((done) => {
      testServer.close(() => {
        listener.close(done);
      });
    });

    it('errors', async () => {
      const res = await req.get('/%');
      expect(res.status).toEqual(500);
      expect(res.text).toContain('error from proxy');
    });

    it('GET method', async () => {
      const res = await req.get('/get');
      expect(res.status).toEqual(200);
      expect(res.text).toContain('GET method from proxy');
    });

    it('HEAD method', async () => {
      const res = await req.head('/head');
      expect(res.status).toEqual(200);
    });

    it('POST method (application/x-www-form-urlencoded)', async () => {
      const res = await req.post('/post-x-www-form-urlencoded').send('id=1');
      expect(res.status).toEqual(200);
      expect(res.text).toContain('POST method from proxy (id: 1)');
    });

    it('POST method (application/json)', async () => {
      const res = await req
        .post('/post-application-json')
        .send({ id: '1' })
        .set('Accept', 'application/json');
      expect(res.status).toEqual(200);
      expect(res.headers['content-type']).toEqual(
        'application/json; charset=utf-8'
      );
      expect(res.text).toContain('POST method from proxy (id: 1)');
    });

    it('DELETE method', async () => {
      const res = await req.delete('/delete');
      expect(res.status).toEqual(200);
      expect(res.text).toContain('DELETE method from proxy');
    });
  });

  describe('should work in multi compiler mode', () => {
    let server;
    let req;
    let closeProxyServers;

    beforeAll((done) => {
      closeProxyServers = startProxyServers();
      server = testServer.start(
        [config, config],
        {
          static: {
            directory: contentBase,
            watch: false,
          },
          proxy: {
            '*': {
              context: () => true,
              target: `http://localhost:${port1}`,
            },
          },
          port: port3,
        },
        done
      );
      req = request(server.app);
    });

    afterAll((done) => {
      testServer.close(() => {
        closeProxyServers(done);
      });
    });

    it('respects a proxy option', async () => {
      const res = await req.get('/proxy1');
      expect(res.status).toEqual(200);
      expect(res.text).toContain('from proxy1');
    });
  });

  describe('should work and respect `logProvider` and `logLevel` options', () => {
    let server;
    let req;
    let closeProxyServers;
    let customLogProvider;

    beforeAll((done) => {
      customLogProvider = {
        log: jest.fn(),
        debug: jest.fn(),
        info: jest.fn(),
        warn: jest.fn(),
        error: jest.fn(),
      };

      closeProxyServers = startProxyServers();
      server = testServer.start(
        config,
        {
          static: {
            directory: contentBase,
            watch: false,
          },
          proxy: {
            '/my-path': {
              target: 'http://unknown:1234',
              logProvider: () => customLogProvider,
              logLevel: 'error',
            },
          },
          port: port3,
        },
        done
      );
      req = request(server.app);
    });

    afterAll((done) => {
      testServer.close(() => {
        closeProxyServers(done);
      });
    });

    describe('target', () => {
      it('respects a proxy option when a request path is matched', (done) => {
        req.get('/my-path').expect(504, () => {
          expect(customLogProvider.error).toHaveBeenCalledTimes(1);

          done();
        });
      });
    });
  });

  describe('should work and respect the `logLevel` option with `silent` value', () => {
    let server;
    let req;
    let closeProxyServers;
    let customLogProvider;

    beforeAll((done) => {
      customLogProvider = {
        log: jest.fn(),
        debug: jest.fn(),
        info: jest.fn(),
        warn: jest.fn(),
        error: jest.fn(),
      };

      closeProxyServers = startProxyServers();
      server = testServer.start(
        config,
        {
          static: {
            directory: contentBase,
            watch: false,
          },
          proxy: {
            '/my-path': {
              target: 'http://unknown:1234',
              logProvider: () => customLogProvider,
              logLevel: 'silent',
            },
          },
          port: port3,
        },
        done
      );
      req = request(server.app);
    });

    afterAll((done) => {
      testServer.close(() => {
        closeProxyServers(done);
      });
    });

    describe('target', () => {
      it('respects a proxy option when a request path is matched', (done) => {
        req.get('/my-path').expect(504, () => {
          expect(customLogProvider.error).toHaveBeenCalledTimes(0);

          done();
        });
      });
    });
  });

  describe('should work and respect the `infrastructureLogging.level` option', () => {
    let server;
    let req;
    let closeProxyServers;
    let customLogProvider;

    beforeAll((done) => {
      customLogProvider = {
        log: jest.fn(),
        debug: jest.fn(),
        info: jest.fn(),
        warn: jest.fn(),
        error: jest.fn(),
      };

      closeProxyServers = startProxyServers();
      server = testServer.start(
        { ...config, infrastructureLogging: { level: 'error' } },
        {
          static: {
            directory: contentBase,
            watch: false,
          },
          proxy: {
            '/my-path': {
              target: 'http://unknown:1234',
              logProvider: () => customLogProvider,
            },
          },
          port: port3,
        },
        done
      );
      req = request(server.app);
    });

    afterAll((done) => {
      testServer.close(() => {
        closeProxyServers(done);
      });
    });

    describe('target', () => {
      it('respects a proxy option when a request path is matched', (done) => {
        req.get('/my-path').expect(504, () => {
          expect(customLogProvider.error).toHaveBeenCalledTimes(1);

          done();
        });
      });
    });
  });

  describe('should work and respect the `infrastructureLogging.level` option with `none` value', () => {
    let server;
    let req;
    let closeProxyServers;
    let customLogProvider;

    beforeAll((done) => {
      customLogProvider = {
        log: jest.fn(),
        debug: jest.fn(),
        info: jest.fn(),
        warn: jest.fn(),
        error: jest.fn(),
      };

      closeProxyServers = startProxyServers();
      server = testServer.start(
        { ...config, infrastructureLogging: { level: 'none' } },
        {
          static: {
            directory: contentBase,
            watch: false,
          },
          proxy: {
            '/my-path': {
              target: 'http://unknown:1234',
              logProvider: () => customLogProvider,
            },
          },
          port: port3,
        },
        done
      );
      req = request(server.app);
    });

    afterAll((done) => {
      testServer.close(() => {
        closeProxyServers(done);
      });
    });

    describe('target', () => {
      it('respects a proxy option when a request path is matched', (done) => {
        req.get('/my-path').expect(504, () => {
          expect(customLogProvider.error).toHaveBeenCalledTimes(0);

          done();
        });
      });
    });
  });
});
