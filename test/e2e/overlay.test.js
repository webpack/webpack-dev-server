"use strict";

const path = require("path");
const fs = require("graceful-fs");
const webpack = require("webpack");
const sinon = require("sinon");
const waitForExpect = require("wait-for-expect");
const { test } = require("../helpers/playwright-test");
const { expect } = require("../helpers/playwright-custom-expects");
const Server = require("../../lib/Server");
const config = require("../fixtures/overlay-config/webpack.config");
const trustedTypesConfig = require("../fixtures/overlay-config/trusted-types.webpack.config");
const port = require("../ports-map").overlay;

class ErrorPlugin {
  constructor(message, skipCounter) {
    this.message =
      message || "Error from compilation. Can't find 'test' module.";
    this.skipCounter = skipCounter;
    this.counter = 0;
  }

  apply(compiler) {
    compiler.hooks.thisCompilation.tap(
      "errors-webpack-plugin",
      (compilation) => {
        if (
          typeof this.skipCounter !== "undefined" &&
          this.counter !== this.skipCounter
        ) {
          this.counter += 1;

          return;
        }

        compilation.errors.push(new Error(this.message));
      },
    );
  }
}

class WarningPlugin {
  constructor(message, skipCounter) {
    this.message = message || "Warning from compilation";
    this.skipCounter = skipCounter;
    this.counter = 0;
  }

  apply(compiler) {
    compiler.hooks.thisCompilation.tap(
      "warnings-webpack-plugin",
      (compilation) => {
        if (
          typeof this.skipCounter !== "undefined" &&
          this.counter !== this.skipCounter
        ) {
          this.counter += 1;

          return;
        }

        compilation.warnings.push(new Error(this.message));
      },
    );
  }
}

// const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

let prettier;
let prettierHTML;
let prettierCSS;

test.slow();

