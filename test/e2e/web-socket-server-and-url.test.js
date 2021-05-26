'use strict';

const express = require('express');
const internalIp = require('internal-ip');
const { createProxyMiddleware } = require('http-proxy-middleware');
const testServer = require('../helpers/test-server');
const config = require('../fixtures/client-config/webpack.config');
const runBrowser = require('../helpers/run-browser');
const [port1, port2, port3] = require('../ports-map').ClientOptions;
const { beforeBrowserCloseDelay } = require('../helpers/puppeteer-constants');

const webSocketServerTypes = ['ws', 'sockjs'];

for (const webSocketServerType of webSocketServerTypes) {
  const websocketUrlProtocol = webSocketServerType === 'ws' ? 'ws' : 'http';

  // Using Chrome DevTools protocol directly for now:
  // TODO refactor, we should wait ws connection to specific location then wait it will be finished success and run callback
  const waitForTest = (browser, page, filter, callback) => {
    if (webSocketServerType === 'sockjs') {
      return page
        .waitForRequest((requestObj) => requestObj.url().match(filter))
        .then((requestObj) => {
          page.waitForTimeout(beforeBrowserCloseDelay).then(() => {
            browser.close().then(() => {
              callback(requestObj.url());
            });
          });
        });
    }

    const client = page._client;

    client.on('Network.webSocketCreated', (event) => {
      page.waitForTimeout(beforeBrowserCloseDelay).then(() => {
        browser.close().then(() => callback(event.url));
      });
    });
  };

  describe(`should work behind proxy, when hostnames are same and ports are different (${webSocketServerType})`, () => {
    const devServerHost = '127.0.0.1';
    const devServerPort = port1;
    const proxyHost = devServerHost;
    const proxyPort = port2;

    function startProxy(cb) {
      const proxy = express();

      proxy.use(
        '/',
        createProxyMiddleware({
          target: `http://${devServerHost}:${devServerPort}`,
          ws: true,
          changeOrigin: true,
          logLevel: 'warn',
        })
      );

      return proxy.listen(proxyPort, proxyHost, cb);
    }

    beforeAll((done) => {
      const options = {
        webSocketServer: webSocketServerType,
        port: devServerPort,
        host: devServerHost,
        firewall: false,
        hot: true,
      };

      testServer.startAwaitingCompilation(config, options, done);
    });

    afterAll(testServer.close);

    describe('behind a proxy', () => {
      let proxy;

      beforeAll((done) => {
        proxy = startProxy(() => {
          done();
        });
      });

      afterAll((done) => {
        proxy.close(() => {
          done();
        });
      });

      it('requests websocket through the proxy', (done) => {
        runBrowser().then(async ({ page, browser }) => {
          waitForTest(browser, page, /ws/, (websocketUrl) => {
            expect(websocketUrl).toContain(
              `${websocketUrlProtocol}://${devServerHost}:${devServerPort}/ws`
            );

            done();
          });

          page.goto(`http://${proxyHost}:${proxyPort}/main`);
        });
      });
    });
  });

  describe(`should work behind proxy, when hostnames are different and ports are same (${webSocketServerType})`, () => {
    const devServerHost = '127.0.0.1';
    const devServerPort = port1;
    const proxyHost = internalIp.v4.sync();
    const proxyPort = port1;

    function startProxy(cb) {
      const proxy = express();

      proxy.use(
        '/',
        createProxyMiddleware({
          target: `http://${devServerHost}:${devServerPort}`,
          ws: true,
          changeOrigin: true,
          logLevel: 'warn',
        })
      );

      return proxy.listen(proxyPort, proxyHost, cb);
    }

    beforeAll((done) => {
      const options = {
        webSocketServer: webSocketServerType,
        port: devServerPort,
        host: devServerHost,
        firewall: false,
        hot: true,
      };

      testServer.startAwaitingCompilation(config, options, done);
    });

    afterAll(testServer.close);

    describe('behind a proxy', () => {
      let proxy;

      beforeAll((done) => {
        proxy = startProxy(() => {
          done();
        });
      });

      afterAll((done) => {
        proxy.close(() => {
          done();
        });
      });

      it('requests websocket through the proxy', (done) => {
        runBrowser().then(async ({ page, browser }) => {
          waitForTest(browser, page, /ws/, (websocketUrl) => {
            expect(websocketUrl).toContain(
              `${websocketUrlProtocol}://${devServerHost}:${devServerPort}/ws`
            );

            done();
          });

          page.goto(`http://${proxyHost}:${proxyPort}/main`);
        });
      });
    });
  });

  describe(`should work behind proxy, when hostnames are different and ports are different (${webSocketServerType})`, () => {
    const devServerHost = '127.0.0.1';
    const devServerPort = port1;
    const proxyHost = internalIp.v4.sync();
    const proxyPort = port2;

    function startProxy(cb) {
      const proxy = express();

      proxy.use(
        '/',
        createProxyMiddleware({
          target: `http://${devServerHost}:${devServerPort}`,
          ws: true,
          changeOrigin: true,
          logLevel: 'warn',
        })
      );

      return proxy.listen(proxyPort, proxyHost, cb);
    }

    beforeAll((done) => {
      const options = {
        client: {
          webSocketURL: {
            host: devServerHost,
          },
        },
        port: devServerPort,
        host: devServerHost,
        webSocketServer: webSocketServerType,
        firewall: false,
        hot: true,
        static: true,
      };

      testServer.startAwaitingCompilation(config, options, done);
    });

    afterAll(testServer.close);

    describe('behind a proxy', () => {
      let proxy;

      beforeAll((done) => {
        proxy = startProxy(() => {
          done();
        });
      });

      afterAll((done) => {
        proxy.close(() => {
          done();
        });
      });

      it('requests websocket through the proxy', (done) => {
        runBrowser().then(async ({ page, browser }) => {
          waitForTest(browser, page, /ws/, (websocketUrl) => {
            expect(websocketUrl).toContain(
              `${websocketUrlProtocol}://${devServerHost}:${devServerPort}/ws`
            );

            done();
          });

          page.goto(`http://${proxyHost}:${proxyPort}/main`);
        });
      });
    });
  });

  describe('should work with custom client port and path', () => {
    beforeAll((done) => {
      const options = {
        webSocketServer: webSocketServerType,
        port: port2,
        host: '0.0.0.0',
        client: {
          webSocketURL: {
            path: '/foo/test/bar/',
            port: port3,
          },
        },
      };

      testServer.startAwaitingCompilation(config, options, done);
    });

    afterAll(testServer.close);

    describe('browser client', () => {
      it('uses correct port and path', (done) => {
        runBrowser().then(({ page, browser }) => {
          waitForTest(browser, page, /foo\/test\/bar/, (websocketUrl) => {
            expect(websocketUrl).toContain(
              `${websocketUrlProtocol}://localhost:${port3}/foo/test/bar`
            );

            done();
          });

          page.goto(`http://localhost:${port2}/main`);
        });
      });
    });
  });

  describe('should work with custom client port', () => {
    beforeAll((done) => {
      const options = {
        webSocketServer: webSocketServerType,
        port: port2,
        host: '0.0.0.0',
        client: {
          webSocketURL: {
            port: port3,
          },
        },
      };

      testServer.startAwaitingCompilation(config, options, done);
    });

    afterAll(testServer.close);

    describe('browser client', () => {
      it('uses correct port and path', (done) => {
        runBrowser().then(({ page, browser }) => {
          waitForTest(browser, page, /ws/, (websocketUrl) => {
            expect(websocketUrl).toContain(
              `${websocketUrlProtocol}://localhost:${port3}/ws`
            );

            done();
          });

          page.goto(`http://localhost:${port2}/main`);
        });
      });
    });
  });

  describe('should work with custom client host', () => {
    beforeAll((done) => {
      const options = {
        webSocketServer: webSocketServerType,
        port: port2,
        host: '0.0.0.0',
        client: {
          webSocketURL: {
            host: 'myhost.test',
          },
        },
      };
      testServer.startAwaitingCompilation(config, options, done);
    });

    afterAll(testServer.close);

    describe('browser client', () => {
      it('uses correct host', (done) => {
        runBrowser().then(({ page, browser }) => {
          waitForTest(browser, page, /ws/, (websocketUrl) => {
            expect(websocketUrl).toContain(
              `${websocketUrlProtocol}://myhost.test:${port2}/ws`
            );

            done();
          });

          page.goto(`http://localhost:${port2}/main`);
        });
      });
    });
  });

  describe('should work with custom client host, port, and path', () => {
    beforeAll((done) => {
      const options = {
        webSocketServer: webSocketServerType,
        port: port2,
        host: '0.0.0.0',
        client: {
          webSocketURL: {
            host: 'myhost',
            port: port3,
            path: '/foo/test/bar/',
          },
        },
      };

      testServer.startAwaitingCompilation(config, options, done);
    });

    afterAll(testServer.close);

    describe('browser client', () => {
      it('uses correct host, port, and path', (done) => {
        runBrowser().then(({ page, browser }) => {
          waitForTest(browser, page, /foo\/test\/bar/, (websocketUrl) => {
            expect(websocketUrl).toContain(
              `${websocketUrlProtocol}://myhost:${port3}/foo/test/bar`
            );

            done();
          });

          page.goto(`http://localhost:${port2}/main`);
        });
      });
    });
  });

  describe('should work with the "client.webSocketURL" option and custom client path', () => {
    beforeAll((done) => {
      const options = {
        webSocketServer: webSocketServerType,
        port: port2,
        host: '0.0.0.0',
        client: {
          webSocketURL: `ws://myhost.test:${port2}/foo/test/bar/`,
        },
      };

      testServer.startAwaitingCompilation(config, options, done);
    });

    afterAll(testServer.close);

    describe('browser client', () => {
      it('uses the correct webSocketURL hostname and path', (done) => {
        runBrowser().then(({ page, browser }) => {
          waitForTest(browser, page, /foo\/test\/bar/, (websocketUrl) => {
            expect(websocketUrl).toContain(
              `${websocketUrlProtocol}://myhost.test:${port2}/foo/test/bar`
            );

            done();
          });

          page.goto(`http://localhost:${port2}/main`);
        });
      });
    });
  });
}
