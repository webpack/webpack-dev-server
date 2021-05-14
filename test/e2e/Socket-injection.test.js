'use strict';

/* eslint-disable
  no-unused-vars
*/

const express = require('express');
const request = require('supertest');
const testServer = require('../helpers/test-server');
const runBrowser = require('../helpers/run-browser');
const port = require('../ports-map').SocketInjection;
const config = require('../fixtures/client-config/webpack.config');
const { beforeBrowserCloseDelay } = require('../helpers/puppeteer-constants');

const transportModeWSValidOptions = [{}, { client: { trannsport: 'ws' } }];

describe('ws websocket client injection', () => {
  for (const wsOption of transportModeWSValidOptions) {
    let req;
    let server;
    const errorMsg = `WebSocket connection to 'ws://localhost:${port}/ws' failed: Error during WebSocket handshake: Unexpected response code: 404`;
    const res = [];

    describe('testing default settings', () => {
      beforeAll((done) => {
        const options = {
          port,
          ...wsOption,
        };
        server = testServer.start(config, options, done);
        req = request(`http://localhost:${port}`);
      });

      afterAll(testServer.close);

      it('should be injected', (done) => {
        // TODO: listen for websocket requestType via puppeteer when added
        // to puppeteer: https://github.com/puppeteer/puppeteer/issues/2974
        runBrowser().then(({ page, browser }) => {
          page.on('console', ({ _text }) => {
            res.push(_text);
          });
          page.waitForNavigation({ waitUntil: 'load' }).then(() => {
            page.waitForTimeout(beforeBrowserCloseDelay).then(() => {
              browser.close().then(() => {
                // if the error msg doesn't exist that means the ws websocket is working.
                expect(res.includes(errorMsg)).toBe(false);
                done();
              });
            });
          });
          page.goto(`http://localhost:${port}/main`);
        });
      });
    });

    describe('testing when liveReload is enabled', () => {
      beforeAll((done) => {
        const options = {
          port,
          liveReload: true,
          ...wsOption,
        };
        server = testServer.start(config, options, done);
        req = request(`http://localhost:${port}`);
      });

      afterAll(testServer.close);

      it('should be injected', (done) => {
        // TODO: listen for websocket requestType via puppeteer when added
        // to puppeteer: https://github.com/puppeteer/puppeteer/issues/2974
        runBrowser().then(({ page, browser }) => {
          page.on('console', ({ _text }) => {
            res.push(_text);
          });
          page.waitForNavigation({ waitUntil: 'load' }).then(() => {
            page.waitForTimeout(beforeBrowserCloseDelay).then(() => {
              browser.close().then(() => {
                // if the error msg doesn't exist that means the ws websocket is working.
                expect(res.includes(errorMsg)).toBe(false);
                done();
              });
            });
          });
          page.goto(`http://localhost:${port}/main`);
        });
      });
    });

    describe('testing when liveReload is disabled', () => {
      beforeAll((done) => {
        const options = {
          port,
          liveReload: false,
          ...wsOption,
        };
        server = testServer.start(config, options, done);
        req = request(`http://localhost:${port}`);
      });

      afterAll(testServer.close);

      it('should be injected', (done) => {
        // TODO: listen for websocket requestType via puppeteer when added
        // to puppeteer: https://github.com/puppeteer/puppeteer/issues/2974
        runBrowser().then(({ page, browser }) => {
          page.on('console', ({ _text }) => {
            res.push(_text);
          });
          page.waitForNavigation({ waitUntil: 'load' }).then(() => {
            page.waitForTimeout(beforeBrowserCloseDelay).then(() => {
              browser.close().then(() => {
                // if the error msg doesn't exist that means the ws websocket is working.
                expect(res.includes(errorMsg)).toBe(false);
                done();
              });
            });
          });
          page.goto(`http://localhost:${port}/main`);
        });
      });
    });

    describe('testing when hot is enabled', () => {
      beforeAll((done) => {
        const options = {
          port,
          hot: true,
          ...wsOption,
        };
        server = testServer.start(config, options, done);
        req = request(`http://localhost:${port}`);
      });

      afterAll(testServer.close);

      it('should be injected', (done) => {
        // TODO: listen for websocket requestType via puppeteer when added
        // to puppeteer: https://github.com/puppeteer/puppeteer/issues/2974
        runBrowser().then(({ page, browser }) => {
          page.on('console', ({ _text }) => {
            res.push(_text);
          });
          page.waitForNavigation({ waitUntil: 'load' }).then(() => {
            page.waitForTimeout(beforeBrowserCloseDelay).then(() => {
              browser.close().then(() => {
                // if the error msg doesn't exist that means the ws websocket is working.
                expect(res.includes(errorMsg)).toBe(false);
                done();
              });
            });
          });
          page.goto(`http://localhost:${port}/main`);
        });
      });
    });

    describe('testing when hot is enabled and liveReload is disabled', () => {
      beforeAll((done) => {
        const options = {
          port,
          hot: true,
          liveReload: false,
          ...wsOption,
        };
        server = testServer.start(config, options, done);
        req = request(`http://localhost:${port}`);
      });

      afterAll(testServer.close);

      it('should be injected', (done) => {
        // TODO: listen for websocket requestType via puppeteer when added
        // to puppeteer: https://github.com/puppeteer/puppeteer/issues/2974
        runBrowser().then(({ page, browser }) => {
          page.on('console', ({ _text }) => {
            res.push(_text);
          });
          page.waitForNavigation({ waitUntil: 'load' }).then(() => {
            page.waitForTimeout(beforeBrowserCloseDelay).then(() => {
              browser.close().then(() => {
                // if the error msg doesn't exist that means the ws websocket is working.
                expect(res.includes(errorMsg)).toBe(false);
                done();
              });
            });
          });
          page.goto(`http://localhost:${port}/main`);
        });
      });
    });

    describe('testing when hot is disabled and liveReload is enabled', () => {
      beforeAll((done) => {
        const options = {
          port,
          hot: false,
          liveReload: true,
          ...wsOption,
        };
        server = testServer.start(config, options, done);
        req = request(`http://localhost:${port}`);
      });

      afterAll(testServer.close);

      it('should be injected', (done) => {
        // TODO: listen for websocket requestType via puppeteer when added
        // to puppeteer: https://github.com/puppeteer/puppeteer/issues/2974
        runBrowser().then(({ page, browser }) => {
          page.on('console', ({ _text }) => {
            res.push(_text);
          });
          page.waitForNavigation({ waitUntil: 'load' }).then(() => {
            page.waitForTimeout(beforeBrowserCloseDelay).then(() => {
              browser.close().then(() => {
                // if the error msg doesn't exist that means the ws websocket is working.
                expect(res.includes(errorMsg)).toBe(false);
                done();
              });
            });
          });
          page.goto(`http://localhost:${port}/main`);
        });
      });
    });

    describe('testing when hot and liveReload are disabled', () => {
      beforeAll((done) => {
        const options = {
          port,
          hot: false,
          liveReload: false,
          ...wsOption,
        };
        server = testServer.start(config, options, done);
        req = request(`http://localhost:${port}`);
      });

      afterAll(testServer.close);

      it('should not be injected', (done) => {
        // TODO: listen for websocket requestType via puppeteer when added
        // to puppeteer: https://github.com/puppeteer/puppeteer/issues/2974
        runBrowser().then(({ page, browser }) => {
          page.on('console', ({ _text }) => {
            res.push(_text);
          });
          page.waitForNavigation({ waitUntil: 'load' }).then(() => {
            page.waitForTimeout(beforeBrowserCloseDelay).then(() => {
              browser.close().then(() => {
                // if the error msg doesn't exist that means the ws websocket is working.
                expect(res.includes(errorMsg)).toBe(true);
                done();
              });
            });
          });
          page.goto(`http://localhost:${port}/main`);
        });
      });
    });
  }
});

