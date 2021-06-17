'use strict';

const fs = require('fs');
const path = require('path');
const prettier = require('prettier');
const webpack = require('webpack');
const Server = require('../../lib/Server');
const config = require('../fixtures/overlay-config/webpack.config');
const runBrowser = require('../helpers/run-browser');
const port = require('../ports-map').overlay;

class ErrorPlugin {
  // eslint-disable-next-line class-methods-use-this
  apply(compiler) {
    compiler.hooks.thisCompilation.tap(
      'warnings-webpack-plugin',
      (compilation) => {
        compilation.errors.push(new Error('Error from compilation'));
      }
    );
  }
}

class WarningPlugin {
  // eslint-disable-next-line class-methods-use-this
  apply(compiler) {
    compiler.hooks.thisCompilation.tap(
      'warnings-webpack-plugin',
      (compilation) => {
        compilation.warnings.push(new Error('Warning from compilation'));
      }
    );
  }
}

describe('overlay', () => {
  it('should open on a warning for initial compilation', async () => {
    const compiler = webpack(config);

    new WarningPlugin().apply(compiler);

    const devServerOptions = Object.assign(
      {},
      {
        host: '0.0.0.0',
        port,
      }
    );
    const server = new Server(devServerOptions, compiler);

    await new Promise((resolve, reject) => {
      server.listen(devServerOptions.port, devServerOptions.host, (error) => {
        if (error) {
          reject(error);

          return;
        }

        resolve();
      });
    });

    const { page, browser } = await runBrowser();

    await page.goto(`http://localhost:${port}/main`, {
      waitUntil: 'networkidle0',
    });

    const pageHtml = await page.evaluate(() => document.body.outerHTML);
    const overlayHandle = await page.$('#webpack-dev-server-client-overlay');
    const overlayFrame = await overlayHandle.contentFrame();
    const overlayHtml = await overlayFrame.evaluate(
      () => document.body.outerHTML
    );

    expect(prettier.format(pageHtml, { parser: 'html' })).toMatchSnapshot(
      'page html'
    );
    expect(prettier.format(overlayHtml, { parser: 'html' })).toMatchSnapshot(
      'overlay html'
    );

    await browser.close();
    await new Promise((resolve) => {
      server.close(() => {
        resolve();
      });
    });
  });

  it('should open on an error for initial compilation', async () => {
    const compiler = webpack(config);

    new ErrorPlugin().apply(compiler);

    const devServerOptions = Object.assign(
      {},
      {
        host: '0.0.0.0',
        port,
      }
    );
    const server = new Server(devServerOptions, compiler);

    await new Promise((resolve, reject) => {
      server.listen(devServerOptions.port, devServerOptions.host, (error) => {
        if (error) {
          reject(error);

          return;
        }

        resolve();
      });
    });

    const { page, browser } = await runBrowser();

    await page.goto(`http://localhost:${port}/main`, {
      waitUntil: 'networkidle0',
    });

    const pageHtml = await page.evaluate(() => document.body.outerHTML);
    const overlayHandle = await page.$('#webpack-dev-server-client-overlay');
    const overlayFrame = await overlayHandle.contentFrame();
    const overlayHtml = await overlayFrame.evaluate(
      () => document.body.outerHTML
    );

    expect(prettier.format(pageHtml, { parser: 'html' })).toMatchSnapshot(
      'page html'
    );
    expect(prettier.format(overlayHtml, { parser: 'html' })).toMatchSnapshot(
      'overlay html'
    );

    await browser.close();
    await new Promise((resolve) => {
      server.close(() => {
        resolve();
      });
    });
  });

  // TODO fix me
  it('should open on a warning and error for initial compilation and prefer error to show', async () => {
    const compiler = webpack(config);

    new WarningPlugin().apply(compiler);
    new ErrorPlugin().apply(compiler);

    const devServerOptions = Object.assign(
      {},
      {
        host: '0.0.0.0',
        port,
      }
    );
    const server = new Server(devServerOptions, compiler);

    await new Promise((resolve, reject) => {
      server.listen(devServerOptions.port, devServerOptions.host, (error) => {
        if (error) {
          reject(error);

          return;
        }

        resolve();
      });
    });

    const { page, browser } = await runBrowser();

    await page.goto(`http://localhost:${port}/main`, {
      waitUntil: 'networkidle0',
    });

    const pageHtml = await page.evaluate(() => document.body.outerHTML);
    const overlayHandle = await page.$('#webpack-dev-server-client-overlay');
    const overlayFrame = await overlayHandle.contentFrame();
    const overlayHtml = await overlayFrame.evaluate(
      () => document.body.outerHTML
    );

    expect(prettier.format(pageHtml, { parser: 'html' })).toMatchSnapshot(
      'page html'
    );
    expect(prettier.format(overlayHtml, { parser: 'html' })).toMatchSnapshot(
      'overlay html'
    );

    await browser.close();
    await new Promise((resolve) => {
      server.close(() => {
        resolve();
      });
    });
  });

  it('should not open initially, then open on an error, then close on fix', async () => {
    const compiler = webpack(config);
    const devServerOptions = Object.assign(
      {},
      {
        host: '0.0.0.0',
        port,
      }
    );
    const server = new Server(devServerOptions, compiler);

    await new Promise((resolve, reject) => {
      server.listen(devServerOptions.port, devServerOptions.host, (error) => {
        if (error) {
          reject(error);

          return;
        }

        resolve();
      });
    });

    const { page, browser } = await runBrowser();

    await page.goto(`http://localhost:${port}/main`, {
      waitUntil: 'networkidle0',
    });

    let pageHtml = await page.evaluate(() => document.body.outerHTML);
    let overlayHandle = await page.$('#webpack-dev-server-client-overlay');

    expect(overlayHandle).toBe(null);
    expect(prettier.format(pageHtml, { parser: 'html' })).toMatchSnapshot(
      'page html initial'
    );

    const pathToFile = path.resolve(
      __dirname,
      '../fixtures/overlay-config/foo.js'
    );
    const originalCode = fs.readFileSync(pathToFile);

    fs.writeFileSync(pathToFile, '`;');

    await page.waitForSelector('#webpack-dev-server-client-overlay');

    overlayHandle = await page.$('#webpack-dev-server-client-overlay');
    pageHtml = await page.evaluate(() => document.body.outerHTML);

    const overlayFrame = await overlayHandle.contentFrame();
    const overlayHtml = await overlayFrame.evaluate(
      () => document.body.outerHTML
    );

    expect(prettier.format(pageHtml, { parser: 'html' })).toMatchSnapshot(
      'page html with error'
    );
    expect(prettier.format(overlayHtml, { parser: 'html' })).toMatchSnapshot(
      'overlay html'
    );

    fs.writeFileSync(pathToFile, originalCode);

    await page.waitForSelector('#webpack-dev-server-client-overlay', {
      hidden: true,
    });

    pageHtml = await page.evaluate(() => document.body.outerHTML);
    overlayHandle = await page.$('#webpack-dev-server-client-overlay');

    expect(overlayHandle).toBe(null);
    expect(prettier.format(pageHtml, { parser: 'html' })).toMatchSnapshot(
      'page html after fix error'
    );

    await browser.close();
    await new Promise((resolve) => {
      server.close(() => {
        resolve();
      });
    });
  });

  it('should not open initially, then open on an error and allow to close', async () => {
    const compiler = webpack(config);
    const devServerOptions = Object.assign(
      {},
      {
        host: '0.0.0.0',
        port,
      }
    );
    const server = new Server(devServerOptions, compiler);

    await new Promise((resolve, reject) => {
      server.listen(devServerOptions.port, devServerOptions.host, (error) => {
        if (error) {
          reject(error);

          return;
        }

        resolve();
      });
    });

    const { page, browser } = await runBrowser();

    await page.goto(`http://localhost:${port}/main`, {
      waitUntil: 'networkidle0',
    });

    let pageHtml = await page.evaluate(() => document.body.outerHTML);
    let overlayHandle = await page.$('#webpack-dev-server-client-overlay');

    expect(overlayHandle).toBe(null);
    expect(prettier.format(pageHtml, { parser: 'html' })).toMatchSnapshot(
      'page html initial'
    );

    const pathToFile = path.resolve(
      __dirname,
      '../fixtures/overlay-config/foo.js'
    );
    const originalCode = fs.readFileSync(pathToFile);

    fs.writeFileSync(pathToFile, '`;');

    await page.waitForSelector('#webpack-dev-server-client-overlay');

    overlayHandle = await page.$('#webpack-dev-server-client-overlay');
    pageHtml = await page.evaluate(() => document.body.outerHTML);

    const overlayFrame = await overlayHandle.contentFrame();
    const overlayHtml = await overlayFrame.evaluate(
      () => document.body.outerHTML
    );

    expect(prettier.format(pageHtml, { parser: 'html' })).toMatchSnapshot(
      'page html with error'
    );
    expect(prettier.format(overlayHtml, { parser: 'html' })).toMatchSnapshot(
      'overlay html'
    );

    const frame = await page
      .frames()
      .find((item) => item.name() === 'webpack-dev-server-client-overlay');

    const buttonHandle = await frame.$('button');

    await buttonHandle.click();

    await page.waitForSelector('#webpack-dev-server-client-overlay', {
      hidden: true,
    });

    pageHtml = await page.evaluate(() => document.body.outerHTML);
    overlayHandle = await page.$('#webpack-dev-server-client-overlay');

    expect(overlayHandle).toBe(null);
    expect(prettier.format(pageHtml, { parser: 'html' })).toMatchSnapshot(
      'page html after close'
    );

    fs.writeFileSync(pathToFile, originalCode);

    await browser.close();
    await new Promise((resolve) => {
      server.close(() => {
        resolve();
      });
    });
  });

  it('should not open on a warning when "client.overlay" is "false"', async () => {
    const compiler = webpack(config);

    new WarningPlugin().apply(compiler);

    const devServerOptions = Object.assign(
      {},
      {
        host: '0.0.0.0',
        port,
        client: {
          overlay: false,
        },
      }
    );
    const server = new Server(devServerOptions, compiler);

    await new Promise((resolve, reject) => {
      server.listen(devServerOptions.port, devServerOptions.host, (error) => {
        if (error) {
          reject(error);

          return;
        }

        resolve();
      });
    });

    const { page, browser } = await runBrowser();

    await page.goto(`http://localhost:${port}/main`, {
      waitUntil: 'networkidle0',
    });

    const pageHtml = await page.evaluate(() => document.body.outerHTML);
    const overlayHandle = await page.$('#webpack-dev-server-client-overlay');

    expect(overlayHandle).toBe(null);
    expect(prettier.format(pageHtml, { parser: 'html' })).toMatchSnapshot(
      'page html'
    );

    await browser.close();
    await new Promise((resolve) => {
      server.close(() => {
        resolve();
      });
    });
  });

  it('should not open on a warning when "client.overlay.warnings" is "false"', async () => {
    const compiler = webpack(config);

    new WarningPlugin().apply(compiler);

    const devServerOptions = Object.assign(
      {},
      {
        host: '0.0.0.0',
        port,
        client: {
          overlay: {
            warnings: false,
          },
        },
      }
    );
    const server = new Server(devServerOptions, compiler);

    await new Promise((resolve, reject) => {
      server.listen(devServerOptions.port, devServerOptions.host, (error) => {
        if (error) {
          reject(error);

          return;
        }

        resolve();
      });
    });

    const { page, browser } = await runBrowser();

    await page.goto(`http://localhost:${port}/main`, {
      waitUntil: 'networkidle0',
    });

    const pageHtml = await page.evaluate(() => document.body.outerHTML);
    const overlayHandle = await page.$('#webpack-dev-server-client-overlay');

    expect(overlayHandle).toBe(null);
    expect(prettier.format(pageHtml, { parser: 'html' })).toMatchSnapshot(
      'page html'
    );

    await browser.close();
    await new Promise((resolve) => {
      server.close(() => {
        resolve();
      });
    });
  });

  it('should open on a warning when "client.overlay" is "true"', async () => {
    const compiler = webpack(config);

    new WarningPlugin().apply(compiler);

    const devServerOptions = Object.assign(
      {},
      {
        host: '0.0.0.0',
        port,
        client: {
          overlay: true,
        },
      }
    );
    const server = new Server(devServerOptions, compiler);

    await new Promise((resolve, reject) => {
      server.listen(devServerOptions.port, devServerOptions.host, (error) => {
        if (error) {
          reject(error);

          return;
        }

        resolve();
      });
    });

    const { page, browser } = await runBrowser();

    await page.goto(`http://localhost:${port}/main`, {
      waitUntil: 'networkidle0',
    });

    const pageHtml = await page.evaluate(() => document.body.outerHTML);
    const overlayHandle = await page.$('#webpack-dev-server-client-overlay');
    const overlayFrame = await overlayHandle.contentFrame();
    const overlayHtml = await overlayFrame.evaluate(
      () => document.body.outerHTML
    );

    expect(prettier.format(pageHtml, { parser: 'html' })).toMatchSnapshot(
      'page html'
    );
    expect(prettier.format(overlayHtml, { parser: 'html' })).toMatchSnapshot(
      'overlay html'
    );

    await browser.close();
    await new Promise((resolve) => {
      server.close(() => {
        resolve();
      });
    });
  });

  it('should open on a warning when "client.overlay.warnings" is "true"', async () => {
    const compiler = webpack(config);

    new WarningPlugin().apply(compiler);

    const devServerOptions = Object.assign(
      {},
      {
        host: '0.0.0.0',
        port,
        client: {
          overlay: {
            warnings: true,
          },
        },
      }
    );
    const server = new Server(devServerOptions, compiler);

    await new Promise((resolve, reject) => {
      server.listen(devServerOptions.port, devServerOptions.host, (error) => {
        if (error) {
          reject(error);

          return;
        }

        resolve();
      });
    });

    const { page, browser } = await runBrowser();

    await page.goto(`http://localhost:${port}/main`, {
      waitUntil: 'networkidle0',
    });

    const pageHtml = await page.evaluate(() => document.body.outerHTML);
    const overlayHandle = await page.$('#webpack-dev-server-client-overlay');
    const overlayFrame = await overlayHandle.contentFrame();
    const overlayHtml = await overlayFrame.evaluate(
      () => document.body.outerHTML
    );

    expect(prettier.format(pageHtml, { parser: 'html' })).toMatchSnapshot(
      'page html'
    );
    expect(prettier.format(overlayHtml, { parser: 'html' })).toMatchSnapshot(
      'overlay html'
    );

    await browser.close();
    await new Promise((resolve) => {
      server.close(() => {
        resolve();
      });
    });
  });

  it('should open on a warning when "client.overlay.errors" is "true"', async () => {
    const compiler = webpack(config);

    new WarningPlugin().apply(compiler);

    const devServerOptions = Object.assign(
      {},
      {
        host: '0.0.0.0',
        port,
        client: {
          overlay: {
            errors: true,
          },
        },
      }
    );
    const server = new Server(devServerOptions, compiler);

    await new Promise((resolve, reject) => {
      server.listen(devServerOptions.port, devServerOptions.host, (error) => {
        if (error) {
          reject(error);

          return;
        }

        resolve();
      });
    });

    const { page, browser } = await runBrowser();

    await page.goto(`http://localhost:${port}/main`, {
      waitUntil: 'networkidle0',
    });

    const pageHtml = await page.evaluate(() => document.body.outerHTML);
    const overlayHandle = await page.$('#webpack-dev-server-client-overlay');
    const overlayFrame = await overlayHandle.contentFrame();
    const overlayHtml = await overlayFrame.evaluate(
      () => document.body.outerHTML
    );

    expect(prettier.format(pageHtml, { parser: 'html' })).toMatchSnapshot(
      'page html'
    );
    expect(prettier.format(overlayHtml, { parser: 'html' })).toMatchSnapshot(
      'overlay html'
    );

    await browser.close();
    await new Promise((resolve) => {
      server.close(() => {
        resolve();
      });
    });
  });

  it('should not open on an error when "client.overlay" is "false"', async () => {
    const compiler = webpack(config);

    new ErrorPlugin().apply(compiler);

    const devServerOptions = Object.assign(
      {},
      {
        host: '0.0.0.0',
        port,
        client: {
          overlay: false,
        },
      }
    );
    const server = new Server(devServerOptions, compiler);

    await new Promise((resolve, reject) => {
      server.listen(devServerOptions.port, devServerOptions.host, (error) => {
        if (error) {
          reject(error);

          return;
        }

        resolve();
      });
    });

    const { page, browser } = await runBrowser();

    await page.goto(`http://localhost:${port}/main`, {
      waitUntil: 'networkidle0',
    });

    const pageHtml = await page.evaluate(() => document.body.outerHTML);
    const overlayHandle = await page.$('#webpack-dev-server-client-overlay');

    expect(overlayHandle).toBe(null);
    expect(prettier.format(pageHtml, { parser: 'html' })).toMatchSnapshot(
      'page html'
    );

    await browser.close();
    await new Promise((resolve) => {
      server.close(() => {
        resolve();
      });
    });
  });

  it('should not open on an error when "client.overlay.errors" is "false"', async () => {
    const compiler = webpack(config);

    new ErrorPlugin().apply(compiler);

    const devServerOptions = Object.assign(
      {},
      {
        host: '0.0.0.0',
        port,
        client: {
          overlay: {
            errors: false,
          },
        },
      }
    );
    const server = new Server(devServerOptions, compiler);

    await new Promise((resolve, reject) => {
      server.listen(devServerOptions.port, devServerOptions.host, (error) => {
        if (error) {
          reject(error);

          return;
        }

        resolve();
      });
    });

    const { page, browser } = await runBrowser();

    await page.goto(`http://localhost:${port}/main`, {
      waitUntil: 'networkidle0',
    });

    const pageHtml = await page.evaluate(() => document.body.outerHTML);
    const overlayHandle = await page.$('#webpack-dev-server-client-overlay');

    expect(overlayHandle).toBe(null);
    expect(prettier.format(pageHtml, { parser: 'html' })).toMatchSnapshot(
      'page html'
    );

    await browser.close();
    await new Promise((resolve) => {
      server.close(() => {
        resolve();
      });
    });
  });

  it('should open on an error when "client.overlay" is "true"', async () => {
    const compiler = webpack(config);

    new ErrorPlugin().apply(compiler);

    const devServerOptions = Object.assign(
      {},
      {
        host: '0.0.0.0',
        port,
        client: {
          overlay: true,
        },
      }
    );
    const server = new Server(devServerOptions, compiler);

    await new Promise((resolve, reject) => {
      server.listen(devServerOptions.port, devServerOptions.host, (error) => {
        if (error) {
          reject(error);

          return;
        }

        resolve();
      });
    });

    const { page, browser } = await runBrowser();

    await page.goto(`http://localhost:${port}/main`, {
      waitUntil: 'networkidle0',
    });

    const pageHtml = await page.evaluate(() => document.body.outerHTML);
    const overlayHandle = await page.$('#webpack-dev-server-client-overlay');
    const overlayFrame = await overlayHandle.contentFrame();
    const overlayHtml = await overlayFrame.evaluate(
      () => document.body.outerHTML
    );

    expect(prettier.format(pageHtml, { parser: 'html' })).toMatchSnapshot(
      'page html'
    );
    expect(prettier.format(overlayHtml, { parser: 'html' })).toMatchSnapshot(
      'overlay html'
    );

    await browser.close();
    await new Promise((resolve) => {
      server.close(() => {
        resolve();
      });
    });
  });

  it('should open on an error when "client.overlay.errors" is "true"', async () => {
    const compiler = webpack(config);

    new ErrorPlugin().apply(compiler);

    const devServerOptions = Object.assign(
      {},
      {
        host: '0.0.0.0',
        port,
        client: {
          overlay: {
            errors: true,
          },
        },
      }
    );
    const server = new Server(devServerOptions, compiler);

    await new Promise((resolve, reject) => {
      server.listen(devServerOptions.port, devServerOptions.host, (error) => {
        if (error) {
          reject(error);

          return;
        }

        resolve();
      });
    });

    const { page, browser } = await runBrowser();

    await page.goto(`http://localhost:${port}/main`, {
      waitUntil: 'networkidle0',
    });

    const pageHtml = await page.evaluate(() => document.body.outerHTML);
    const overlayHandle = await page.$('#webpack-dev-server-client-overlay');
    const overlayFrame = await overlayHandle.contentFrame();
    const overlayHtml = await overlayFrame.evaluate(
      () => document.body.outerHTML
    );

    expect(prettier.format(pageHtml, { parser: 'html' })).toMatchSnapshot(
      'page html'
    );
    expect(prettier.format(overlayHtml, { parser: 'html' })).toMatchSnapshot(
      'overlay html'
    );

    await browser.close();
    await new Promise((resolve) => {
      server.close(() => {
        resolve();
      });
    });
  });

  it('should open on an error when "client.overlay.warnings" is "true"', async () => {
    const compiler = webpack(config);

    new WarningPlugin().apply(compiler);

    const devServerOptions = Object.assign(
      {},
      {
        host: '0.0.0.0',
        port,
        client: {
          overlay: {
            warnings: true,
          },
        },
      }
    );
    const server = new Server(devServerOptions, compiler);

    await new Promise((resolve, reject) => {
      server.listen(devServerOptions.port, devServerOptions.host, (error) => {
        if (error) {
          reject(error);

          return;
        }

        resolve();
      });
    });

    const { page, browser } = await runBrowser();

    await page.goto(`http://localhost:${port}/main`, {
      waitUntil: 'networkidle0',
    });

    const pageHtml = await page.evaluate(() => document.body.outerHTML);
    const overlayHandle = await page.$('#webpack-dev-server-client-overlay');
    const overlayFrame = await overlayHandle.contentFrame();
    const overlayHtml = await overlayFrame.evaluate(
      () => document.body.outerHTML
    );

    expect(prettier.format(pageHtml, { parser: 'html' })).toMatchSnapshot(
      'page html'
    );
    expect(prettier.format(overlayHtml, { parser: 'html' })).toMatchSnapshot(
      'overlay html'
    );

    await browser.close();
    await new Promise((resolve) => {
      server.close(() => {
        resolve();
      });
    });
  });
});
