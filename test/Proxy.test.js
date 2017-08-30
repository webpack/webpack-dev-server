'use strict';

const path = require('path');
const request = require('supertest');
const express = require('express');
const WebSocket = require('ws');
const should = require('should');
const helper = require('./helper');
const config = require('./fixtures/proxy-config/webpack.config');

const WebSocketServer = WebSocket.Server;
const contentBase = path.join(__dirname, 'fixtures/proxy-config');

const proxyOption = {
  '/proxy1': {
    target: 'http://localhost:9000'
  },
  '/api/proxy2': {
    target: 'http://localhost:9001',
    pathRewrite: { '^/api': '' }
  },
  '/foo': {
    bypass(req) {
      if (/\.html$/.test(req.path)) {
        return '/index.html';
      }
    }
  }
};

const proxyOptionOfArray = [
  { context: '/proxy1', target: proxyOption['/proxy1'].target },
  function proxy() {
    return {
      context: '/api/proxy2',
      target: 'http://localhost:9001',
      pathRewrite: { '^/api': '' }
    };
  }
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
  listeners.push(proxy1.listen(9000));
  listeners.push(proxy2.listen(9001));
  // return a function to shutdown proxy servers
  return function proxy() {
    listeners.forEach((listener) => {
      listener.close();
    });
  };
}

describe('Proxy', () => {
  context('proxy options is a object', () => {
    let server;
    let req;
    let closeProxyServers;

    before((done) => {
      closeProxyServers = startProxyServers();
      server = helper.start(config, {
        contentBase,
        proxy: proxyOption
      }, done);
      req = request(server.app);
    });

    after((done) => {
      helper.close(() => {
        closeProxyServers();
        done();
      });
    });

    describe('target', () => {
      it('respects a proxy option when a request path is matched', (done) => {
        req.get('/proxy1')
          .expect(200, 'from proxy1', done);
      });
    });

    describe('pathRewrite', () => {
      it('respects a pathRewrite option', (done) => {
        req.get('/api/proxy2')
          .expect(200, 'from proxy2', done);
      });
    });

    describe('bypass', () => {
      it('can rewrite a request path', (done) => {
        req.get('/foo/bar.html')
          .expect(200, /Hello/, done);
      });

      it('can rewrite a request path regardless of the target defined a bypass option', (done) => {
        req.get('/baz/hoge.html')
          .expect(200, /Hello/, done);
      });

      it('should pass through a proxy when a bypass function returns null', (done) => {
        req.get('/foo.js')
          .expect(200, /Hey/, done);
      });
    });
  });

  context('proxy option is an array', () => {
    let server;
    let req;
    let closeProxyServers;

    before((done) => {
      closeProxyServers = startProxyServers();
      server = helper.start(config, {
        contentBase,
        proxy: proxyOptionOfArray
      }, done);
      req = request(server.app);
    });

    after((done) => {
      helper.close(() => {
        closeProxyServers();
        done();
      });
    });

    it('respects a proxy option', (done) => {
      req.get('/proxy1')
        .expect(200, 'from proxy1', done);
    });

    it('respects a proxy option of function', (done) => {
      req.get('/api/proxy2')
        .expect(200, 'from proxy2', done);
    });
  });

  context('sharing a proxy option', () => {
    let server;
    let req;
    let listener;
    const proxyTarget = {
      target: 'http://localhost:9000'
    };

    before((done) => {
      const proxy = express();
      proxy.get('*', (proxyReq, res) => {
        res.send('from proxy');
      });
      listener = proxy.listen(9000);
      server = helper.start(config, {
        contentBase,
        proxy: {
          '/proxy1': proxyTarget,
          '/proxy2': proxyTarget
        }
      }, done);
      req = request(server.app);
    });

    after((done) => {
      helper.close(() => {
        listener.close();
        done();
      });
    });

    it('respects proxy1 option', (done) => {
      req.get('/proxy1').expect(200, 'from proxy', done);
    });

    it('respects proxy2 option', (done) => {
      req.get('/proxy2').expect(200, 'from proxy', done);
    });
  });

  context('External websocket upgrade', () => {
    let ws;
    let wsServer;
    let responseMessage;

    before((done) => {
      helper.start(config, {
        contentBase,
        proxy: [{
          context: '/',
          target: 'http://localhost:9003',
          ws: true
        }]
      }, done);

      wsServer = new WebSocketServer({ port: 9003 });
      wsServer.on('connection', (server) => {
        server.on('message', (message) => {
          server.send(message);
        });
      });
    });

    beforeEach((done) => {
      ws = new WebSocket('ws://localhost:8080/proxy3/socket');
      ws.on('message', (message) => {
        responseMessage = message;
        done();
      });
      ws.on('open', () => {
        ws.send('foo');
      });
    });

    it('Should receive response', () => {
      should(responseMessage).equal('foo');
    });

    after((done) => {
      wsServer.close();
      helper.close(done);
    });
  });
});
