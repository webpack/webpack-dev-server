'use strict';

const express = require('express');
const internalIp = require('internal-ip');
const { createProxyMiddleware } = require('http-proxy-middleware');
const request = require('supertest');
const testServer = require('../helpers/test-server');
const config = require('../fixtures/client-config/webpack.config');
const runBrowser = require('../helpers/run-browser');
const [port1, port2, port3] = require('../ports-map').ClientOptions;
const { beforeBrowserCloseDelay } = require('../helpers/puppeteer-constants');

describe.only('sockjs client proxy, different hostnames and different ports', () => {
  const devServerHost = '127.0.0.1';
  const devServerPort = port1;
  const proxyHost = internalIp.v4.sync();
  const proxyPort = port2;

  function startProxy(cb) {
    const proxy = express();

    proxy.use(
      '/',
      createProxyMiddleware({
        target: `http://${devServerHost}`,
        ws: true,
        changeOrigin: true,
        logLevel: 'warn',
      })
    );

    return proxy.listen(proxyPort, proxyHost, cb);
  }

  beforeAll((done) => {
    const options = {
      transportMode: 'sockjs',
      port: devServerPort,
      host: devServerHost,
      firewall: false,
      hot: true,
    };

    testServer.startAwaitingCompilation(config, options, done);
  });

  afterAll(testServer.close);

  // [HPM] Proxy created: /  ->  http://localhost:{port1}
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

    it('responds with a 200 code on proxy', (done) => {
      const req = request(`http://${proxyHost}:${proxyPort}`);

      req.get('/ws').expect(200, 'Welcome to SockJS!\n', done);
    });

    it('responds with a 200 code on non-proxy', (done) => {
      const req = request(`http://${devServerHost}:${devServerPort}`);

      req.get('/ws').expect(200, 'Welcome to SockJS!\n', done);
    });

    it('requests websocket through the proxy', (done) => {
      runBrowser().then(async ({ page, browser }) => {
        page
          .waitForRequest((requestObj) => requestObj.url().match(/ws/))
          .then((requestObj) => {
            page.waitForTimeout(beforeBrowserCloseDelay).then(() => {
              browser.close().then(() => {
                expect(requestObj.url()).toContain(
                  `http://${proxyHost}:${proxyPort}/ws`
                );

                done();
              });
            });
          });

        console.log(`http://${proxyHost}:${proxyPort}/main`);

        page.goto(`http://${proxyHost}:${proxyPort}/main`);
      });
    });
  });
});

describe('sockjs client proxy, different hostnames and same ports', () => {
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
      transportMode: 'sockjs',
      port: devServerPort,
      host: devServerHost,
      firewall: false,
      hot: true,
    };

    testServer.startAwaitingCompilation(config, options, done);
  });

  afterAll(testServer.close);

  // [HPM] Proxy created: /  ->  http://localhost:{port1}
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

    it('responds with a 200 code on proxy', (done) => {
      const req = request(`http://${proxyHost}:${proxyPort}`);

      req.get('/ws').expect(200, 'Welcome to SockJS!\n', done);
    });

    it('responds with a 200 code on non-proxy', (done) => {
      const req = request(`http://${devServerHost}:${devServerPort}`);

      req.get('/ws').expect(200, 'Welcome to SockJS!\n', done);
    });

    it('requests websocket through the proxy', (done) => {
      runBrowser().then(async ({ page, browser }) => {
        page
          .waitForRequest((requestObj) => requestObj.url().match(/ws/))
          .then((requestObj) => {
            page.waitForTimeout(beforeBrowserCloseDelay).then(() => {
              browser.close().then(() => {
                expect(requestObj.url()).toContain(
                  `http://${proxyHost}:${proxyPort}/ws`
                );

                done();
              });
            });
          });

        page.goto(`http://${proxyHost}:${proxyPort}/main`);
      });
    });
  });
});

