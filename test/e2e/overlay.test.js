'use strict';

const fs = require('fs');
const path = require('path');
const prettier = require('prettier');
const webpack = require('webpack');
const Server = require('../../lib/Server');
const config = require('../fixtures/client-config/webpack.config');
const runBrowser = require('../helpers/run-browser');
const port = require('../ports-map').logging;

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
  it('should work for warnings', async () => {
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
    const elementHandle = await page.$('#webpack-dev-server-client-overlay');
    const overlayFrame = await elementHandle.contentFrame();
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

  it('should work for errors', async () => {
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
    const elementHandle = await page.$('#webpack-dev-server-client-overlay');
    const overlayFrame = await elementHandle.contentFrame();
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

  // TODO start do error and fix problem

  // TODO start do error and close

  // TODO should prefer errors in overlay
});
