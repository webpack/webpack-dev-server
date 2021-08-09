"use strict";

const fs = require("fs");
const path = require("path");
const prettier = require("prettier");
const webpack = require("webpack");
const Server = require("../../lib/Server");
const config = require("../fixtures/overlay-config/webpack.config");
const runBrowser = require("../helpers/run-browser");
const port = require("../ports-map").overlay;

class ErrorPlugin {
  constructor(message) {
    this.message =
      message || "Error from compilation. Can't find 'test' module.";
  }

  // eslint-disable-next-line class-methods-use-this
  apply(compiler) {
    compiler.hooks.thisCompilation.tap(
      "errors-webpack-plugin",
      (compilation) => {
        compilation.errors.push(new Error(this.message));
      }
    );
  }
}

class WarningPlugin {
  constructor(message) {
    this.message = message || "Warning from compilation";
  }

  // eslint-disable-next-line class-methods-use-this
  apply(compiler) {
    compiler.hooks.thisCompilation.tap(
      "warnings-webpack-plugin",
      (compilation) => {
        compilation.warnings.push(new Error(this.message));
      }
    );
  }
}

describe("overlay", () => {
  it("should show on a warning for initial compilation", async () => {
    const compiler = webpack(config);

    new WarningPlugin().apply(compiler);

    const devServerOptions = {
      host: "0.0.0.0",
      port,
    };
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
      waitUntil: "networkidle0",
    });

    const pageHtml = await page.evaluate(() => document.body.outerHTML);
    const overlayHandle = await page.$("#webpack-dev-server-client-overlay");
    const overlayFrame = await overlayHandle.contentFrame();
    const overlayHtml = await overlayFrame.evaluate(
      () => document.body.outerHTML
    );

    expect(prettier.format(pageHtml, { parser: "html" })).toMatchSnapshot(
      "page html"
    );
    expect(prettier.format(overlayHtml, { parser: "html" })).toMatchSnapshot(
      "overlay html"
    );

    await browser.close();
    await new Promise((resolve) => {
      server.close(() => {
        resolve();
      });
    });
  });

  it("should show on an error for initial compilation", async () => {
    const compiler = webpack(config);

    new ErrorPlugin().apply(compiler);

    const devServerOptions = {
      host: "0.0.0.0",
      port,
    };
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
      waitUntil: "networkidle0",
    });

    const pageHtml = await page.evaluate(() => document.body.outerHTML);
    const overlayHandle = await page.$("#webpack-dev-server-client-overlay");
    const overlayFrame = await overlayHandle.contentFrame();
    const overlayHtml = await overlayFrame.evaluate(
      () => document.body.outerHTML
    );

    expect(prettier.format(pageHtml, { parser: "html" })).toMatchSnapshot(
      "page html"
    );
    expect(prettier.format(overlayHtml, { parser: "html" })).toMatchSnapshot(
      "overlay html"
    );

    await browser.close();
    await new Promise((resolve) => {
      server.close(() => {
        resolve();
      });
    });
  });

  it("should show on a warning and error for initial compilation", async () => {
    const compiler = webpack(config);

    new WarningPlugin().apply(compiler);
    new WarningPlugin().apply(compiler);
    new ErrorPlugin().apply(compiler);
    new ErrorPlugin().apply(compiler);
    new ErrorPlugin().apply(compiler);

    const devServerOptions = {
      host: "0.0.0.0",
      port,
    };
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
      waitUntil: "networkidle0",
    });

    const pageHtml = await page.evaluate(() => document.body.outerHTML);
    const overlayHandle = await page.$("#webpack-dev-server-client-overlay");
    const overlayFrame = await overlayHandle.contentFrame();
    const overlayHtml = await overlayFrame.evaluate(
      () => document.body.outerHTML
    );

    expect(prettier.format(pageHtml, { parser: "html" })).toMatchSnapshot(
      "page html"
    );
    expect(prettier.format(overlayHtml, { parser: "html" })).toMatchSnapshot(
      "overlay html"
    );

    await browser.close();
    await new Promise((resolve) => {
      server.close(() => {
        resolve();
      });
    });
  });

  it("should show on an ansi formatted error for initial compilation", async () => {
    const compiler = webpack(config);

    new ErrorPlugin("[0m [90m 18 |[39m           [33mRender[39m [33mansi formatted text[39m[0m").apply(
      compiler
    );

    const devServerOptions = {
      host: "0.0.0.0",
      port,
    };
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
      waitUntil: "networkidle0",
    });

    const pageHtml = await page.evaluate(() => document.body.outerHTML);
    const overlayHandle = await page.$("#webpack-dev-server-client-overlay");
    const overlayFrame = await overlayHandle.contentFrame();
    const overlayHtml = await overlayFrame.evaluate(
      () => document.body.outerHTML
    );

    expect(prettier.format(pageHtml, { parser: "html" })).toMatchSnapshot(
      "page html"
    );
    expect(prettier.format(overlayHtml, { parser: "html" })).toMatchSnapshot(
      "overlay html"
    );

    await browser.close();
    await new Promise((resolve) => {
      server.close(() => {
        resolve();
      });
    });
  });

  it("should show on a warning and error for initial compilation and protects against xss", async () => {
    const compiler = webpack(config);

    new WarningPlugin("<strong>strong</strong>").apply(compiler);
    new ErrorPlugin("<strong>strong</strong>").apply(compiler);

    const devServerOptions = {
      host: "0.0.0.0",
      port,
    };
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
      waitUntil: "networkidle0",
    });

    const pageHtml = await page.evaluate(() => document.body.outerHTML);
    const overlayHandle = await page.$("#webpack-dev-server-client-overlay");
    const overlayFrame = await overlayHandle.contentFrame();
    const overlayHtml = await overlayFrame.evaluate(
      () => document.body.outerHTML
    );

    expect(prettier.format(pageHtml, { parser: "html" })).toMatchSnapshot(
      "page html"
    );
    expect(prettier.format(overlayHtml, { parser: "html" })).toMatchSnapshot(
      "overlay html"
    );

    await browser.close();
    await new Promise((resolve) => {
      server.close(() => {
        resolve();
      });
    });
  });

  it("should not show initially, then show on an error, then hide on fix", async () => {
    const compiler = webpack(config);
    const devServerOptions = {
      host: "0.0.0.0",
      port,
    };
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
      waitUntil: "networkidle0",
    });

    let pageHtml = await page.evaluate(() => document.body.outerHTML);
    let overlayHandle = await page.$("#webpack-dev-server-client-overlay");

    expect(overlayHandle).toBe(null);
    expect(prettier.format(pageHtml, { parser: "html" })).toMatchSnapshot(
      "page html initial"
    );

    const pathToFile = path.resolve(
      __dirname,
      "../fixtures/overlay-config/foo.js"
    );
    const originalCode = fs.readFileSync(pathToFile);

    fs.writeFileSync(pathToFile, "`;");

    await page.waitForSelector("#webpack-dev-server-client-overlay");

    overlayHandle = await page.$("#webpack-dev-server-client-overlay");
    pageHtml = await page.evaluate(() => document.body.outerHTML);

    const overlayFrame = await overlayHandle.contentFrame();
    const overlayHtml = await overlayFrame.evaluate(
      () => document.body.outerHTML
    );

    expect(prettier.format(pageHtml, { parser: "html" })).toMatchSnapshot(
      "page html with error"
    );
    expect(prettier.format(overlayHtml, { parser: "html" })).toMatchSnapshot(
      "overlay html"
    );

    fs.writeFileSync(pathToFile, originalCode);

    await page.waitForSelector("#webpack-dev-server-client-overlay", {
      hidden: true,
    });

    pageHtml = await page.evaluate(() => document.body.outerHTML);
    overlayHandle = await page.$("#webpack-dev-server-client-overlay");

    expect(overlayHandle).toBe(null);
    expect(prettier.format(pageHtml, { parser: "html" })).toMatchSnapshot(
      "page html after fix error"
    );

    await browser.close();
    await new Promise((resolve) => {
      server.close(() => {
        resolve();
      });
    });
  });

  it("should not show initially, then show on an error, then show other error, then hide on fix", async () => {
    const compiler = webpack(config);
    const devServerOptions = {
      host: "0.0.0.0",
      port,
    };
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
      waitUntil: "networkidle0",
    });

    let pageHtml = await page.evaluate(() => document.body.outerHTML);
    let overlayHandle = await page.$("#webpack-dev-server-client-overlay");

    expect(overlayHandle).toBe(null);
    expect(prettier.format(pageHtml, { parser: "html" })).toMatchSnapshot(
      "page html initial"
    );

    const pathToFile = path.resolve(
      __dirname,
      "../fixtures/overlay-config/foo.js"
    );
    const originalCode = fs.readFileSync(pathToFile);

    fs.writeFileSync(pathToFile, "`;");

    await page.waitForSelector("#webpack-dev-server-client-overlay");

    overlayHandle = await page.$("#webpack-dev-server-client-overlay");
    pageHtml = await page.evaluate(() => document.body.outerHTML);

    let overlayFrame = await overlayHandle.contentFrame();
    let overlayHtml = await overlayFrame.evaluate(
      () => document.body.outerHTML
    );

    expect(prettier.format(pageHtml, { parser: "html" })).toMatchSnapshot(
      "page html with error"
    );
    expect(prettier.format(overlayHtml, { parser: "html" })).toMatchSnapshot(
      "overlay html"
    );

    fs.writeFileSync(pathToFile, "`;a");

    await page.waitForSelector("#webpack-dev-server-client-overlay", {
      hidden: true,
    });
    await page.waitForSelector("#webpack-dev-server-client-overlay");

    overlayHandle = await page.$("#webpack-dev-server-client-overlay");
    pageHtml = await page.evaluate(() => document.body.outerHTML);

    overlayFrame = await overlayHandle.contentFrame();
    overlayHtml = await overlayFrame.evaluate(() => document.body.outerHTML);

    expect(prettier.format(pageHtml, { parser: "html" })).toMatchSnapshot(
      "page html with other error"
    );
    expect(prettier.format(overlayHtml, { parser: "html" })).toMatchSnapshot(
      "overlay html"
    );

    fs.writeFileSync(pathToFile, originalCode);

    await page.waitForSelector("#webpack-dev-server-client-overlay", {
      hidden: true,
    });

    pageHtml = await page.evaluate(() => document.body.outerHTML);
    overlayHandle = await page.$("#webpack-dev-server-client-overlay");

    expect(overlayHandle).toBe(null);
    expect(prettier.format(pageHtml, { parser: "html" })).toMatchSnapshot(
      "page html after fix error"
    );

    await browser.close();
    await new Promise((resolve) => {
      server.close(() => {
        resolve();
      });
    });
  });

  it("should not show initially, then show on an error and allow to close", async () => {
    const compiler = webpack(config);
    const devServerOptions = {
      host: "0.0.0.0",
      port,
    };
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
      waitUntil: "networkidle0",
    });

    let pageHtml = await page.evaluate(() => document.body.outerHTML);
    let overlayHandle = await page.$("#webpack-dev-server-client-overlay");

    expect(overlayHandle).toBe(null);
    expect(prettier.format(pageHtml, { parser: "html" })).toMatchSnapshot(
      "page html initial"
    );

    const pathToFile = path.resolve(
      __dirname,
      "../fixtures/overlay-config/foo.js"
    );
    const originalCode = fs.readFileSync(pathToFile);

    fs.writeFileSync(pathToFile, "`;");

    await page.waitForSelector("#webpack-dev-server-client-overlay");

    overlayHandle = await page.$("#webpack-dev-server-client-overlay");
    pageHtml = await page.evaluate(() => document.body.outerHTML);

    const overlayFrame = await overlayHandle.contentFrame();
    const overlayHtml = await overlayFrame.evaluate(
      () => document.body.outerHTML
    );

    expect(prettier.format(pageHtml, { parser: "html" })).toMatchSnapshot(
      "page html with error"
    );
    expect(prettier.format(overlayHtml, { parser: "html" })).toMatchSnapshot(
      "overlay html"
    );

    const frame = await page
      .frames()
      .find((item) => item.name() === "webpack-dev-server-client-overlay");

    const buttonHandle = await frame.$("button");

    await buttonHandle.click();

    await page.waitForSelector("#webpack-dev-server-client-overlay", {
      hidden: true,
    });

    pageHtml = await page.evaluate(() => document.body.outerHTML);
    overlayHandle = await page.$("#webpack-dev-server-client-overlay");

    expect(overlayHandle).toBe(null);
    expect(prettier.format(pageHtml, { parser: "html" })).toMatchSnapshot(
      "page html after close"
    );

    fs.writeFileSync(pathToFile, originalCode);

    await browser.close();
    await new Promise((resolve) => {
      server.close(() => {
        resolve();
      });
    });
  });

  it('should not show on a warning when "client.overlay" is "false"', async () => {
    const compiler = webpack(config);

    new WarningPlugin().apply(compiler);

    const devServerOptions = {
      host: "0.0.0.0",
      port,
      client: {
        overlay: false,
      },
    };
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
      waitUntil: "networkidle0",
    });

    const pageHtml = await page.evaluate(() => document.body.outerHTML);
    const overlayHandle = await page.$("#webpack-dev-server-client-overlay");

    expect(overlayHandle).toBe(null);
    expect(prettier.format(pageHtml, { parser: "html" })).toMatchSnapshot(
      "page html"
    );

    await browser.close();
    await new Promise((resolve) => {
      server.close(() => {
        resolve();
      });
    });
  });

  it('should not show on a warning when "client.overlay.warnings" is "false"', async () => {
    const compiler = webpack(config);

    new WarningPlugin().apply(compiler);

    const devServerOptions = {
      host: "0.0.0.0",
      port,
      client: {
        overlay: {
          warnings: false,
        },
      },
    };
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
      waitUntil: "networkidle0",
    });

    const pageHtml = await page.evaluate(() => document.body.outerHTML);
    const overlayHandle = await page.$("#webpack-dev-server-client-overlay");

    expect(overlayHandle).toBe(null);
    expect(prettier.format(pageHtml, { parser: "html" })).toMatchSnapshot(
      "page html"
    );

    await browser.close();
    await new Promise((resolve) => {
      server.close(() => {
        resolve();
      });
    });
  });

  it('should show on a warning when "client.overlay" is "true"', async () => {
    const compiler = webpack(config);

    new WarningPlugin().apply(compiler);

    const devServerOptions = {
      host: "0.0.0.0",
      port,
      client: {
        overlay: true,
      },
    };
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
      waitUntil: "networkidle0",
    });

    const pageHtml = await page.evaluate(() => document.body.outerHTML);
    const overlayHandle = await page.$("#webpack-dev-server-client-overlay");
    const overlayFrame = await overlayHandle.contentFrame();
    const overlayHtml = await overlayFrame.evaluate(
      () => document.body.outerHTML
    );

    expect(prettier.format(pageHtml, { parser: "html" })).toMatchSnapshot(
      "page html"
    );
    expect(prettier.format(overlayHtml, { parser: "html" })).toMatchSnapshot(
      "overlay html"
    );

    await browser.close();
    await new Promise((resolve) => {
      server.close(() => {
        resolve();
      });
    });
  });

  it('should show on a warning when "client.overlay.warnings" is "true"', async () => {
    const compiler = webpack(config);

    new WarningPlugin().apply(compiler);

    const devServerOptions = {
      host: "0.0.0.0",
      port,
      client: {
        overlay: {
          warnings: true,
        },
      },
    };
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
      waitUntil: "networkidle0",
    });

    const pageHtml = await page.evaluate(() => document.body.outerHTML);
    const overlayHandle = await page.$("#webpack-dev-server-client-overlay");
    const overlayFrame = await overlayHandle.contentFrame();
    const overlayHtml = await overlayFrame.evaluate(
      () => document.body.outerHTML
    );

    expect(prettier.format(pageHtml, { parser: "html" })).toMatchSnapshot(
      "page html"
    );
    expect(prettier.format(overlayHtml, { parser: "html" })).toMatchSnapshot(
      "overlay html"
    );

    await browser.close();
    await new Promise((resolve) => {
      server.close(() => {
        resolve();
      });
    });
  });

  it('should show on a warning when "client.overlay.errors" is "true"', async () => {
    const compiler = webpack(config);

    new WarningPlugin().apply(compiler);

    const devServerOptions = {
      host: "0.0.0.0",
      port,
      client: {
        overlay: {
          errors: true,
        },
      },
    };
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
      waitUntil: "networkidle0",
    });

    const pageHtml = await page.evaluate(() => document.body.outerHTML);
    const overlayHandle = await page.$("#webpack-dev-server-client-overlay");
    const overlayFrame = await overlayHandle.contentFrame();
    const overlayHtml = await overlayFrame.evaluate(
      () => document.body.outerHTML
    );

    expect(prettier.format(pageHtml, { parser: "html" })).toMatchSnapshot(
      "page html"
    );
    expect(prettier.format(overlayHtml, { parser: "html" })).toMatchSnapshot(
      "overlay html"
    );

    await browser.close();
    await new Promise((resolve) => {
      server.close(() => {
        resolve();
      });
    });
  });

  it('should not show on an error when "client.overlay" is "false"', async () => {
    const compiler = webpack(config);

    new ErrorPlugin().apply(compiler);

    const devServerOptions = {
      host: "0.0.0.0",
      port,
      client: {
        overlay: false,
      },
    };
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
      waitUntil: "networkidle0",
    });

    const pageHtml = await page.evaluate(() => document.body.outerHTML);
    const overlayHandle = await page.$("#webpack-dev-server-client-overlay");

    expect(overlayHandle).toBe(null);
    expect(prettier.format(pageHtml, { parser: "html" })).toMatchSnapshot(
      "page html"
    );

    await browser.close();
    await new Promise((resolve) => {
      server.close(() => {
        resolve();
      });
    });
  });

  it('should not show on an error when "client.overlay.errors" is "false"', async () => {
    const compiler = webpack(config);

    new ErrorPlugin().apply(compiler);

    const devServerOptions = {
      host: "0.0.0.0",
      port,
      client: {
        overlay: {
          errors: false,
        },
      },
    };
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
      waitUntil: "networkidle0",
    });

    const pageHtml = await page.evaluate(() => document.body.outerHTML);
    const overlayHandle = await page.$("#webpack-dev-server-client-overlay");

    expect(overlayHandle).toBe(null);
    expect(prettier.format(pageHtml, { parser: "html" })).toMatchSnapshot(
      "page html"
    );

    await browser.close();
    await new Promise((resolve) => {
      server.close(() => {
        resolve();
      });
    });
  });

  it('should show on an error when "client.overlay" is "true"', async () => {
    const compiler = webpack(config);

    new ErrorPlugin().apply(compiler);

    const devServerOptions = {
      host: "0.0.0.0",
      port,
      client: {
        overlay: true,
      },
    };
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
      waitUntil: "networkidle0",
    });

    const pageHtml = await page.evaluate(() => document.body.outerHTML);
    const overlayHandle = await page.$("#webpack-dev-server-client-overlay");
    const overlayFrame = await overlayHandle.contentFrame();
    const overlayHtml = await overlayFrame.evaluate(
      () => document.body.outerHTML
    );

    expect(prettier.format(pageHtml, { parser: "html" })).toMatchSnapshot(
      "page html"
    );
    expect(prettier.format(overlayHtml, { parser: "html" })).toMatchSnapshot(
      "overlay html"
    );

    await browser.close();
    await new Promise((resolve) => {
      server.close(() => {
        resolve();
      });
    });
  });

  it('should show on an error when "client.overlay.errors" is "true"', async () => {
    const compiler = webpack(config);

    new ErrorPlugin().apply(compiler);

    const devServerOptions = {
      host: "0.0.0.0",
      port,
      client: {
        overlay: {
          errors: true,
        },
      },
    };
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
      waitUntil: "networkidle0",
    });

    const pageHtml = await page.evaluate(() => document.body.outerHTML);
    const overlayHandle = await page.$("#webpack-dev-server-client-overlay");
    const overlayFrame = await overlayHandle.contentFrame();
    const overlayHtml = await overlayFrame.evaluate(
      () => document.body.outerHTML
    );

    expect(prettier.format(pageHtml, { parser: "html" })).toMatchSnapshot(
      "page html"
    );
    expect(prettier.format(overlayHtml, { parser: "html" })).toMatchSnapshot(
      "overlay html"
    );

    await browser.close();
    await new Promise((resolve) => {
      server.close(() => {
        resolve();
      });
    });
  });

  it('should show on an error when "client.overlay.warnings" is "true"', async () => {
    const compiler = webpack(config);

    new WarningPlugin().apply(compiler);

    const devServerOptions = {
      host: "0.0.0.0",
      port,
      client: {
        overlay: {
          warnings: true,
        },
      },
    };
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
      waitUntil: "networkidle0",
    });

    const pageHtml = await page.evaluate(() => document.body.outerHTML);
    const overlayHandle = await page.$("#webpack-dev-server-client-overlay");
    const overlayFrame = await overlayHandle.contentFrame();
    const overlayHtml = await overlayFrame.evaluate(
      () => document.body.outerHTML
    );

    expect(prettier.format(pageHtml, { parser: "html" })).toMatchSnapshot(
      "page html"
    );
    expect(prettier.format(overlayHtml, { parser: "html" })).toMatchSnapshot(
      "overlay html"
    );

    await browser.close();
    await new Promise((resolve) => {
      server.close(() => {
        resolve();
      });
    });
  });
});
