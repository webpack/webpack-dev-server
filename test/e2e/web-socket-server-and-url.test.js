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
        allowedHosts: 'all',
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
        allowedHosts: 'all',
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
        allowedHosts: 'all',
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

  describe('should work with the "client.webSocketURL.protocol" option', () => {
    beforeAll((done) => {
      const options = {
        webSocketServer: webSocketServerType,
        port: port2,
        host: '0.0.0.0',
        client: {
          webSocketURL: {
            protocol: 'ws:',
          },
        },
      };

      testServer.startAwaitingCompilation(config, options, done);
    });

    afterAll(testServer.close);

    describe('browser client', () => {
      it('should work', (done) => {
        runBrowser().then(({ page, browser }) => {
          waitForTest(browser, page, /ws/, (websocketUrl) => {
            expect(websocketUrl).toContain(
              `${websocketUrlProtocol}://localhost:${port2}/ws`
            );

            done();
          });

          page.goto(`http://localhost:${port2}/main`);
        });
      });
    });
  });

  describe('should work with the "client.webSocketURL.protocol" option using "auto:" value', () => {
    beforeAll((done) => {
      const options = {
        webSocketServer: webSocketServerType,
        port: port2,
        host: '0.0.0.0',
        client: {
          webSocketURL: {
            protocol: 'auto:',
          },
        },
      };

      testServer.startAwaitingCompilation(config, options, done);
    });

    afterAll(testServer.close);

    describe('browser client', () => {
      it('should work', (done) => {
        runBrowser().then(({ page, browser }) => {
          waitForTest(browser, page, /ws/, (websocketUrl) => {
            expect(websocketUrl).toContain(
              `${websocketUrlProtocol}://localhost:${port2}/ws`
            );

            done();
          });

          page.goto(`http://localhost:${port2}/main`);
        });
      });
    });
  });

  describe('should work with the "client.webSocketURL.protocol" option using "http:" value and covert to "ws"', () => {
    beforeAll((done) => {
      const options = {
        webSocketServer: webSocketServerType,
        port: port2,
        host: '0.0.0.0',
        client: {
          webSocketURL: {
            protocol: 'http:',
          },
        },
      };

      testServer.startAwaitingCompilation(config, options, done);
    });

    afterAll(testServer.close);

    describe('browser client', () => {
      it('should work', (done) => {
        runBrowser().then(({ page, browser }) => {
          waitForTest(browser, page, /ws/, (websocketUrl) => {
            expect(websocketUrl).toContain(
              `${websocketUrlProtocol}://localhost:${port2}/ws`
            );

            done();
          });

          page.goto(`http://localhost:${port2}/main`);
        });
      });
    });
  });

  describe('should work with the "client.webSocketURL.host" option', () => {
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
      it('should work', (done) => {
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

  describe('should work with the "client.webSocketURL.port" option', () => {
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
      it('should work', (done) => {
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

  describe('should work with the "client.webSocketURL.port" option as "string"', () => {
    beforeAll((done) => {
      const options = {
        webSocketServer: webSocketServerType,
        port: port2,
        host: '0.0.0.0',
        client: {
          webSocketURL: {
            port: `${port3}`,
          },
        },
      };

      testServer.startAwaitingCompilation(config, options, done);
    });

    afterAll(testServer.close);

    describe('browser client', () => {
      it('should work', (done) => {
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

  describe('should work when "port" option is "auto"', () => {
    beforeAll((done) => {
      const options = {
        webSocketServer: webSocketServerType,
        port: 'auto',
        host: '0.0.0.0',
      };
      testServer.startAwaitingCompilation(config, options, done);
    });

    afterAll(testServer.close);

    describe('browser client', () => {
      it('should work', (done) => {
        runBrowser().then(({ page, browser }) => {
          waitForTest(browser, page, /ws/, (websocketUrl) => {
            expect(websocketUrl).toContain(
              `${websocketUrlProtocol}://localhost:8080/ws`
            );

            done();
          });

          page.goto(`http://localhost:8080/main`);
        });
      });
    });
  });

  describe('should work when "host" option is IPv4', () => {
    beforeAll((done) => {
      const options = {
        webSocketServer: webSocketServerType,
        port: port3,
        host: internalIp.v4.sync(),
      };
      testServer.startAwaitingCompilation(config, options, done);
    });

    afterAll(testServer.close);

    describe('browser client', () => {
      it('should work', (done) => {
        runBrowser().then(({ page, browser }) => {
          waitForTest(browser, page, /ws/, (websocketUrl) => {
            expect(websocketUrl).toContain(
              `${websocketUrlProtocol}://${internalIp.v4.sync()}:${port3}/ws`
            );

            done();
          });

          page.goto(`http://${internalIp.v4.sync()}:${port3}/main`);
        });
      });
    });
  });

  describe('should work with the "client.webSocketURL.port" option is 0', () => {
    beforeAll((done) => {
      const options = {
        webSocketServer: webSocketServerType,
        port: port2,
        host: '0.0.0.0',
        client: {
          webSocketURL: {
            port: 0,
          },
        },
      };

      testServer.startAwaitingCompilation(config, options, done);
    });

    afterAll(testServer.close);

    describe('browser client', () => {
      it('should work', (done) => {
        runBrowser().then(({ page, browser }) => {
          waitForTest(browser, page, /ws/, (websocketUrl) => {
            expect(websocketUrl).toContain(
              `${websocketUrlProtocol}://localhost:${port2}/ws`
            );

            done();
          });

          page.goto(`http://localhost:${port2}/main`);
        });
      });
    });
  });

  describe('should work with "client.webSocketURL.port" and "client.webSocketURL.path" options', () => {
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
      it('should work', (done) => {
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

  describe('should work with "client.webSocketURL.port" and "webSocketServer.options.port" options as string', () => {
    beforeAll((done) => {
      const options = {
        webSocketServer: {
          type: webSocketServerType,
          options: {
            host: '0.0.0.0',
            port: `${port2}`,
          },
        },
        port: port2,
        host: '0.0.0.0',
        client: {
          webSocketURL: {
            port: `${port3}`,
          },
        },
      };

      testServer.startAwaitingCompilation(config, options, done);
    });

    afterAll(testServer.close);

    describe('browser client', () => {
      it('should work', (done) => {
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

  describe('should work with "client.webSocketURL.host", "webSocketServer.options.port" and "webSocketServer.options.path" options', () => {
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

  describe('should work with the "client.webSocketURL" option as "string"', () => {
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
      it('should work', (done) => {
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
