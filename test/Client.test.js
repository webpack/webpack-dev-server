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
      hot: true,
      watchOptions: {
        poll: true,
      },
    };
    helper.start(config, options, done);
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
            browser.close();
            done();
          });
        page.goto('http://localhost:9000/main');
      });
    });
  });
});