test.describe("overlay", { tag: ["@flaky", "@fails"] }, () => {
  test.beforeAll(async () => {
    // Due problems with ESM modules for Node.js@18
    // TODO replace it on import/require when Node.js@18 will be dropped
    prettier = require("../../node_modules/prettier/standalone");
    prettierHTML = require("../../node_modules/prettier/plugins/html");
    prettierCSS = require("../../node_modules/prettier/plugins/postcss");
  });

  test("should show a warning for initial compilation", async ({ page }) => {
    const compiler = webpack(config);

    new WarningPlugin().apply(compiler);

    const devServerOptions = {
      port,
    };
    const server = new Server(devServerOptions, compiler);

    await server.start();

    try {
      const response = await page.goto(`http://localhost:${port}/`, {
        waitUntil: "networkidle0",
      });

      expect(response.status()).toEqual(200);

      await expect(page).toHaveScreenshot();
    } catch (error) {
      throw error;
    } finally {
      await server.stop();
    }
  });

  test("should show an error for initial compilation", async ({ page }) => {
    const compiler = webpack(config);

    new ErrorPlugin().apply(compiler);

    const devServerOptions = {
      port,
    };
    const server = new Server(devServerOptions, compiler);

    await server.start();

    try {
      const response = await page.goto(`http://localhost:${port}/`, {
        waitUntil: "networkidle0",
      });

      expect(response.status()).toEqual(200);

      await expect(page).toHaveScreenshot();
    } catch (error) {
      throw error;
    } finally {
      await server.stop();
    }
  });

  test("should show a warning and error for initial compilation", async ({
    page,
  }) => {
    const compiler = webpack(config);

    new WarningPlugin().apply(compiler);
    new WarningPlugin().apply(compiler);
    new ErrorPlugin().apply(compiler);
    new ErrorPlugin().apply(compiler);
    new ErrorPlugin().apply(compiler);

    const devServerOptions = {
      port,
    };
    const server = new Server(devServerOptions, compiler);

    await server.start();

    try {
      const response = await page.goto(`http://localhost:${port}/`, {
        waitUntil: "networkidle0",
      });

      expect(response.status()).toEqual(200);
      await expect(page).toHaveScreenshot();
    } catch (error) {
      throw error;
    } finally {
      await server.stop();
    }
  });

  test("should show an ansi formatted error for initial compilation", async ({
    page,
  }) => {
    const compiler = webpack(config);

    new ErrorPlugin(
      "[0m [90m 18 |[39m           [33mRender[39m [33mansi formatted text[39m[0m",
    ).apply(compiler);

    const devServerOptions = {
      port,
    };
    const server = new Server(devServerOptions, compiler);

    await server.start();

    try {
      const response = await page.goto(`http://localhost:${port}/`, {
        waitUntil: "networkidle0",
      });

      expect(response.status()).toEqual(200);

      await expect(page).toHaveScreenshot();
    } catch (error) {
      throw error;
    } finally {
      await server.stop();
    }
  });

  test("should show a warning and error for initial compilation and protects against xss", async ({
    page,
  }) => {
    const compiler = webpack(config);

    new WarningPlugin("<strong>strong</strong>").apply(compiler);
    new ErrorPlugin("<strong>strong</strong>").apply(compiler);

    const devServerOptions = {
      port,
    };
    const server = new Server(devServerOptions, compiler);

    await server.start();

    try {
      const response = await page.goto(`http://localhost:${port}/`, {
        waitUntil: "networkidle0",
      });

      expect(response.status()).toEqual(200);

      await expect(page).toHaveScreenshot();
    } catch (error) {
      throw error;
    } finally {
      await server.stop();
    }
  });

  test.skip("should not show initially, then show on an error, then hide on fix", async ({
    page,
  }) => {
    const compiler = webpack(config);
    const devServerOptions = {
      port,
    };
    const server = new Server(devServerOptions, compiler);

    await server.start();

    const pathToFile = path.resolve(
      __dirname,
      "../fixtures/overlay-config/foo.js",
    );
    const originalCode = fs.readFileSync(pathToFile);

    try {
      await page.goto(`http://localhost:${port}/`, {
        waitUntil: "networkidle0",
      });

      let pageHtml = await page.evaluate(() => document.body.outerHTML);
      let overlayHandle = await page.$("#webpack-dev-server-client-overlay");

      expect(
        await prettier.format(pageHtml, {
          parser: "html",
          plugins: [prettierHTML, prettierCSS],
        }),
      ).toMatchSnapshotWithArray("page html initial");

      fs.writeFileSync(pathToFile, "`;");

      await page.waitForSelector("#webpack-dev-server-client-overlay");

      overlayHandle = await page.$("#webpack-dev-server-client-overlay");

      pageHtml = await page.evaluate(() => document.body.outerHTML);

      const overlayFrame = await overlayHandle.contentFrame();

      const overlayHtml = await overlayFrame.evaluate(
        () => document.body.outerHTML,
      );

      expect(
        await prettier.format(pageHtml, {
          parser: "html",
          plugins: [prettierHTML, prettierCSS],
        }),
      ).toMatchSnapshotWithArray("page html with error");
      expect(
        await prettier.format(overlayHtml, {
          parser: "html",
          plugins: [prettierHTML, prettierCSS],
        }),
      ).toMatchSnapshotWithArray("overlay html");

      fs.writeFileSync(pathToFile, originalCode);

      await page.waitForSelector("#webpack-dev-server-client-overlay", {
        hidden: true,
      });

      pageHtml = await page.evaluate(() => document.body.outerHTML);
      overlayHandle = await page.$("#webpack-dev-server-client-overlay");

      expect(
        await prettier.format(pageHtml, {
          parser: "html",
          plugins: [prettierHTML, prettierCSS],
        }),
      ).toMatchSnapshotWithArray("page html after fix");
    } catch (error) {
      fs.writeFileSync(pathToFile, originalCode);
      throw error;
    } finally {
      await server.stop();
      fs.writeFileSync(pathToFile, originalCode);
    }
  });

  // TODO: Fix this test, it fails on re-run
  test.skip("should not show initially, then show on an error, then show other error, then hide on fix", async ({
    page,
  }) => {
    const compiler = webpack(config);
    const devServerOptions = {
      port,
    };
    const server = new Server(devServerOptions, compiler);

    await server.start();

    const pathToFile = path.resolve(
      __dirname,
      "../fixtures/overlay-config/foo.js",
    );
    const originalCode = fs.readFileSync(pathToFile);

    try {
      await page.goto(`http://localhost:${port}/`, {
        waitUntil: "networkidle0",
      });

      let pageHtml = await page.evaluate(() => document.body.outerHTML);
      let overlayHandle = await page.$("#webpack-dev-server-client-overlay");

      expect(
        await prettier.format(pageHtml, {
          parser: "html",
          plugins: [prettierHTML, prettierCSS],
        }),
      ).toMatchSnapshotWithArray("initial page html");

      fs.writeFileSync(pathToFile, "`;");

      await page.waitForSelector("#webpack-dev-server-client-overlay");

      overlayHandle = await page.$("#webpack-dev-server-client-overlay");

      pageHtml = await page.evaluate(() => document.body.outerHTML);

      let overlayFrame = await overlayHandle.contentFrame();
      let overlayHtml = await overlayFrame.evaluate(
        () => document.body.outerHTML,
      );

      expect(
        await prettier.format(pageHtml, {
          parser: "html",
          plugins: [prettierHTML, prettierCSS],
        }),
      ).toMatchSnapshotWithArray("page html with error");
      expect(
        await prettier.format(overlayHtml, {
          parser: "html",
          plugins: [prettierHTML, prettierCSS],
        }),
      ).toMatchSnapshotWithArray("overlay html with error");

      fs.writeFileSync(pathToFile, "`;a");

      await page.waitForSelector("#webpack-dev-server-client-overlay", {
        hidden: true,
      });
      await page.waitForSelector("#webpack-dev-server-client-overlay");

      overlayHandle = await page.$("#webpack-dev-server-client-overlay");

      pageHtml = await page.evaluate(() => document.body.outerHTML);

      overlayFrame = await overlayHandle.contentFrame();

      overlayHtml = await overlayFrame.evaluate(() => document.body.outerHTML);

      expect(
        await prettier.format(pageHtml, {
          parser: "html",
          plugins: [prettierHTML, prettierCSS],
        }),
      ).toMatchSnapshotWithArray("page html with other error");
      expect(
        await prettier.format(overlayHtml, {
          parser: "html",
          plugins: [prettierHTML, prettierCSS],
        }),
      ).toMatchSnapshotWithArray("overlay html with other error");

      fs.writeFileSync(pathToFile, originalCode);

      await page.waitForSelector("#webpack-dev-server-client-overlay", {
        hidden: true,
      });

      pageHtml = await page.evaluate(() => document.body.outerHTML);
      overlayHandle = await page.$("#webpack-dev-server-client-overlay");

      expect(
        await prettier.format(pageHtml, {
          parser: "html",
          plugins: [prettierHTML, prettierCSS],
        }),
      ).toMatchSnapshotWithArray("page html after fix");
    } catch (error) {
      throw error;
    } finally {
      await server.stop();
      fs.writeFileSync(pathToFile, originalCode);
    }
  });

  test("should not show initially, then show on an error and allow to close", async ({
    page,
  }) => {
    const compiler = webpack(config);
    const devServerOptions = {
      port,
    };
    const server = new Server(devServerOptions, compiler);

    await server.start();

    const pathToFile = path.resolve(
      __dirname,
      "../fixtures/overlay-config/foo.js",
    );
    const originalCode = fs.readFileSync(pathToFile);

    try {
      await page.goto(`http://localhost:${port}/`, {
        waitUntil: "networkidle0",
      });

      let pageHtml = await page.evaluate(() => document.body.outerHTML);
      let overlayHandle = await page.$("#webpack-dev-server-client-overlay");

      expect(
        await prettier.format(pageHtml, {
          parser: "html",
          plugins: [prettierHTML, prettierCSS],
        }),
      ).toMatchSnapshotWithArray("initial page html");

      fs.writeFileSync(pathToFile, "`;");

      await page.waitForSelector("#webpack-dev-server-client-overlay");

      overlayHandle = await page.$("#webpack-dev-server-client-overlay");

      pageHtml = await page.evaluate(() => document.body.outerHTML);

      const overlayFrame = await overlayHandle.contentFrame();
      const overlayHtml = await overlayFrame.evaluate(
        () => document.body.outerHTML,
      );

      expect(
        await prettier.format(pageHtml, {
          parser: "html",
          plugins: [prettierHTML, prettierCSS],
        }),
      ).toMatchSnapshotWithArray("page html with error");
      expect(
        await prettier.format(overlayHtml, {
          parser: "html",
          plugins: [prettierHTML, prettierCSS],
        }),
      ).toMatchSnapshotWithArray("overlay html");

      const frame = await page
        .frames()
        .find((item) => item.name() === "webpack-dev-server-client-overlay");

      const buttonHandle = await frame.$("button");

      await buttonHandle.click();

      pageHtml = await page.evaluate(() => document.body.outerHTML);
      overlayHandle = await page.$("#webpack-dev-server-client-overlay");

      expect(
        await prettier.format(pageHtml, {
          parser: "html",
          plugins: [prettierHTML, prettierCSS],
        }),
      ).toMatchSnapshotWithArray("page html with overlay closed");

      fs.writeFileSync(pathToFile, originalCode);
    } catch (error) {
      fs.writeFileSync(pathToFile, originalCode);
      throw error;
    } finally {
      await server.stop();
      fs.writeFileSync(pathToFile, originalCode);
    }
  });

  test.fixme(
    "should open editor when error with file info is clicked",
    async ({ page }) => {
      const mockLaunchEditorCb = sinon.spy();
      sinon.stub(require("launch-editor"), mockLaunchEditorCb);

      const compiler = webpack(config);
      const devServerOptions = {
        port,
      };
      const server = new Server(devServerOptions, compiler);

      await server.start();

      try {
        await page.goto(`http://localhost:${port}/`, {
          waitUntil: "networkidle0",
        });

        const pathToFile = path.resolve(
          __dirname,
          "../fixtures/overlay-config/foo.js",
        );
        const originalCode = fs.readFileSync(pathToFile);

        fs.writeFileSync(pathToFile, "`;");

        await page.waitForSelector("#webpack-dev-server-client-overlay");

        const frame = page
          .frames()
          .find((item) => item.name() === "webpack-dev-server-client-overlay");

        const errorHandle = await frame.$("[data-can-open]");

        await errorHandle.click();

        await waitForExpect(() => {
          sinon.assert.calledOnce(mockLaunchEditorCb);
        });

        fs.writeFileSync(pathToFile, originalCode);
      } catch (error) {
        throw error;
      } finally {
        await server.stop();
      }
    },
  );

  test('should not show a warning when "client.overlay" is "false"', async ({
    page,
  }) => {
    const compiler = webpack(config);

    new WarningPlugin().apply(compiler);

    const devServerOptions = {
      port,
      client: {
        overlay: false,
      },
    };
    const server = new Server(devServerOptions, compiler);

    await server.start();

    try {
      const response = await page.goto(`http://localhost:${port}/`, {
        waitUntil: "networkidle0",
      });

      expect(response.status()).toEqual(200);

      await expect(page).toHaveScreenshot();
    } catch (error) {
      throw error;
    } finally {
      await server.stop();
    }
  });

  test('should not show a warning when "client.overlay.warnings" is "false"', async ({
    page,
  }) => {
    const compiler = webpack(config);

    new WarningPlugin().apply(compiler);

    const devServerOptions = {
      port,
      client: {
        overlay: {
          warnings: false,
        },
      },
    };
    const server = new Server(devServerOptions, compiler);

    await server.start();

    try {
      const response = await page.goto(`http://localhost:${port}/`, {
        waitUntil: "networkidle0",
      });

      expect(response.status()).toEqual(200);

      await expect(page).toHaveScreenshot();
    } catch (error) {
      throw error;
    } finally {
      await server.stop();
    }
  });

  test("should not show warning when it is filtered", async ({ page }) => {
    const compiler = webpack(config);

    new WarningPlugin("My special warning").apply(compiler);

    const server = new Server(
      {
        port,
        client: {
          overlay: {
            warnings: (error) => {
              // error is string in webpack 4
              const message = typeof error === "string" ? error : error.message;
              return message !== "My special warning";
            },
          },
        },
      },
      compiler,
    );

    await server.start();

    try {
      const response = await page.goto(`http://localhost:${port}/`, {
        waitUntil: "networkidle0",
      });

      expect(response.status()).toEqual(200);

      await expect(page).toHaveScreenshot();
    } catch (error) {
      throw error;
    } finally {
      await server.stop();
    }
  });

  test("should show warning when it is not filtered", async ({ page }) => {
    const compiler = webpack(config);

    new WarningPlugin("Unfiltered warning").apply(compiler);

    const server = new Server(
      {
        port,
        client: {
          overlay: {
            warnings: () => true,
          },
        },
      },
      compiler,
    );

    await server.start();

    try {
      const response = await page.goto(`http://localhost:${port}/`, {
        waitUntil: "networkidle0",
      });

      expect(response.status()).toEqual(200);

      await expect(page).toHaveScreenshot();
    } catch (error) {
      throw error;
    } finally {
      await server.stop();
    }
  });

  test('should show a warning when "client.overlay" is "true"', async ({
    page,
  }) => {
    const compiler = webpack(config);

    new WarningPlugin().apply(compiler);

    const devServerOptions = {
      port,
      client: {
        overlay: true,
      },
    };
    const server = new Server(devServerOptions, compiler);

    await server.start();

    try {
      const response = await page.goto(`http://localhost:${port}/`, {
        waitUntil: "networkidle0",
      });

      expect(response.status()).toEqual(200);

      await expect(page).toHaveScreenshot();
    } catch (error) {
      throw error;
    } finally {
      await server.stop();
    }
  });

  test('should show a warning when "client.overlay.warnings" is "true"', async ({
    page,
  }) => {
    const compiler = webpack(config);

    new WarningPlugin().apply(compiler);

    const devServerOptions = {
      port,
      client: {
        overlay: {
          warnings: true,
        },
      },
    };
    const server = new Server(devServerOptions, compiler);

    await server.start();

    try {
      const response = await page.goto(`http://localhost:${port}/`, {
        waitUntil: "networkidle0",
      });

      expect(response.status()).toEqual(200);

      await expect(page).toHaveScreenshot();
    } catch (error) {
      throw error;
    } finally {
      await server.stop();
    }
  });

  test('should show a warning when "client.overlay.errors" is "true"', async ({
    page,
  }) => {
    const compiler = webpack(config);

    new WarningPlugin().apply(compiler);

    const devServerOptions = {
      port,
      client: {
        overlay: {
          errors: true,
        },
      },
    };
    const server = new Server(devServerOptions, compiler);

    await server.start();

    try {
      const response = await page.goto(`http://localhost:${port}/`, {
        waitUntil: "networkidle0",
      });

      expect(response.status()).toEqual(200);

      await expect(page).toHaveScreenshot();
    } catch (error) {
      throw error;
    } finally {
      await server.stop();
    }
  });

  test('should not show an error when "client.overlay" is "false"', async ({
    page,
  }) => {
    const compiler = webpack(config);

    new ErrorPlugin().apply(compiler);

    const devServerOptions = {
      port,
      client: {
        overlay: false,
      },
    };
    const server = new Server(devServerOptions, compiler);

    await server.start();

    try {
      const response = await page.goto(`http://localhost:${port}/`, {
        waitUntil: "networkidle0",
      });

      expect(response.status()).toEqual(200);

      await expect(page).toHaveScreenshot();
    } catch (error) {
      throw error;
    } finally {
      await server.stop();
    }
  });

  test('should not show an error when "client.overlay.errors" is "false"', async ({
    page,
  }) => {
    const compiler = webpack(config);

    new ErrorPlugin().apply(compiler);

    const devServerOptions = {
      port,
      client: {
        overlay: {
          errors: false,
        },
      },
    };
    const server = new Server(devServerOptions, compiler);

    await server.start();

    try {
      const response = await page.goto(`http://localhost:${port}/`, {
        waitUntil: "networkidle0",
      });

      expect(response.status()).toEqual(200);

      await expect(page).toHaveScreenshot();
    } catch (error) {
      throw error;
    } finally {
      await server.stop();
    }
  });

  test("should not show error when it is filtered", async ({ page }) => {
    const compiler = webpack(config);

    new ErrorPlugin("My special error").apply(compiler);

    const server = new Server(
      {
        port,
        client: {
          overlay: {
            errors: (error) => {
              // error is string in webpack 4
              const message = typeof error === "string" ? error : error.message;

              return message !== "My special error";
            },
          },
        },
      },
      compiler,
    );

    await server.start();

    try {
      const response = await page.goto(`http://localhost:${port}/`, {
        waitUntil: "networkidle0",
      });

      expect(response.status()).toEqual(200);

      await expect(page).toHaveScreenshot();
    } catch (error) {
      throw error;
    } finally {
      await server.stop();
    }
  });

  test("should show error when it is not filtered", async ({ page }) => {
    const compiler = webpack(config);

    new ErrorPlugin("Unfiltered error").apply(compiler);

    const server = new Server(
      {
        port,
        client: {
          overlay: {
            errors: () => true,
          },
        },
      },
      compiler,
    );

    await server.start();

    try {
      const response = await page.goto(`http://localhost:${port}/`, {
        waitUntil: "networkidle0",
      });

      expect(response.status()).toEqual(200);

      await expect(page).toHaveScreenshot();
    } catch (error) {
      throw error;
    } finally {
      await server.stop();
    }
  });

  test('should show an error when "client.overlay" is "true"', async ({
    page,
  }) => {
    const compiler = webpack(config);

    new ErrorPlugin().apply(compiler);

    const devServerOptions = {
      port,
      client: {
        overlay: true,
      },
    };
    const server = new Server(devServerOptions, compiler);

    await server.start();

    try {
      const response = await page.goto(`http://localhost:${port}/`, {
        waitUntil: "networkidle0",
      });

      expect(response.status()).toEqual(200);

      await expect(page).toHaveScreenshot();
    } catch (error) {
      throw error;
    } finally {
      await server.stop();
    }
  });

  test("should show overlay when Trusted Types are enabled", async ({
    page,
  }) => {
    const compiler = webpack(trustedTypesConfig);

    new ErrorPlugin().apply(compiler);

    const devServerOptions = {
      port,
      client: {
        overlay: {
          trustedTypesPolicyName: "webpack#dev-overlay",
        },
      },
    };
    const server = new Server(devServerOptions, compiler);

    await server.start();

    try {
      const consoleMessages = [];

      page.on("console", (message) => {
        consoleMessages.push(message.text());
      });

      const response = await page.goto(`http://localhost:${port}/`, {
        waitUntil: "networkidle0",
      });

      expect(response.status()).toEqual(200);

      await expect(page).toHaveScreenshot();

      expect(
        consoleMessages.filter((item) =>
          /requires 'TrustedHTML' assignment/.test(item),
        ),
      ).toHaveLength(0);
    } catch (error) {
      throw error;
    } finally {
      await server.stop();
    }
  });

  test("should show overlay when Trusted Types are enabled and the \"require-trusted-types-for 'script'\" header was used", async ({
    page,
  }) => {
    const compiler = webpack(trustedTypesConfig);

    new ErrorPlugin().apply(compiler);

    const devServerOptions = {
      port,
      headers: [
        {
          key: "Content-Security-Policy",
          value: "require-trusted-types-for 'script'",
        },
      ],
      client: {
        overlay: {
          trustedTypesPolicyName: "webpack#dev-overlay",
        },
      },
    };
    const server = new Server(devServerOptions, compiler);

    await server.start();

    try {
      const consoleMessages = [];

      page.on("console", (message) => {
        consoleMessages.push(message.text());
      });

      const response = await page.goto(`http://localhost:${port}/`, {
        waitUntil: "networkidle0",
      });

      expect(response.status()).toEqual(200);

      await expect(page).toHaveScreenshot();

      expect(
        consoleMessages.filter((item) =>
          /requires 'TrustedHTML' assignment/.test(item),
        ),
      ).toHaveLength(0);
    } catch (error) {
      throw error;
    } finally {
      await server.stop();
    }
  });

  test("should not show overlay when Trusted Types are enabled, but policy is not allowed", async ({
    page,
  }) => {
    const compiler = webpack(trustedTypesConfig);

    new ErrorPlugin().apply(compiler);

    const devServerOptions = {
      port,
      client: {
        overlay: {
          trustedTypesPolicyName: "disallowed-policy",
        },
      },
    };
    const server = new Server(devServerOptions, compiler);

    await server.start();

    try {
      const response = await page.goto(`http://localhost:${port}/`, {
        waitUntil: "networkidle0",
      });

      expect(response.status()).toEqual(200);

      await expect(page).toHaveScreenshot();
    } catch (error) {
      throw error;
    } finally {
      await server.stop();
    }
  });

  test('should show an error when "client.overlay.errors" is "true"', async ({
    page,
  }) => {
    const compiler = webpack(config);

    new ErrorPlugin().apply(compiler);

    const devServerOptions = {
      port,
      client: {
        overlay: {
          errors: true,
        },
      },
    };
    const server = new Server(devServerOptions, compiler);

    await server.start();

    try {
      const response = await page.goto(`http://localhost:${port}/`, {
        waitUntil: "networkidle0",
      });

      expect(response.status()).toEqual(200);

      await expect(page).toHaveScreenshot();
    } catch (error) {
      throw error;
    } finally {
      await server.stop();
    }
  });

  test('should show an error when "client.overlay.warnings" is "true"', async ({
    page,
  }) => {
    const compiler = webpack(config);

    new WarningPlugin().apply(compiler);

    const devServerOptions = {
      port,
      client: {
        overlay: {
          warnings: true,
        },
      },
    };
    const server = new Server(devServerOptions, compiler);

    await server.start();

    try {
      const response = await page.goto(`http://localhost:${port}/`, {
        waitUntil: "networkidle0",
      });

      expect(response.status()).toEqual(200);

      await expect(page).toHaveScreenshot();
    } catch (error) {
      throw error;
    } finally {
      await server.stop();
    }
  });

  test("should show a warning and hide them after closing connection", async ({
    page,
  }) => {
    const compiler = webpack(config);

    new WarningPlugin().apply(compiler);

    const devServerOptions = { port };
    const server = new Server(devServerOptions, compiler);

    await server.start();

    try {
      const consoleMessages = [];

      page.on("console", (message) => {
        consoleMessages.push(message.text());
      });

      await page.goto(`http://localhost:${port}/`, {
        waitUntil: "networkidle0",
      });

      const pageHtml = await page.evaluate(() => document.body.outerHTML);
      const overlayHandle = await page.$("#webpack-dev-server-client-overlay");
      const overlayFrame = await overlayHandle.contentFrame();
      const overlayHtml = await overlayFrame.evaluate(
        () => document.body.outerHTML,
      );

      expect(
        await prettier.format(pageHtml, {
          parser: "html",
          plugins: [prettierHTML, prettierCSS],
        }),
      ).toMatchSnapshotWithArray("page html");
      expect(
        await prettier.format(overlayHtml, {
          parser: "html",
          plugins: [prettierHTML, prettierCSS],
        }),
      ).toMatchSnapshotWithArray("overlay html");

      await server.stop();

      await new Promise((resolve) => {
        const interval = setInterval(() => {
          if (consoleMessages.includes("[webpack-dev-server] Disconnected!")) {
            clearInterval(interval);

            resolve();
          }
        }, 100);
      });

      const pageHtmlAfterClose = await page.evaluate(
        () => document.body.outerHTML,
      );

      expect(
        await prettier.format(pageHtmlAfterClose, {
          parser: "html",
          plugins: [prettierHTML, prettierCSS],
        }),
      ).toMatchSnapshotWithArray("page html after close");
    } catch (error) {
      throw error;
    }
  });

  test("should show an error after invalidation", async ({ page }) => {
    const compiler = webpack(config);

    new ErrorPlugin("Error from compilation", 1).apply(compiler);

    const devServerOptions = {
      port,
    };
    const server = new Server(devServerOptions, compiler);

    await server.start();

    try {
      await page.goto(`http://localhost:${port}/`, {
        waitUntil: "networkidle0",
      });

      await new Promise((resolve) => {
        server.middleware.invalidate(() => {
          resolve();
        });
      });

      await new Promise((resolve) => {
        server.middleware.waitUntilValid(() => {
          resolve();
        });
      });

      await page.waitForSelector("#webpack-dev-server-client-overlay");
      await expect(page).toHaveScreenshot();
    } catch (error) {
      throw error;
    } finally {
      await server.stop();
    }
  });

  test("should show a warning after invalidation", async ({ page }) => {
    const compiler = webpack(config);

    new WarningPlugin("Warning from compilation", 1).apply(compiler);

    const devServerOptions = {
      port,
    };
    const server = new Server(devServerOptions, compiler);

    await server.start();

    try {
      await page.goto(`http://localhost:${port}/`, {
        waitUntil: "networkidle0",
      });

      await new Promise((resolve) => {
        server.middleware.invalidate(() => {
          resolve();
        });
      });

      await new Promise((resolve) => {
        server.middleware.waitUntilValid(() => {
          resolve();
        });
      });

      await page.waitForSelector("#webpack-dev-server-client-overlay");
      await expect(page).toHaveScreenshot();
    } catch (error) {
      throw error;
    } finally {
      await server.stop();
    }
  });

  test("should show error for uncaught runtime error", async ({ page }) => {
    const compiler = webpack(config);

    const server = new Server(
      {
        port,
      },
      compiler,
    );

    await server.start();

    try {
      await page.goto(`http://localhost:${port}/`, {
        waitUntil: "networkidle0",
      });

      await page.addScriptTag({
        content: `(function throwError() {
        throw new Error('Injected error');
      })();`,
      });

      await expect(page).toHaveScreenshot();
    } catch (error) {
      throw error;
    } finally {
      await server.stop();
    }
  });

  test("should not show filtered runtime error", async ({ page }) => {
    const compiler = webpack(config);

    const server = new Server(
      {
        port,
        client: {
          overlay: {
            runtimeErrors: (error) => error && !/Injected/.test(error.message),
          },
        },
      },
      compiler,
    );

    await server.start();

    try {
      await page.goto(`http://localhost:${port}/`, {
        waitUntil: "networkidle0",
      });

      await page.addScriptTag({
        content: `(function throwError() {
        throw new Error('Injected error');
      })();`,
      });

      await expect(page).toHaveScreenshot();
    } catch (error) {
      throw error;
    } finally {
      await server.stop();
    }
  });

  test("should show error for uncaught promise rejection", async ({ page }) => {
    const compiler = webpack(config);

    const server = new Server(
      {
        port,
      },
      compiler,
    );

    await server.start();

    try {
      await page.goto(`http://localhost:${port}/`, {
        waitUntil: "networkidle0",
      });

      await page.addScriptTag({
        content: `(function throwError() {
        setTimeout(function () {
          Promise.reject(new Error('Async error'));
        }, 0);
      })();`,
      });

      await expect(page).toHaveScreenshot();
    } catch (error) {
      throw error;
    } finally {
      await server.stop();
    }
  });

  test("should not show filtered promise rejection", async ({ page }) => {
    const compiler = webpack(config);

    const server = new Server(
      {
        port,
        client: {
          overlay: {
            runtimeErrors: (error) => !/Injected/.test(error.message),
          },
        },
      },
      compiler,
    );

    await server.start();

    try {
      await page.goto(`http://localhost:${port}/`, {
        waitUntil: "networkidle0",
      });

      await page.addScriptTag({
        content: `(function throwError() {
        setTimeout(function () {
          Promise.reject(new Error('Injected async error'));
        }, 0);
      })();`,
      });

      await expect(page).toHaveScreenshot();
    } catch (error) {
      throw error;
    } finally {
      await server.stop();
    }
  });

  test('should show overlay when "Content-Security-Policy" is "default-src \'self\'" was used', async ({
    page,
  }) => {
    const compiler = webpack({ ...config, devtool: false });

    new ErrorPlugin().apply(compiler);

    const devServerOptions = {
      port,
      headers: [
        {
          key: "Content-Security-Policy",
          value: "default-src 'self'",
        },
      ],
    };
    const server = new Server(devServerOptions, compiler);

    await server.start();

    try {
      const response = await page.goto(`http://localhost:${port}/`, {
        waitUntil: "networkidle0",
      });

      expect(response.status()).toEqual(200);

      await expect(page).toHaveScreenshot();
    } catch (error) {
      throw error;
    } finally {
      await server.stop();
    }
  });
});
