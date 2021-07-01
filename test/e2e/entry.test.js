'use strict';

const path = require('path');
const webpack = require('webpack');
const Server = require('../../lib/Server');
const config = require('../fixtures/client-config/webpack.config');
const runBrowser = require('../helpers/run-browser');
const port = require('../ports-map').entry;
const isWebpack5 = require('../helpers/isWebpack5');

describe('entry', () => {
  const entryFirst = path.resolve(
    __dirname,
    '../fixtures/client-config/foo.js'
  );
  const entrySecond = path.resolve(
    __dirname,
    '../fixtures/client-config/bar.js'
  );

  const itOnlyWebpack5 = isWebpack5 ? it : it.skip;

  it('should work with single entry', async () => {
    const compiler = webpack({ ...config, entry: entryFirst });
    const devServerOptions = {
      host: '127.0.0.1',
      port,
    };
    const server = new Server(devServerOptions, compiler);

    await new Promise((resolve, reject) => {
      server.listen(port, '127.0.0.1', (error) => {
        if (error) {
          reject(error);

          return;
        }

        resolve();
      });
    });

    const { page, browser } = await runBrowser();

    const pageErrors = [];
    const consoleMessages = [];

    page
      .on('console', (message) => {
        consoleMessages.push(message);
      })
      .on('pageerror', (error) => {
        pageErrors.push(error);
      });

    await page.goto(`http://127.0.0.1:${port}/main`, {
      waitUntil: 'networkidle0',
    });

    expect(consoleMessages.map((message) => message.text())).toMatchSnapshot(
      'console messages'
    );
    expect(pageErrors).toMatchSnapshot('page errors');

    await browser.close();
    await new Promise((resolve, reject) => {
      server.close((error) => {
        if (error) {
          reject(error);

          return;
        }

        resolve();
      });
    });
  });

  it('should work with single array entry', async () => {
    const compiler = webpack({ ...config, entry: [entryFirst, entrySecond] });
    const devServerOptions = {
      host: '127.0.0.1',
      port,
    };
    const server = new Server(devServerOptions, compiler);

    await new Promise((resolve, reject) => {
      server.listen(port, '127.0.0.1', (error) => {
        if (error) {
          reject(error);

          return;
        }

        resolve();
      });
    });

    const { page, browser } = await runBrowser();

    const pageErrors = [];
    const consoleMessages = [];

    page
      .on('console', (message) => {
        consoleMessages.push(message);
      })
      .on('pageerror', (error) => {
        pageErrors.push(error);
      });

    await page.goto(`http://127.0.0.1:${port}/main`, {
      waitUntil: 'networkidle0',
    });

    expect(consoleMessages.map((message) => message.text())).toMatchSnapshot(
      'console messages'
    );
    expect(pageErrors).toMatchSnapshot('page errors');

    await browser.close();
    await new Promise((resolve, reject) => {
      server.close((error) => {
        if (error) {
          reject(error);

          return;
        }

        resolve();
      });
    });
  });

  itOnlyWebpack5('should work with object entry', async () => {
    const compiler = webpack({
      ...config,
      entry: {
        main: { import: entryFirst },
      },
    });
    const devServerOptions = {
      host: '127.0.0.1',
      port,
    };
    const server = new Server(devServerOptions, compiler);

    await new Promise((resolve, reject) => {
      server.listen(port, '127.0.0.1', (error) => {
        if (error) {
          reject(error);

          return;
        }

        resolve();
      });
    });

    const { page, browser } = await runBrowser();

    const pageErrors = [];
    const consoleMessages = [];

    page
      .on('console', (message) => {
        consoleMessages.push(message);
      })
      .on('pageerror', (error) => {
        pageErrors.push(error);
      });

    await page.goto(`http://127.0.0.1:${port}/main`, {
      waitUntil: 'networkidle0',
    });

    expect(consoleMessages.map((message) => message.text())).toMatchSnapshot(
      'console messages'
    );
    expect(pageErrors).toMatchSnapshot('page errors');

    await browser.close();
    await new Promise((resolve, reject) => {
      server.close((error) => {
        if (error) {
          reject(error);

          return;
        }

        resolve();
      });
    });
  });

  it('should work with dynamic entry', async () => {
    const compiler = webpack({ ...config, entry: () => entryFirst });
    const devServerOptions = {
      host: '127.0.0.1',
      port,
    };
    const server = new Server(devServerOptions, compiler);

    await new Promise((resolve, reject) => {
      server.listen(port, '127.0.0.1', (error) => {
        if (error) {
          reject(error);

          return;
        }

        resolve();
      });
    });

    const { page, browser } = await runBrowser();

    const pageErrors = [];
    const consoleMessages = [];

    page
      .on('console', (message) => {
        consoleMessages.push(message);
      })
      .on('pageerror', (error) => {
        pageErrors.push(error);
      });

    await page.goto(`http://127.0.0.1:${port}/main`, {
      waitUntil: 'networkidle0',
    });

    expect(consoleMessages.map((message) => message.text())).toMatchSnapshot(
      'console messages'
    );
    expect(pageErrors).toMatchSnapshot('page errors');

    await browser.close();
    await new Promise((resolve, reject) => {
      server.close((error) => {
        if (error) {
          reject(error);

          return;
        }

        resolve();
      });
    });
  });

  it('should work with dynamic async entry', async () => {
    const compiler = webpack({
      ...config,
      entry: () => new Promise((resolve) => resolve([entryFirst])),
    });
    const devServerOptions = {
      host: '127.0.0.1',
      port,
    };
    const server = new Server(devServerOptions, compiler);

    await new Promise((resolve, reject) => {
      server.listen(port, '127.0.0.1', (error) => {
        if (error) {
          reject(error);

          return;
        }

        resolve();
      });
    });

    const { page, browser } = await runBrowser();

    const pageErrors = [];
    const consoleMessages = [];

    page
      .on('console', (message) => {
        consoleMessages.push(message);
      })
      .on('pageerror', (error) => {
        pageErrors.push(error);
      });

    await page.goto(`http://127.0.0.1:${port}/main`, {
      waitUntil: 'networkidle0',
    });

    expect(consoleMessages.map((message) => message.text())).toMatchSnapshot(
      'console messages'
    );
    expect(pageErrors).toMatchSnapshot('page errors');

    await browser.close();
    await new Promise((resolve, reject) => {
      server.close((error) => {
        if (error) {
          reject(error);

          return;
        }

        resolve();
      });
    });
  });

  it('should work with multiple entries', async () => {
    const compiler = webpack({
      ...config,
      entry: {
        foo: entryFirst,
        bar: entrySecond,
      },
      optimization: {
        runtimeChunk: {
          name: 'runtime',
        },
      },
    });
    const devServerOptions = {
      host: '127.0.0.1',
      port,
    };
    const server = new Server(devServerOptions, compiler);

    await new Promise((resolve, reject) => {
      server.listen(port, '127.0.0.1', (error) => {
        if (error) {
          reject(error);

          return;
        }

        resolve();
      });
    });

    const { page, browser } = await runBrowser();

    const pageErrors = [];
    const consoleMessages = [];

    page
      .on('console', (message) => {
        consoleMessages.push(message);
      })
      .on('pageerror', (error) => {
        pageErrors.push(error);
      });

    await page.goto(`http://127.0.0.1:${port}/test.html`, {
      waitUntil: 'networkidle0',
    });
    await page.addScriptTag({ url: `http://127.0.0.1:${port}/runtime.js` });
    await page.addScriptTag({ url: `http://127.0.0.1:${port}/foo.js` });
    await page.waitForFunction(() => window.fooChunkLoaded);

    expect(consoleMessages.map((message) => message.text())).toMatchSnapshot(
      'console messages'
    );
    expect(pageErrors).toMatchSnapshot('page errors');

    await browser.close();
    await new Promise((resolve, reject) => {
      server.close((error) => {
        if (error) {
          reject(error);

          return;
        }

        resolve();
      });
    });
  });

  it('should work with multiple entries #2', async () => {
    const compiler = webpack({
      ...config,
      entry: {
        foo: entryFirst,
        bar: entrySecond,
      },
      optimization: {
        runtimeChunk: {
          name: 'runtime',
        },
      },
    });
    const devServerOptions = {
      host: '127.0.0.1',
      port,
    };
    const server = new Server(devServerOptions, compiler);

    await new Promise((resolve, reject) => {
      server.listen(port, '127.0.0.1', (error) => {
        if (error) {
          reject(error);

          return;
        }

        resolve();
      });
    });

    const { page, browser } = await runBrowser();

    const pageErrors = [];
    const consoleMessages = [];

    page
      .on('console', (message) => {
        consoleMessages.push(message);
      })
      .on('pageerror', (error) => {
        pageErrors.push(error);
      });

    await page.goto(`http://127.0.0.1:${port}/test.html`, {
      waitUntil: 'networkidle0',
    });
    await page.addScriptTag({ url: `http://127.0.0.1:${port}/runtime.js` });
    await page.addScriptTag({ url: `http://127.0.0.1:${port}/bar.js` });
    await page.waitForFunction(() => window.barChunkLoaded);

    expect(consoleMessages.map((message) => message.text())).toMatchSnapshot(
      'console messages'
    );
    expect(pageErrors).toMatchSnapshot('page errors');

    await browser.close();
    await new Promise((resolve, reject) => {
      server.close((error) => {
        if (error) {
          reject(error);

          return;
        }

        resolve();
      });
    });
  });

  itOnlyWebpack5(
    'should work with multiple entries and "dependOn"',
    async () => {
      const compiler = webpack({
        ...config,
        entry: {
          foo: {
            import: entryFirst,
            dependOn: 'bar',
          },
          bar: entrySecond,
        },
      });
      const devServerOptions = {
        host: '127.0.0.1',
        port,
      };
      const server = new Server(devServerOptions, compiler);

      await new Promise((resolve, reject) => {
        server.listen(port, '127.0.0.1', (error) => {
          if (error) {
            reject(error);

            return;
          }

          resolve();
        });
      });

      const { page, browser } = await runBrowser();

      const pageErrors = [];
      const consoleMessages = [];

      page
        .on('console', (message) => {
          consoleMessages.push(message);
        })
        .on('pageerror', (error) => {
          pageErrors.push(error);
        });

      await page.goto(`http://127.0.0.1:${port}/test.html`, {
        waitUntil: 'networkidle0',
      });
      await page.addScriptTag({ url: `http://127.0.0.1:${port}/bar.js` });
      await page.addScriptTag({ url: `http://127.0.0.1:${port}/foo.js` });
      await page.waitForFunction(() => window.fooChunkLoaded);

      expect(consoleMessages.map((message) => message.text())).toMatchSnapshot(
        'console messages'
      );
      expect(pageErrors).toMatchSnapshot('page errors');

      await browser.close();
      await new Promise((resolve, reject) => {
        server.close((error) => {
          if (error) {
            reject(error);

            return;
          }

          resolve();
        });
      });
    }
  );

  itOnlyWebpack5('should work with empty', async () => {
    const compiler = webpack({
      ...config,
      entry: {},
    });

    new webpack.EntryPlugin(compiler.context, entryFirst, {
      // eslint-disable-next-line no-undefined
      name: 'main',
    }).apply(compiler);

    const devServerOptions = {
      host: '127.0.0.1',
      port,
    };
    const server = new Server(devServerOptions, compiler);

    await new Promise((resolve, reject) => {
      server.listen(port, '127.0.0.1', (error) => {
        if (error) {
          reject(error);

          return;
        }

        resolve();
      });
    });

    const { page, browser } = await runBrowser();

    const pageErrors = [];
    const consoleMessages = [];

    page
      .on('console', (message) => {
        consoleMessages.push(message);
      })
      .on('pageerror', (error) => {
        pageErrors.push(error);
      });

    await page.goto(`http://127.0.0.1:${port}/main`, {
      waitUntil: 'networkidle0',
    });

    expect(consoleMessages.map((message) => message.text())).toMatchSnapshot(
      'console messages'
    );
    expect(pageErrors).toMatchSnapshot('page errors');

    await browser.close();
    await new Promise((resolve, reject) => {
      server.close((error) => {
        if (error) {
          reject(error);

          return;
        }

        resolve();
      });
    });
  });
});
