'use strict';

const express = require('express');
const httpProxy = require('http-proxy-middleware');
const request = require('supertest');
const helper = require('./helper');
const config = require('./fixtures/client-config/webpack.config');
const runBrowser = require('./helpers/run-browser');

function startProxy(port) {
  const proxy = express();
  proxy.use(
    '/',
    httpProxy({
      target: 'http://localhost:9001',
      ws: true,
      changeOrigin: true,
    })
  );
  return proxy.listen(port);
}

describe('Client code', () => {
  beforeAll((done) => {
    const options = {
      compress: true,
      port: 9001,
      host: '0.0.0.0',
      disableHostCheck: true,
      inline: true,
      hot: true,
      watchOptions: {
        poll: true,
      },
    };
    helper.startAwaitingCompilation(config, options, done);
  });

  afterAll(helper.close);

  describe('behind a proxy', () => {
    let proxy;

    jest.setTimeout(30000);

    beforeAll(() => {
      proxy = startProxy(9000);
    });

    afterAll(() => {
      proxy.close();
    });

    it('responds with a 200', (done) => {
      const req = request('http://localhost:9000');
      req.get('/sockjs-node').expect(200, 'Welcome to SockJS!\n', done);
    });

    it('requests websocket through the proxy with proper port number', (done) => {
      runBrowser().then(({ page, browser }) => {
        page
          .waitForRequest((requestObj) => requestObj.url().match(/sockjs-node/))
          .then((requestObj) => {
            expect(requestObj.url()).toMatch(
              /^http:\/\/localhost:9000\/sockjs-node/
            );
            browser.close().then(done);
          });
        page.goto('http://localhost:9000/main');
      });
    });
  });
});

describe('Client complex inline script path', () => {
  beforeAll((done) => {
    const options = {
      port: 9000,
      host: '0.0.0.0',
      inline: true,
      watchOptions: {
        poll: true,
      },
      public: 'myhost.test',
      sockPath: '/foo/test/bar/',
    };
    helper.startAwaitingCompilation(config, options, done);
  });

  afterAll(helper.close);

  describe('browser client', () => {
    jest.setTimeout(30000);

    it('uses the correct public hostname and sockPath', (done) => {
      runBrowser().then(({ page, browser }) => {
        page
          .waitForRequest((requestObj) =>
            requestObj.url().match(/foo\/test\/bar/)
          )
          .then((requestObj) => {
            expect(requestObj.url()).toMatch(
              /^http:\/\/myhost\.test:9000\/foo\/test\/bar/
            );
            browser.close().then(done);
          });
        page.goto('http://localhost:9000/main');
      });
    });
  });
});

describe('Client complex inline script path with sockPort', () => {
  beforeAll((done) => {
    const options = {
      port: 9000,
      host: '0.0.0.0',
      inline: true,
      watchOptions: {
        poll: true,
      },
      sockPath: '/foo/test/bar/',
      sockPort: 8080,
    };
    helper.startAwaitingCompilation(config, options, done);
  });

  afterAll(helper.close);

  describe('browser client', () => {
    jest.setTimeout(30000);

    it('uses the correct sockPort', (done) => {
      runBrowser().then(({ page, browser }) => {
        page
          .waitForRequest((requestObj) =>
            requestObj.url().match(/foo\/test\/bar/)
          )
          .then((requestObj) => {
            expect(requestObj.url()).toMatch(
              /^http:\/\/localhost:8080\/foo\/test\/bar/
            );
            browser.close().then(done);
          });
        page.goto('http://localhost:9000/main');
      });
    });
  });
});