describe('sockjs client proxy, same hostnames and different ports', () => {
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
      transportMode: 'sockjs',
      port: devServerPort,
      host: devServerHost,
      firewall: false,
      hot: true,
    };

    testServer.startAwaitingCompilation(config, options, done);
  });

  afterAll(testServer.close);

  // [HPM] Proxy created: /  ->  http://localhost:{port1}
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

    it('responds with a 200 code on proxy', (done) => {
      const req = request(`http://${proxyHost}:${proxyPort}`);

      req.get('/ws').expect(200, 'Welcome to SockJS!\n', done);
    });

    it('responds with a 200 code on non-proxy', (done) => {
      const req = request(`http://${devServerHost}:${devServerPort}`);

      req.get('/ws').expect(200, 'Welcome to SockJS!\n', done);
    });

    it('requests websocket through the proxy', (done) => {
      runBrowser().then(async ({ page, browser }) => {
        page
          .waitForRequest((requestObj) => requestObj.url().match(/ws/))
          .then((requestObj) => {
            page.waitForTimeout(beforeBrowserCloseDelay).then(() => {
              browser.close().then(() => {
                expect(requestObj.url()).toContain(
                  `http://${proxyHost}:${devServerPort}/ws`
                );

                done();
              });
            });
          });

        page.goto(`http://${proxyHost}:${proxyPort}/main`);
      });
    });
  });
});

describe('sockjs client proxy', () => {
  function startProxy(port, cb) {
    const proxy = express();

    proxy.use(
      '/',
      createProxyMiddleware({
        target: `http://localhost:${port1}`,
        ws: true,
        changeOrigin: true,
        logLevel: 'warn',
      })
    );

    return proxy.listen(port, cb);
  }

  beforeAll((done) => {
    const options = {
      transportMode: 'sockjs',
      compress: true,
      port: port1,
      host: '0.0.0.0',
      firewall: false,
      hot: true,
    };

    testServer.startAwaitingCompilation(config, options, done);
  });

  afterAll(testServer.close);

  // [HPM] Proxy created: /  ->  http://localhost:{port1}
  describe('behind a proxy', () => {
    let proxy;

    beforeAll((done) => {
      proxy = startProxy(port2, done);
    });

    afterAll((done) => {
      proxy.close(() => {
        done();
      });
    });

    it('responds with a 200 on proxy port', (done) => {
      const req = request(`http://localhost:${port2}`);

      req.get('/ws').expect(200, 'Welcome to SockJS!\n', done);
    });

    it('responds with a 200 on non-proxy port', (done) => {
      const req = request(`http://localhost:${port1}`);

      req.get('/ws').expect(200, 'Welcome to SockJS!\n', done);
    });

    it('requests websocket through the proxy with proper port number', (done) => {
      runBrowser().then(async ({ page, browser }) => {
        page
          .waitForRequest((requestObj) => requestObj.url().match(/ws/))
          .then((requestObj) => {
            page.waitForTimeout(beforeBrowserCloseDelay).then(() => {
              browser.close().then(() => {
                expect(requestObj.url()).toContain(
                  `http://localhost:${port1}/ws`
                );

                done();
              });
            });
          });

        page.goto(`http://localhost:${port2}/main`);
      });
    });
  });
});

