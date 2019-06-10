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
};

const proxyOption = {
  context: () => true,
  target: `http://localhost:${port1}`,
};

const proxyOptionOfArray = [
  { context: '/proxy1', target: proxyOption.target },
  function proxy() {
    return {
      context: '/api/proxy2',
      target: `http://localhost:${port2}`,
      pathRewrite: { '^/api': '' },
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
  return function proxy() {
    listeners.forEach((listener) => {
      listener.close();
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
          contentBase,
          proxy: proxyOptionPathsAsProperties,
          port: port3,
        },
        done
      );
      req = request(server.app);
    });

    afterAll((done) => {
      testServer.close(() => {
        closeProxyServers();
        done();
      });
    });

    describe('target', () => {
      it('respects a proxy option when a request path is matched', async () => {
        await req.get('/proxy1').expect(200, 'from proxy1');
      });
    });

    describe('pathRewrite', () => {
      it('respects a pathRewrite option', async () => {
        await req.get('/api/proxy2').expect(200, 'from proxy2');
      });
    });

    describe('bypass', () => {
      it('can rewrite a request path', async () => {
        await req.get('/foo/bar.html').expect(200, /Hello/);
      });

      it('can rewrite a request path regardless of the target defined a bypass option', async () => {
        await req.get('/baz/hoge.html').expect(200, /Hello/);
      });

      it('should pass through a proxy when a bypass function returns null', async () => {
        await req.get('/foo.js').expect(200, /Hey/);
      });

      it('should not pass through a proxy when a bypass function returns false', async () => {
        await req.get('/proxyfalse').expect(404);
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
          contentBase,
          proxy: proxyOption,
          port: port3,
        },
        done
      );
      req = request(server.app);
    });

    afterAll((done) => {
      testServer.close(() => {
        closeProxyServers();
        done();
      });
    });

    it('respects a proxy option', async () => {
      await req.get('/proxy1').expect(200, 'from proxy1');
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
          contentBase,
          proxy: proxyOptionOfArray,
          port: port3,
        },
        done
      );
      req = request(server.app);
    });

    afterAll((done) => {
      testServer.close(() => {
        closeProxyServers();
        done();
      });
    });

    it('respects a proxy option', async () => {
      await req.get('/proxy1').expect(200, 'from proxy1');
    });

    it('respects a proxy option of function', async () => {
      await req.get('/api/proxy2').expect(200, 'from proxy2');
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
          contentBase,
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
        listener.close();
        done();
      });
    });

    it('respects proxy1 option', async () => {
      await req.get('/proxy1').expect(200, 'from proxy');
    });

    it('respects proxy2 option', async () => {
      await req.get('/proxy2').expect(200, 'from proxy');
    });
  });

  describe('should handles external websocket upgrade', () => {
    let ws;
    let wsServer;
    let responseMessage;

    beforeAll((done) => {
      testServer.start(
        config,
        {
          contentBase,
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

      wsServer = new WebSocketServer({ port: port4 });
      wsServer.on('connection', (server) => {
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
      wsServer.close();
      testServer.close(done);
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
          contentBase,
          proxy: {
            '**': proxyTarget,
          },
        },
        done
      );
      req = request(server.app);
    });

    afterAll((done) => {
      testServer.close(() => {
        listener.close();
        done();
      });
    });

    it('GET method', async () => {
      await req.get('/get').expect(200, 'GET method from proxy');
    });

    it('HEAD method', (done) => {
      req.head('/head').expect(200, done);
    });

    it('POST method (application/x-www-form-urlencoded)', async () => {
      await req
        .post('/post-x-www-form-urlencoded')
        .send('id=1')
        .expect(200, 'POST method from proxy (id: 1)');
    });

    it('POST method (application/json)', async () => {
      await req
        .post('/post-application-json')
        .send({ id: '1' })
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .expect(
          200,
          JSON.stringify({ answer: 'POST method from proxy (id: 1)' })
        );
    });

    it('DELETE method', async () => {
      await req.delete('/delete').expect(200, 'DELETE method from proxy');
    });
  });
});
