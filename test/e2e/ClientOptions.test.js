'use strict';

const express = require('express');
const httpProxy = require('http-proxy-middleware');
const request = require('supertest');
const testServer = require('../helpers/test-server');
const config = require('../fixtures/client-config/webpack.config');
const runBrowser = require('../helpers/run-browser');
const timer = require('../helpers/timer');
const [port1, port2, port3] = require('../ports-map').ClientOptions;

describe('Client code', () => {
  function startProxy(port) {
    const proxy = express();
    proxy.use(
      '/',
      httpProxy({
        target: `http://localhost:${port1}`,
        ws: true,
        changeOrigin: true,
      })
    );
    return proxy.listen(port);
  }

  beforeAll((done) => {
    const options = {
      compress: true,
      port: port1,
      host: '0.0.0.0',
      disableHostCheck: true,
      inline: true,
      hot: true,
      watchOptions: {
        poll: true,
      },
    };
    testServer.startAwaitingCompilation(config, options, done);
  });

  afterAll(testServer.close);

  // [HPM] Proxy created: /  ->  http://localhost:{port1}
  describe('behind a proxy', () => {
    let proxy;

    beforeAll(() => {
      proxy = startProxy(port2);
    });

    afterAll((done) => {
      proxy.close(() => {
        done();
      });
    });

    it('responds with a 200', async () => {
      await request(`http://localhost:${port2}`)
        .get('/sockjs-node')
        .expect(200, 'Welcome to SockJS!\n');
      await request(`http://localhost:${port1}`)
        .get('/sockjs-node')
        .expect(200, 'Welcome to SockJS!\n');
    });

    it('requests websocket through the proxy with proper port number', async () => {
      const { page, browser } = await runBrowser();

      page.goto(`http://localhost:${port2}/main`);

      const req = await page.waitForRequest((requestObj) =>
        requestObj.url().match(/sockjs-node/)
      );

      expect(
        req.url().includes(`http://localhost:${port1}/sockjs-node`)
      ).toBeTruthy();

      await browser.close();
    });
  });
});

describe('Client complex inline script path', () => {
  beforeAll((done) => {
    const options = {
      port: port2,
      host: '0.0.0.0',
      inline: true,
      watchOptions: {
        poll: true,
      },
      public: 'myhost.test',
      sockPath: '/foo/test/bar/',
    };
    testServer.startAwaitingCompilation(config, options, done);
  });

  afterAll(testServer.close);

  describe('browser client', () => {
    it('uses the correct public hostname and sockPath', async () => {
      const { page, browser } = await runBrowser();

      page.goto(`http://localhost:${port2}/main`);

      const req = await page.waitForRequest((requestObj) =>
        requestObj.url().match(/foo\/test\/bar/)
      );

      expect(
        req.url().includes(`http://myhost.test:${port2}/foo/test/bar/`)
      ).toBeTruthy();

      await browser.close();
    });
  });
});

describe('Client complex inline script path with sockPort', () => {
  beforeAll((done) => {
    const options = {
      port: port2,
      host: '0.0.0.0',
      inline: true,
      watchOptions: {
        poll: true,
      },
      sockPath: '/foo/test/bar/',
      sockPort: port3,
    };
    testServer.startAwaitingCompilation(config, options, done);
  });

  afterAll(testServer.close);

  describe('browser client', () => {
    it('uses the correct sockPort', async () => {
      const { page, browser } = await runBrowser();

      page.goto(`http://localhost:${port2}/main`);

      const req = await page.waitForRequest((requestObj) =>
        requestObj.url().match(/foo\/test\/bar/)
      );

      expect(
        req.url().includes(`http://localhost:${port3}/foo/test/bar`)
      ).toBeTruthy();

      await browser.close();
    });
  });
});

// previously, using sockPort without sockPath had the ability
// to alter the sockPath (based on a bug in client-src/index.js)
// so we need to make sure sockPath is not altered in this case
describe('Client complex inline script path with sockPort, no sockPath', () => {
  beforeAll((done) => {
    const options = {
      port: port2,
      host: '0.0.0.0',
      inline: true,
      watchOptions: {
        poll: true,
      },
      sockPort: port3,
    };
    testServer.startAwaitingCompilation(config, options, done);
  });

  afterAll(testServer.close);

  describe('browser client', () => {
    it('uses the correct sockPort and sockPath', async () => {
      const { page, browser } = await runBrowser();

      page.goto(`http://localhost:${port2}/main`);

      const req = await page.waitForRequest((requestObj) =>
        requestObj.url().match(/sockjs-node/)
      );

      expect(
        req.url().includes(`http://localhost:${port3}/sockjs-node`)
      ).toBeTruthy();

      await browser.close();
    });
  });
});

describe('Client complex inline script path with sockHost', () => {
  beforeAll((done) => {
    const options = {
      port: port2,
      host: '0.0.0.0',
      inline: true,
      watchOptions: {
        poll: true,
      },
      sockHost: 'myhost.test',
    };
    testServer.startAwaitingCompilation(config, options, done);
  });

  afterAll(testServer.close);

  describe('browser client', () => {
    it('uses the correct sockHost', async () => {
      const { page, browser } = await runBrowser();

      page.goto(`http://localhost:${port2}/main`);

      const req = await page.waitForRequest((requestObj) =>
        requestObj.url().match(/sockjs-node/)
      );

      expect(
        req.url().includes(`http://myhost.test:${port2}/sockjs-node`)
      ).toBeTruthy();

      await browser.close();
    });
  });
});

describe('Client console.log', () => {
  const baseOptions = {
    port: port2,
    host: '0.0.0.0',
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
    {
      title: 'clientLogLevel is silent',
      options: {
        clientLogLevel: 'silent',
      },
    },
  ];

  for (const { title, options } of cases) {
    it(title, async () => {
      const res = [];
      const testOptions = Object.assign({}, baseOptions, options);

      // TODO: refactor(hiroppy)
      await new Promise((resolve) => {
        testServer.startAwaitingCompilation(config, testOptions, resolve);
      });

      const { page, browser } = await runBrowser();

      page.goto(`http://localhost:${port2}/main`);
      page.on('console', ({ _text }) => {
        res.push(_text);
      });

      await timer(1000);

      expect(res).toMatchSnapshot();
      await browser.close();

      // TODO: refactor(hiroppy)
      await new Promise((resolve) => {
        testServer.close(resolve);
      });
    });
  }
});