describe('ws client proxy', () => {
  function startProxy(port, cb) {
    const proxy = express();

    proxy.use(
      '/',
      createProxyMiddleware({
        target: `http://localhost:${port1}`,
        ws: true,
        changeOrigin: true,
      })
    );

    return proxy.listen(port, cb);
  }

  beforeAll((done) => {
    const options = {
      transportMode: 'ws',
      compress: true,
      port: port1,
      host: '0.0.0.0',
      firewall: false,
      hot: true,
      public: 'myhost',
    };

    testServer.startAwaitingCompilation(config, options, done);
  });

  afterAll(testServer.close);

  // [HPM] Proxy created: /  ->  http://localhost:{port1}
  describe('behind a proxy', () => {
    let proxy;

    beforeAll((done) => {
      proxy = startProxy(port2, done);
    });

    afterAll((done) => {
      proxy.close(() => {
        done();
      });
    });

    // Using Chrome DevTools protocol directly for now:
    // https://chromedevtools.github.io/devtools-protocol/tot/Network/#event-webSocketCreated
    // TODO: listen for websocket requestType via puppeteer when added
    // to puppeteer: https://github.com/puppeteer/puppeteer/issues/2974
    it('requests websocket through the proxy with proper port number', (done) => {
      runBrowser().then(({ page, browser }) => {
        const client = page._client;

        client.on('Network.webSocketCreated', (evt) => {
          page.waitForTimeout(beforeBrowserCloseDelay).then(() => {
            browser.close().then(() => {
              expect(evt.url).toContain(`ws://myhost:${port1}/ws`);

              done();
            });
          });
        });

        page.goto(`http://localhost:${port2}/main`);
      });
    });
  });
});

describe('sockjs public and client path', () => {
  beforeAll((done) => {
    const options = {
      transportMode: 'sockjs',
      port: port2,
      host: '0.0.0.0',
      public: 'myhost.test',
      client: {
        path: '/foo/test/bar/',
      },
    };

    testServer.startAwaitingCompilation(config, options, done);
  });

  afterAll(testServer.close);

  describe('browser client', () => {
    it('uses the correct public hostname and path', (done) => {
      runBrowser().then(({ page, browser }) => {
        page
          .waitForRequest((requestObj) =>
            requestObj.url().match(/foo\/test\/bar/)
          )
          .then((requestObj) => {
            page.waitForTimeout(beforeBrowserCloseDelay).then(() => {
              browser.close().then(() => {
                expect(requestObj.url()).toContain(
                  `http://myhost.test:${port2}/foo/test/bar`
                );

                done();
              });
            });
          });

        page.goto(`http://localhost:${port2}/main`);
      });
    });
  });
});

describe('sockjs client path and port', () => {
  beforeAll((done) => {
    const options = {
      transportMode: 'sockjs',
      port: port2,
      host: '0.0.0.0',
      client: {
        path: '/foo/test/bar/',
        port: port3,
      },
    };

    testServer.startAwaitingCompilation(config, options, done);
  });

  afterAll(testServer.close);

  describe('browser client', () => {
    it('uses correct port and path', (done) => {
      runBrowser().then(({ page, browser }) => {
        page
          .waitForRequest((requestObj) =>
            requestObj.url().match(/foo\/test\/bar/)
          )
          .then((requestObj) => {
            page.waitForTimeout(beforeBrowserCloseDelay).then(() => {
              browser.close().then(() => {
                expect(requestObj.url()).toContain(
                  `http://localhost:${port3}/foo/test/bar`
                );

                done();
              });
            });
          });

        page.goto(`http://localhost:${port2}/main`);
      });
    });
  });
});

// previously, using port without path had the ability
// to alter the path (based on a bug in client-src/default/index.js)
// so we need to make sure path is not altered in this case
describe('sockjs client port, no path', () => {
  beforeAll((done) => {
    const options = {
      transportMode: 'sockjs',
      port: port2,
      host: '0.0.0.0',
      client: {
        port: port3,
      },
    };

    testServer.startAwaitingCompilation(config, options, done);
  });

  afterAll(testServer.close);

  describe('browser client', () => {
    it('uses correct port and path', (done) => {
      runBrowser().then(({ page, browser }) => {
        page
          .waitForRequest((requestObj) => requestObj.url().match(/ws/))
          .then((requestObj) => {
            page.waitForTimeout(beforeBrowserCloseDelay).then(() => {
              browser.close().then(() => {
                expect(requestObj.url()).toContain(
                  `http://localhost:${port3}/ws`
                );

                done();
              });
            });
          });

        page.goto(`http://localhost:${port2}/main`);
      });
    });
  });
});

