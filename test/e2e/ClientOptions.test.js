'use strict';

const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const request = require('supertest');
const testServer = require('../helpers/test-server');
const config = require('../fixtures/client-config/webpack.config');
const runBrowser = require('../helpers/run-browser');
const [port1, port2, port3] = require('../ports-map').ClientOptions;
const { beforeBrowserCloseDelay } = require('../helpers/puppeteer-constants');

describe('sockjs client proxy', () => {
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
      transportMode: 'sockjs',
      compress: true,
      port: port1,
      host: '0.0.0.0',
      disableHostCheck: true,
      hot: true,
      watchOptions: {
        poll: true,
      },
      quiet: true,
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
            page.waitFor(beforeBrowserCloseDelay).then(() => {
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
      disableHostCheck: true,
      hot: true,
      watchOptions: {
        poll: true,
      },
      quiet: true,
      public: 'myhost.test',
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

    // TODO: listen for websocket requestType via puppeteer when added
    // to puppeteer: https://github.com/puppeteer/puppeteer/issues/2974
    it('requests websocket through the proxy with proper port number', (done) => {
      runBrowser().then(({ page, browser }) => {
        page.on('console', (msg) => {
          const text = msg.text();
          if (msg.type() === 'error' && text.includes('WebSocket connection')) {
            page.waitFor(beforeBrowserCloseDelay).then(() => {
              browser.close().then(() => {
                expect(text).toContain(`ws://myhost.test:${port2}/ws`);
                done();
              });
            });
          }
        });
        page.goto(`http://localhost:${port2}/main`);
      });
    });
  });
});

describe('sockjs public and sockPath', () => {
  beforeAll((done) => {
    const options = {
      transportMode: 'sockjs',
      port: port2,
      host: '0.0.0.0',
      watchOptions: {
        poll: true,
      },
      public: 'myhost.test',
      sockPath: '/foo/test/bar/',
      quiet: true,
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
            page.waitFor(beforeBrowserCloseDelay).then(() => {
              browser.close().then(() => {
                expect(requestObj.url()).toContain(
                  `http://myhost.test:${port2}/foo/test/bar/`
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

describe('sockjs sockPath and sockPort', () => {
  beforeAll((done) => {
    const options = {
      transportMode: 'sockjs',
      port: port2,
      host: '0.0.0.0',
      watchOptions: {
        poll: true,
      },
      sockPath: '/foo/test/bar/',
      sockPort: port3,
      quiet: true,
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
            page.waitFor(beforeBrowserCloseDelay).then(() => {
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

// previously, using sockPort without sockPath had the ability
// to alter the sockPath (based on a bug in client-src/default/index.js)
// so we need to make sure sockPath is not altered in this case
describe('sockjs sockPort, no sockPath', () => {
  beforeAll((done) => {
    const options = {
      transportMode: 'sockjs',
      port: port2,
      host: '0.0.0.0',
      watchOptions: {
        poll: true,
      },
      sockPort: port3,
      quiet: true,
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
            page.waitFor(beforeBrowserCloseDelay).then(() => {
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

describe('sockjs sockHost', () => {
  beforeAll((done) => {
    const options = {
      transportMode: 'sockjs',
      port: port2,
      host: '0.0.0.0',
      watchOptions: {
        poll: true,
      },
      sockHost: 'myhost.test',
      quiet: true,
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
            page.waitFor(beforeBrowserCloseDelay).then(() => {
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

describe('ws client sockHost, sockPort, and sockPath', () => {
  beforeAll((done) => {
    const options = {
      transportMode: 'ws',
      port: port2,
      host: '0.0.0.0',
      watchOptions: {
        poll: true,
      },
      sockHost: 'myhost.test',
      sockPort: port3,
      sockPath: '/foo/test/bar/',
      quiet: true,
    };
    testServer.startAwaitingCompilation(config, options, done);
  });

  afterAll(testServer.close);

  describe('browser client', () => {
    // TODO: listen for websocket requestType via puppeteer when added
    // to puppeteer: https://github.com/puppeteer/puppeteer/issues/2974
    it('uses correct host, port, and path', (done) => {
      runBrowser().then(({ page, browser }) => {
        page.on('console', (msg) => {
          const text = msg.text();
          if (msg.type() === 'error' && text.includes('WebSocket connection')) {
            page.waitFor(beforeBrowserCloseDelay).then(() => {
              browser.close().then(() => {
                expect(text).toContain(
                  `ws://myhost.test:${port3}/foo/test/bar/`
                );
                done();
              });
            });
          }
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
    quiet: true,
  };
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
    // TODO: make clientLogLevel work as expected for HMR logs
    {
      title: 'clientLogLevel is silent',
      options: {
        clientLogLevel: 'silent',
      },
    },
  ];

  cases.forEach(({ title, options }) => {
    it(title, (done) => {
      const res = [];
      const testOptions = Object.assign({}, baseOptions, options);

      // TODO: use async/await when Node.js v6 support is dropped
      Promise.resolve()
        .then(() => {
          return new Promise((resolve) => {
            testServer.startAwaitingCompilation(config, testOptions, resolve);
          });
        })
        .then(() => {
          // make sure the previous Promise is not passing along strange arguments to runBrowser
          return runBrowser();
        })
        .then(({ page, browser }) => {
          return new Promise((resolve) => {
            page.goto(`http://localhost:${port2}/main`);
            page.on('console', ({ _text }) => {
              res.push(_text);
            });
            // wait for load before closing the browser
            page.waitForNavigation({ waitUntil: 'load' }).then(() => {
              page.waitFor(beforeBrowserCloseDelay).then(() => {
                browser.close().then(() => {
                  resolve();
                });
              });
            });
          });
        })
        .then(() => {
          return new Promise((resolve) => {
            testServer.close(resolve);
          });
        })
        .then(() => {
          // Order doesn't matter, maybe we should improve that in future
          expect(res.sort()).toMatchSnapshot();
          done();
        });
    });
  });
});