describe('sockjs websocket client injection', () => {
  let req;
  let server;

  describe('testing default settings', () => {
    beforeAll((done) => {
      const options = {
        port,
        client: {
          transport: 'sockjs',
        },
      };
      server = testServer.start(config, options, done);
      req = request(`http://localhost:${port}`);
    });

    afterAll(testServer.close);

    it('should be injected', (done) => {
      req.get('/ws').expect(200, 'Welcome to SockJS!\n', done);
    });
  });

  describe('testing when liveReload is enabled', () => {
    beforeAll((done) => {
      const options = {
        port,
        liveReload: true,
        client: {
          transport: 'sockjs',
        },
      };
      server = testServer.start(config, options, done);
      req = request(`http://localhost:${port}`);
    });

    afterAll(testServer.close);

    it('should be injected', (done) => {
      req.get('/ws').expect(200, 'Welcome to SockJS!\n', done);
    });
  });

  describe('testing when liveReload is disabled', () => {
    beforeAll((done) => {
      const options = {
        port,
        liveReload: false,
        client: {
          transport: 'sockjs',
        },
      };
      server = testServer.start(config, options, done);
      req = request(`http://localhost:${port}`);
    });

    afterAll(testServer.close);

    it('should be injected', (done) => {
      req.get('/ws').expect(200, 'Welcome to SockJS!\n', done);
    });
  });

  describe('testing when hot is enabled', () => {
    beforeAll((done) => {
      const options = {
        port,
        hot: true,
        client: {
          transport: 'sockjs',
        },
      };
      server = testServer.start(config, options, done);
      req = request(`http://localhost:${port}`);
    });

    afterAll(testServer.close);

    it('should be injected', (done) => {
      req.get('/ws').expect(200, 'Welcome to SockJS!\n', done);
    });
  });

  describe('testing when hot is enabled and liveReload is disabled', () => {
    beforeAll((done) => {
      const options = {
        port,
        hot: true,
        liveReload: false,
        client: {
          transport: 'sockjs',
        },
      };
      server = testServer.start(config, options, done);
      req = request(`http://localhost:${port}`);
    });

    afterAll(testServer.close);

    it('should be injected', (done) => {
      req.get('/ws').expect(200, 'Welcome to SockJS!\n', done);
    });
  });

  describe('testing when hot is disabled and liveReload is enabled', () => {
    beforeAll((done) => {
      const options = {
        port,
        hot: false,
        liveReload: true,
        client: {
          transport: 'sockjs',
        },
      };
      server = testServer.start(config, options, done);
      req = request(`http://localhost:${port}`);
    });

    afterAll(testServer.close);

    it('should be injected', (done) => {
      req.get('/ws').expect(200, 'Welcome to SockJS!\n', done);
    });
  });

  describe('testing when hot and liveReload are disabled', () => {
    beforeAll((done) => {
      const options = {
        port,
        hot: false,
        liveReload: false,
        client: {
          transport: 'sockjs',
        },
      };
      server = testServer.start(config, options, done);
      req = request(`http://localhost:${port}`);
    });

    afterAll(testServer.close);

    it('should not be injected', (done) => {
      req
        .get('/ws')
        .expect(404)
        .then(({ res }) => {
          expect(res.text.includes('Cannot GET /ws')).toBe(true);
          done();
        });
    });
  });
});