describe('sockjs client host', () => {
  beforeAll((done) => {
    const options = {
      transportMode: 'sockjs',
      port: port2,
      host: '0.0.0.0',
      client: {
        host: 'myhost.test',
      },
    };
    testServer.startAwaitingCompilation(config, options, done);
  });

  afterAll(testServer.close);

  describe('browser client', () => {
    it('uses correct host', (done) => {
      runBrowser().then(({ page, browser }) => {
        page
          .waitForRequest((requestObj) => requestObj.url().match(/ws/))
          .then((requestObj) => {
            page.waitForTimeout(beforeBrowserCloseDelay).then(() => {
              browser.close().then(() => {
                expect(requestObj.url()).toContain(
                  `http://myhost.test:${port2}/ws`
                );

                done();
              });
            });
          });

        page.goto(`http://localhost:${port2}/main`);
      });
    });
  });
});

describe('ws client host, port, and path', () => {
  beforeAll((done) => {
    const options = {
      transportMode: 'ws',
      port: port2,
      host: '0.0.0.0',
      client: {
        host: 'myhost',
        port: port3,
        path: '/foo/test/bar/',
      },
    };

    testServer.startAwaitingCompilation(config, options, done);
  });

  afterAll(testServer.close);

  describe('browser client', () => {
    // Using Chrome DevTools protocol directly for now:
    // https://chromedevtools.github.io/devtools-protocol/tot/Network/#event-webSocketCreated
    // TODO: listen for websocket requestType via puppeteer when added
    // to puppeteer: https://github.com/puppeteer/puppeteer/issues/2974
    it('uses correct host, port, and path', (done) => {
      runBrowser().then(({ page, browser }) => {
        const client = page._client;

        client.on('Network.webSocketCreated', (evt) => {
          page.waitForTimeout(beforeBrowserCloseDelay).then(() => {
            browser.close().then(() => {
              expect(evt.url).toContain(`ws://myhost:${port3}/foo/test/bar`);

              done();
            });
          });
        });
        page.goto(`http://localhost:${port2}/main`);
      });
    });
  });
});

describe('Client console.log', () => {
  const baseOptions = {
    port: port2,
    host: '0.0.0.0',
  };
  const transportModes = [
    {},
    { transportMode: 'sockjs' },
    { transportMode: 'ws' },
  ];

  const cases = [
    {
      title: 'hot disabled',
      options: {
        hot: false,
      },
    },
    {
      title: 'hot enabled',
      options: {
        hot: true,
      },
    },
    {
      title: 'liveReload disabled',
      options: {
        liveReload: false,
      },
    },
    {
      title: 'liveReload enabled',
      options: {
        liveReload: true,
      },
    },
    {
      title: 'liveReload & hot are disabled',
      options: {
        liveReload: false,
        hot: false,
      },
    },
    {
      title: 'client logging is none',
      options: {
        client: {
          logging: 'none',
        },
      },
    },
  ];

  transportModes.forEach(async (mode) => {
    cases.forEach(async ({ title, options }) => {
      title += ` (${
        Object.keys(mode).length ? mode.transportMode : 'default'
      })`;

      options = { ...mode, ...options };

      const testOptions = Object.assign({}, baseOptions, options);

      it(title, (done) => {
        testServer.startAwaitingCompilation(config, testOptions, async () => {
          const res = [];
          const { page, browser } = await runBrowser();

          page.goto(`http://localhost:${port2}/main`);
          page.on('console', ({ _text }) => {
            res.push(_text);
          });

          // wait for load before closing the browser
          await page.waitForNavigation({ waitUntil: 'load' });
          await page.waitForTimeout(beforeBrowserCloseDelay);
          await browser.close();

          // Order doesn't matter, maybe we should improve that in future
          await expect(res.sort()).toMatchSnapshot();
          await testServer.close(done);
        });
      });
    });
  });
});
