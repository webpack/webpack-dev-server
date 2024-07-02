"use strict";

const path = require("path");
const fs = require("graceful-fs");
const webpack = require("webpack");
const { test } = require("@playwright/test");
const { describe } = require("@playwright/test");
const { expect } = require("@playwright/test");
const { beforeAll } = require("@playwright/test");
const waitForExpect = require("wait-for-expect");
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

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

let prettier;
let prettierHTML;
let prettierCSS;

describe("overlay", () => {
  beforeAll(async () => {
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
      await page.goto(`http://localhost:${port}/`, {
        waitUntil: "networkidle0",
      });

      // Delay for the overlay to appear
      await delay(1000);

      // eslint-disable-next-line no-undef
      const pageHtml = await page.evaluate(() => document.body.outerHTML);
      const overlayHandle = await page.$("#webpack-dev-server-client-overlay");
      const overlayFrame = await overlayHandle.contentFrame();
      const overlayHtml = await overlayFrame.evaluate(
        // eslint-disable-next-line no-undef
        () => document.body.outerHTML,
      );

      expect(
        await prettier.format(pageHtml, {
          parser: "html",
          plugins: [prettierHTML, prettierCSS],
        }),
      ).toMatchSnapshot("page html");
      expect(
        JSON.stringify(
          await prettier.format(overlayHtml, {
            parser: "html",
            plugins: [prettierHTML, prettierCSS],
          }),
        ),
      ).toMatchSnapshot("overlay html");
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
      await page.goto(`http://localhost:${port}/`, {
        waitUntil: "networkidle0",
      });

      // Delay for the overlay to appear
      await delay(1000);

      // eslint-disable-next-line no-undef
      const pageHtml = await page.evaluate(() => document.body.outerHTML);
      const overlayHandle = await page.$("#webpack-dev-server-client-overlay");
      const overlayFrame = await overlayHandle.contentFrame();
      const overlayHtml = await overlayFrame.evaluate(
        // eslint-disable-next-line no-undef
        () => document.body.outerHTML,
      );

      expect(
        JSON.stringify(
          await prettier.format(pageHtml, {
            parser: "html",
            plugins: [prettierHTML, prettierCSS],
          }),
        ),
      ).toMatchSnapshot("page html");
      expect(
        JSON.stringify(
          await prettier.format(overlayHtml, {
            parser: "html",
            plugins: [prettierHTML, prettierCSS],
          }),
        ),
      ).toMatchSnapshot("overlay html");
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
      await page.goto(`http://localhost:${port}/`, {
        waitUntil: "networkidle0",
      });

      // Delay for the overlay to appear
      await delay(1000);

      // eslint-disable-next-line no-undef
      const pageHtml = await page.evaluate(() => document.body.outerHTML);
      const overlayHandle = await page.$("#webpack-dev-server-client-overlay");
      const overlayFrame = await overlayHandle.contentFrame();
      const overlayHtml = await overlayFrame.evaluate(
        // eslint-disable-next-line no-undef
        () => document.body.outerHTML,
      );

      expect(
        JSON.stringify(
          await prettier.format(pageHtml, {
            parser: "html",
            plugins: [prettierHTML, prettierCSS],
          }),
        ),
      ).toMatchSnapshot("page html");
      expect(
        JSON.stringify(
          await prettier.format(overlayHtml, {
            parser: "html",
            plugins: [prettierHTML, prettierCSS],
          }),
        ),
      ).toMatchSnapshot("overlay html");
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
      await page.goto(`http://localhost:${port}/`, {
        waitUntil: "networkidle0",
      });

      // Delay for the overlay to appear
      await delay(1000);

      // eslint-disable-next-line no-undef
      const pageHtml = await page.evaluate(() => document.body.outerHTML);
      const overlayHandle = await page.$("#webpack-dev-server-client-overlay");
      const overlayFrame = await overlayHandle.contentFrame();
      const overlayHtml = await overlayFrame.evaluate(
        // eslint-disable-next-line no-undef
        () => document.body.outerHTML,
      );

      expect(
        JSON.stringify(
          await prettier.format(pageHtml, {
            parser: "html",
            plugins: [prettierHTML, prettierCSS],
          }),
        ),
      ).toMatchSnapshot("page html");
      expect(
        JSON.stringify(
          await prettier.format(overlayHtml, {
            parser: "html",
            plugins: [prettierHTML, prettierCSS],
          }),
        ),
      ).toMatchSnapshot("overlay html");
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
      await page.goto(`http://localhost:${port}/`, {
        waitUntil: "networkidle0",
      });

      // Delay for the overlay to appear
      await delay(1000);

      // eslint-disable-next-line no-undef
      const pageHtml = await page.evaluate(() => document.body.outerHTML);
      const overlayHandle = await page.$("#webpack-dev-server-client-overlay");
      const overlayFrame = await overlayHandle.contentFrame();
      const overlayHtml = await overlayFrame.evaluate(
        // eslint-disable-next-line no-undef
        () => document.body.outerHTML,
      );

      expect(
        JSON.stringify(
          await prettier.format(pageHtml, {
            parser: "html",
            plugins: [prettierHTML, prettierCSS],
          }),
        ),
      ).toMatchSnapshot("page html");
      expect(
        JSON.stringify(
          await prettier.format(overlayHtml, {
            parser: "html",
            plugins: [prettierHTML, prettierCSS],
          }),
        ),
      ).toMatchSnapshot("overlay html");
    } catch (error) {
      throw error;
    } finally {
      await server.stop();
    }
  });

  test("should not show initially, then show on an error, then hide on fix", async ({
    page,
  }) => {
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

      // eslint-disable-next-line no-undef
      let pageHtml = await page.evaluate(() => document.body.outerHTML);
      let overlayHandle = await page.$("#webpack-dev-server-client-overlay");

      expect(overlayHandle).toBe(null);
      expect(
        JSON.stringify(
          await prettier.format(pageHtml, {
            parser: "html",
            plugins: [prettierHTML, prettierCSS],
          }),
        ),
      ).toMatchSnapshot("page html initial");

      const pathToFile = path.resolve(
        __dirname,
        "../fixtures/overlay-config/foo.js",
      );
      const originalCode = fs.readFileSync(pathToFile);

      fs.writeFileSync(pathToFile, "`;");

      await page.waitForSelector("#webpack-dev-server-client-overlay");

      overlayHandle = await page.$("#webpack-dev-server-client-overlay");
      // eslint-disable-next-line no-undef
      pageHtml = await page.evaluate(() => document.body.outerHTML);

      const overlayFrame = await overlayHandle.contentFrame();
      const overlayHtml = await overlayFrame.evaluate(
        // eslint-disable-next-line no-undef
        () => document.body.outerHTML,
      );

      expect(
        JSON.stringify(
          await prettier.format(pageHtml, {
            parser: "html",
            plugins: [prettierHTML, prettierCSS],
          }),
        ),
      ).toMatchSnapshot("page html with error");
      expect(
        JSON.stringify(
          await prettier.format(overlayHtml, {
            parser: "html",
            plugins: [prettierHTML, prettierCSS],
          }),
        ),
      ).toMatchSnapshot("overlay html");

      fs.writeFileSync(pathToFile, originalCode);

      await page.waitForSelector("#webpack-dev-server-client-overlay", {
        hidden: true,
      });

      // eslint-disable-next-line no-undef
      pageHtml = await page.evaluate(() => document.body.outerHTML);
      overlayHandle = await page.$("#webpack-dev-server-client-overlay");

      expect(overlayHandle).toBe(null);
      expect(
        JSON.stringify(
          await prettier.format(pageHtml, {
            parser: "html",
            plugins: [prettierHTML, prettierCSS],
          }),
        ),
      ).toMatchSnapshot("page html after fix error");
    } catch (error) {
      throw error;
    } finally {
      await server.stop();
    }
  });

  test("should not show initially, then show on an error, then show other error, then hide on fix", async ({
    page,
  }) => {
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

      // eslint-disable-next-line no-undef
      let pageHtml = await page.evaluate(() => document.body.outerHTML);
      let overlayHandle = await page.$("#webpack-dev-server-client-overlay");

      expect(overlayHandle).toBe(null);
      expect(
        JSON.stringify(
          await prettier.format(pageHtml, {
            parser: "html",
            plugins: [prettierHTML, prettierCSS],
          }),
        ),
      ).toMatchSnapshot("page html initial");

      const pathToFile = path.resolve(
        __dirname,
        "../fixtures/overlay-config/foo.js",
      );
      const originalCode = fs.readFileSync(pathToFile);

      fs.writeFileSync(pathToFile, "`;");

      await page.waitForSelector("#webpack-dev-server-client-overlay");

      overlayHandle = await page.$("#webpack-dev-server-client-overlay");
      // eslint-disable-next-line no-undef
      pageHtml = await page.evaluate(() => document.body.outerHTML);

      let overlayFrame = await overlayHandle.contentFrame();
      let overlayHtml = await overlayFrame.evaluate(
        // eslint-disable-next-line no-undef
        () => document.body.outerHTML,
      );

      expect(
        JSON.stringify(
          await prettier.format(pageHtml, {
            parser: "html",
            plugins: [prettierHTML, prettierCSS],
          }),
        ),
      ).toMatchSnapshot("page html with error");
      expect(
        JSON.stringify(
          await prettier.format(overlayHtml, {
            parser: "html",
            plugins: [prettierHTML, prettierCSS],
          }),
        ),
      ).toMatchSnapshot("overlay html");

      fs.writeFileSync(pathToFile, "`;a");

      await page.waitForSelector("#webpack-dev-server-client-overlay", {
        hidden: true,
      });
      await page.waitForSelector("#webpack-dev-server-client-overlay");

      overlayHandle = await page.$("#webpack-dev-server-client-overlay");
      // eslint-disable-next-line no-undef
      pageHtml = await page.evaluate(() => document.body.outerHTML);

      overlayFrame = await overlayHandle.contentFrame();
      // eslint-disable-next-line no-undef
      overlayHtml = await overlayFrame.evaluate(() => document.body.outerHTML);

      expect(
        JSON.stringify(
          await prettier.format(pageHtml, {
            parser: "html",
            plugins: [prettierHTML, prettierCSS],
          }),
        ),
      ).toMatchSnapshot("page html with other error");
      expect(
        JSON.stringify(
          await prettier.format(overlayHtml, {
            parser: "html",
            plugins: [prettierHTML, prettierCSS],
          }),
        ),
      ).toMatchSnapshot("overlay html");

      fs.writeFileSync(pathToFile, originalCode);

      await page.waitForSelector("#webpack-dev-server-client-overlay", {
        hidden: true,
      });

      // eslint-disable-next-line no-undef
      pageHtml = await page.evaluate(() => document.body.outerHTML);
      overlayHandle = await page.$("#webpack-dev-server-client-overlay");

      expect(overlayHandle).toBe(null);
      expect(
        JSON.stringify(
          await prettier.format(pageHtml, {
            parser: "html",
            plugins: [prettierHTML, prettierCSS],
          }),
        ),
      ).toMatchSnapshot("page html after fix error");
    } catch (error) {
      throw error;
    } finally {
      await server.stop();
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

    try {
      await page.goto(`http://localhost:${port}/`, {
        waitUntil: "networkidle0",
      });

      // eslint-disable-next-line no-undef
      let pageHtml = await page.evaluate(() => document.body.outerHTML);
      let overlayHandle = await page.$("#webpack-dev-server-client-overlay");

      expect(overlayHandle).toBe(null);
      expect(
        JSON.stringify(
          await prettier.format(pageHtml, {
            parser: "html",
            plugins: [prettierHTML, prettierCSS],
          }),
        ),
      ).toMatchSnapshot("page html initial");

      const pathToFile = path.resolve(
        __dirname,
        "../fixtures/overlay-config/foo.js",
      );
      const originalCode = fs.readFileSync(pathToFile);

      fs.writeFileSync(pathToFile, "`;");

      await page.waitForSelector("#webpack-dev-server-client-overlay");

      overlayHandle = await page.$("#webpack-dev-server-client-overlay");
      // eslint-disable-next-line no-undef
      pageHtml = await page.evaluate(() => document.body.outerHTML);

      const overlayFrame = await overlayHandle.contentFrame();
      const overlayHtml = await overlayFrame.evaluate(
        // eslint-disable-next-line no-undef
        () => document.body.outerHTML,
      );

      expect(
        JSON.stringify(
          await prettier.format(pageHtml, {
            parser: "html",
            plugins: [prettierHTML, prettierCSS],
          }),
        ),
      ).toMatchSnapshot("page html with error");
      expect(
        JSON.stringify(
          await prettier.format(overlayHtml, {
            parser: "html",
            plugins: [prettierHTML, prettierCSS],
          }),
        ),
      ).toMatchSnapshot("overlay html");

      const frame = await page
        .frames()
        .find((item) => item.name() === "webpack-dev-server-client-overlay");

      const buttonHandle = await frame.$("button");

      await buttonHandle.click();

      await page.waitForSelector("#webpack-dev-server-client-overlay", {
        hidden: true,
      });

      // eslint-disable-next-line no-undef
      pageHtml = await page.evaluate(() => document.body.outerHTML);
      overlayHandle = await page.$("#webpack-dev-server-client-overlay");

      expect(overlayHandle).toBe(null);
      expect(
        JSON.stringify(
          await prettier.format(pageHtml, {
            parser: "html",
            plugins: [prettierHTML, prettierCSS],
          }),
        ),
      ).toMatchSnapshot("page html after close");

      fs.writeFileSync(pathToFile, originalCode);
    } catch (error) {
      throw error;
    } finally {
      await server.stop();
    }
  });

  test("should open editor when error with file info is clicked", async ({
    page,
  }) => {
    const mockLaunchEditorCb = jest.fn();
    jest.mock("launch-editor", () => mockLaunchEditorCb);

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
        expect(mockLaunchEditorCb).toHaveBeenCalledTimes(1);
      });

      fs.writeFileSync(pathToFile, originalCode);
    } catch (error) {
      throw error;
    } finally {
      await server.stop();
    }
  });

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
      await page.goto(`http://localhost:${port}/`, {
        waitUntil: "networkidle0",
      });

      // Delay for the overlay to appear
      await delay(1000);

      // eslint-disable-next-line no-undef
      const pageHtml = await page.evaluate(() => document.body.outerHTML);
      const overlayHandle = await page.$("#webpack-dev-server-client-overlay");

      expect(overlayHandle).toBe(null);
      expect(
        JSON.stringify(
          await prettier.format(pageHtml, {
            parser: "html",
            plugins: [prettierHTML, prettierCSS],
          }),
        ),
      ).toMatchSnapshot("page html");
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
      await page.goto(`http://localhost:${port}/`, {
        waitUntil: "networkidle0",
      });

      // Delay for the overlay to appear
      await delay(1000);

      // eslint-disable-next-line no-undef
      const pageHtml = await page.evaluate(() => document.body.outerHTML);
      const overlayHandle = await page.$("#webpack-dev-server-client-overlay");

      expect(overlayHandle).toBe(null);
      expect(
        JSON.stringify(
          await prettier.format(pageHtml, {
            parser: "html",
            plugins: [prettierHTML, prettierCSS],
          }),
        ),
      ).toMatchSnapshot("page html");
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
      await page.goto(`http://localhost:${port}/`, {
        waitUntil: "networkidle0",
      });

      // Delay for the overlay to appear
      await delay(1000);

      const overlayHandle = await page.$("#webpack-dev-server-client-overlay");

      expect(overlayHandle).toBe(null);
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
      await page.goto(`http://localhost:${port}/`, {
        waitUntil: "networkidle0",
      });

      // Delay for the overlay to appear
      await delay(1000);

      // eslint-disable-next-line no-undef
      const pageHtml = await page.evaluate(() => document.body.outerHTML);
      const overlayHandle = await page.$("#webpack-dev-server-client-overlay");
      const overlayFrame = await overlayHandle.contentFrame();
      const overlayHtml = await overlayFrame.evaluate(
        // eslint-disable-next-line no-undef
        () => document.body.outerHTML,
      );

      expect(
        JSON.stringify(
          await prettier.format(pageHtml, {
            parser: "html",
            plugins: [prettierHTML, prettierCSS],
          }),
        ),
      ).toMatchSnapshot("page html");
      expect(
        JSON.stringify(
          await prettier.format(overlayHtml, {
            parser: "html",
            plugins: [prettierHTML, prettierCSS],
          }),
        ),
      ).toMatchSnapshot("overlay html");
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
      await page.goto(`http://localhost:${port}/`, {
        waitUntil: "networkidle0",
      });

      // Delay for the overlay to appear
      await delay(1000);

      // eslint-disable-next-line no-undef
      const pageHtml = await page.evaluate(() => document.body.outerHTML);
      const overlayHandle = await page.$("#webpack-dev-server-client-overlay");
      const overlayFrame = await overlayHandle.contentFrame();
      const overlayHtml = await overlayFrame.evaluate(
        // eslint-disable-next-line no-undef
        () => document.body.outerHTML,
      );

      expect(
        JSON.stringify(
          await prettier.format(pageHtml, {
            parser: "html",
            plugins: [prettierHTML, prettierCSS],
          }),
        ),
      ).toMatchSnapshot("page html");
      expect(
        JSON.stringify(
          await prettier.format(overlayHtml, {
            parser: "html",
            plugins: [prettierHTML, prettierCSS],
          }),
        ),
      ).toMatchSnapshot("overlay html");
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
      await page.goto(`http://localhost:${port}/`, {
        waitUntil: "networkidle0",
      });

      // Delay for the overlay to appear
      await delay(1000);

      // eslint-disable-next-line no-undef
      const pageHtml = await page.evaluate(() => document.body.outerHTML);
      const overlayHandle = await page.$("#webpack-dev-server-client-overlay");
      const overlayFrame = await overlayHandle.contentFrame();
      const overlayHtml = await overlayFrame.evaluate(
        // eslint-disable-next-line no-undef
        () => document.body.outerHTML,
      );

      expect(
        JSON.stringify(
          await prettier.format(pageHtml, {
            parser: "html",
            plugins: [prettierHTML, prettierCSS],
          }),
        ),
      ).toMatchSnapshot("page html");
      expect(
        JSON.stringify(
          await prettier.format(overlayHtml, {
            parser: "html",
            plugins: [prettierHTML, prettierCSS],
          }),
        ),
      ).toMatchSnapshot("overlay html");
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
      await page.goto(`http://localhost:${port}/`, {
        waitUntil: "networkidle0",
      });

      // Delay for the overlay to appear
      await delay(1000);

      // eslint-disable-next-line no-undef
      const pageHtml = await page.evaluate(() => document.body.outerHTML);
      const overlayHandle = await page.$("#webpack-dev-server-client-overlay");
      const overlayFrame = await overlayHandle.contentFrame();
      const overlayHtml = await overlayFrame.evaluate(
        // eslint-disable-next-line no-undef
        () => document.body.outerHTML,
      );

      expect(
        JSON.stringify(
          await prettier.format(pageHtml, {
            parser: "html",
            plugins: [prettierHTML, prettierCSS],
          }),
        ),
      ).toMatchSnapshot("page html");
      expect(
        JSON.stringify(
          await prettier.format(overlayHtml, {
            parser: "html",
            plugins: [prettierHTML, prettierCSS],
          }),
        ),
      ).toMatchSnapshot("overlay html");
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
      await page.goto(`http://localhost:${port}/`, {
        waitUntil: "networkidle0",
      });

      // Delay for the overlay to appear
      await delay(1000);

      // eslint-disable-next-line no-undef
      const pageHtml = await page.evaluate(() => document.body.outerHTML);
      const overlayHandle = await page.$("#webpack-dev-server-client-overlay");

      expect(overlayHandle).toBe(null);
      expect(
        JSON.stringify(
          await prettier.format(pageHtml, {
            parser: "html",
            plugins: [prettierHTML, prettierCSS],
          }),
        ),
      ).toMatchSnapshot("page html");
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
      await page.goto(`http://localhost:${port}/`, {
        waitUntil: "networkidle0",
      });

      // Delay for the overlay to appear
      await delay(1000);

      // eslint-disable-next-line no-undef
      const pageHtml = await page.evaluate(() => document.body.outerHTML);
      const overlayHandle = await page.$("#webpack-dev-server-client-overlay");

      expect(overlayHandle).toBe(null);
      expect(
        JSON.stringify(
          await prettier.format(pageHtml, {
            parser: "html",
            plugins: [prettierHTML, prettierCSS],
          }),
        ),
      ).toMatchSnapshot("page html");
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
      await page.goto(`http://localhost:${port}/`, {
        waitUntil: "networkidle0",
      });

      // Delay for the overlay to appear
      await delay(1000);

      const overlayHandle = await page.$("#webpack-dev-server-client-overlay");

      expect(overlayHandle).toBe(null);
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
      await page.goto(`http://localhost:${port}/`, {
        waitUntil: "networkidle0",
      });

      // Delay for the overlay to appear
      await delay(1000);

      // eslint-disable-next-line no-undef
      const pageHtml = await page.evaluate(() => document.body.outerHTML);
      const overlayHandle = await page.$("#webpack-dev-server-client-overlay");
      const overlayFrame = await overlayHandle.contentFrame();
      const overlayHtml = await overlayFrame.evaluate(
        // eslint-disable-next-line no-undef
        () => document.body.outerHTML,
      );

      expect(
        JSON.stringify(
          await prettier.format(pageHtml, {
            parser: "html",
            plugins: [prettierHTML, prettierCSS],
          }),
        ),
      ).toMatchSnapshot("page html");
      expect(
        JSON.stringify(
          await prettier.format(overlayHtml, {
            parser: "html",
            plugins: [prettierHTML, prettierCSS],
          }),
        ),
      ).toMatchSnapshot("overlay html");
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
      await page.goto(`http://localhost:${port}/`, {
        waitUntil: "networkidle0",
      });

      // Delay for the overlay to appear
      await delay(1000);

      // eslint-disable-next-line no-undef
      const pageHtml = await page.evaluate(() => document.body.outerHTML);
      const overlayHandle = await page.$("#webpack-dev-server-client-overlay");
      const overlayFrame = await overlayHandle.contentFrame();
      const overlayHtml = await overlayFrame.evaluate(
        // eslint-disable-next-line no-undef
        () => document.body.outerHTML,
      );

      expect(
        JSON.stringify(
          await prettier.format(pageHtml, {
            parser: "html",
            plugins: [prettierHTML, prettierCSS],
          }),
        ),
      ).toMatchSnapshot("page html");
      expect(
        JSON.stringify(
          await prettier.format(overlayHtml, {
            parser: "html",
            plugins: [prettierHTML, prettierCSS],
          }),
        ),
      ).toMatchSnapshot("overlay html");
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

      await page.goto(`http://localhost:${port}/`, {
        waitUntil: "networkidle0",
      });

      // Delay for the overlay to appear
      await delay(1000);

      // eslint-disable-next-line no-undef
      const pageHtml = await page.evaluate(() => document.body.outerHTML);
      const overlayHandle = await page.$("#webpack-dev-server-client-overlay");
      const overlayFrame = await overlayHandle.contentFrame();
      const overlayHtml = await overlayFrame.evaluate(
        // eslint-disable-next-line no-undef
        () => document.body.outerHTML,
      );

      expect(
        consoleMessages.filter((item) =>
          /requires 'TrustedHTML' assignment/.test(item),
        ),
      ).toHaveLength(0);
      expect(
        JSON.stringify(
          await prettier.format(pageHtml, {
            parser: "html",
            plugins: [prettierHTML, prettierCSS],
          }),
        ),
      ).toMatchSnapshot("page html");
      expect(
        JSON.stringify(
          await prettier.format(overlayHtml, {
            parser: "html",
            plugins: [prettierHTML, prettierCSS],
          }),
        ),
      ).toMatchSnapshot("overlay html");
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

      await page.goto(`http://localhost:${port}/`, {
        waitUntil: "networkidle0",
      });

      // Delay for the overlay to appear
      await delay(1000);

      // eslint-disable-next-line no-undef
      const pageHtml = await page.evaluate(() => document.body.outerHTML);
      const overlayHandle = await page.$("#webpack-dev-server-client-overlay");
      const overlayFrame = await overlayHandle.contentFrame();
      const overlayHtml = await overlayFrame.evaluate(
        // eslint-disable-next-line no-undef
        () => document.body.outerHTML,
      );

      await page.goto(`http://localhost:${port}/`, {
        waitUntil: "networkidle0",
      });

      expect(
        consoleMessages.filter((item) =>
          /requires 'TrustedHTML' assignment/.test(item),
        ),
      ).toHaveLength(0);
      expect(
        JSON.stringify(
          await prettier.format(pageHtml, {
            parser: "html",
            plugins: [prettierHTML, prettierCSS],
          }),
        ),
      ).toMatchSnapshot("page html");
      expect(
        JSON.stringify(
          await prettier.format(overlayHtml, {
            parser: "html",
            plugins: [prettierHTML, prettierCSS],
          }),
        ),
      ).toMatchSnapshot("overlay html");
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
      await page.goto(`http://localhost:${port}/`, {
        waitUntil: "networkidle0",
      });

      // Delay for the overlay to appear
      await delay(1000);

      // eslint-disable-next-line no-undef
      const pageHtml = await page.evaluate(() => document.body.outerHTML);
      const overlayHandle = await page.$("#webpack-dev-server-client-overlay");
      expect(overlayHandle).toBe(null);
      expect(
        JSON.stringify(
          await prettier.format(pageHtml, {
            parser: "html",
            plugins: [prettierHTML, prettierCSS],
          }),
        ),
      ).toMatchSnapshot("page html");
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
      await page.goto(`http://localhost:${port}/`, {
        waitUntil: "networkidle0",
      });

      // Delay for the overlay to appear
      await delay(1000);

      // eslint-disable-next-line no-undef
      const pageHtml = await page.evaluate(() => document.body.outerHTML);
      const overlayHandle = await page.$("#webpack-dev-server-client-overlay");
      const overlayFrame = await overlayHandle.contentFrame();
      const overlayHtml = await overlayFrame.evaluate(
        // eslint-disable-next-line no-undef
        () => document.body.outerHTML,
      );

      expect(
        JSON.stringify(
          await prettier.format(pageHtml, {
            parser: "html",
            plugins: [prettierHTML, prettierCSS],
          }),
        ),
      ).toMatchSnapshot("page html");
      expect(
        JSON.stringify(
          await prettier.format(overlayHtml, {
            parser: "html",
            plugins: [prettierHTML, prettierCSS],
          }),
        ),
      ).toMatchSnapshot("overlay html");
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
      await page.goto(`http://localhost:${port}/`, {
        waitUntil: "networkidle0",
      });

      // Delay for the overlay to appear
      await delay(1000);

      // eslint-disable-next-line no-undef
      const pageHtml = await page.evaluate(() => document.body.outerHTML);
      const overlayHandle = await page.$("#webpack-dev-server-client-overlay");
      const overlayFrame = await overlayHandle.contentFrame();
      const overlayHtml = await overlayFrame.evaluate(
        // eslint-disable-next-line no-undef
        () => document.body.outerHTML,
      );

      expect(
        JSON.stringify(
          await prettier.format(pageHtml, {
            parser: "html",
            plugins: [prettierHTML, prettierCSS],
          }),
        ),
      ).toMatchSnapshot("page html");
      expect(
        JSON.stringify(
          await prettier.format(overlayHtml, {
            parser: "html",
            plugins: [prettierHTML, prettierCSS],
          }),
        ),
      ).toMatchSnapshot("overlay html");
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

      // Delay for the overlay to appear
      await delay(1000);

      // eslint-disable-next-line no-undef
      const pageHtml = await page.evaluate(() => document.body.outerHTML);
      const overlayHandle = await page.$("#webpack-dev-server-client-overlay");
      const overlayFrame = await overlayHandle.contentFrame();
      const overlayHtml = await overlayFrame.evaluate(
        // eslint-disable-next-line no-undef
        () => document.body.outerHTML,
      );

      expect(
        JSON.stringify(
          await prettier.format(pageHtml, {
            parser: "html",
            plugins: [prettierHTML, prettierCSS],
          }),
        ),
      ).toMatchSnapshot("page html");
      expect(
        JSON.stringify(
          await prettier.format(overlayHtml, {
            parser: "html",
            plugins: [prettierHTML, prettierCSS],
          }),
        ),
      ).toMatchSnapshot("overlay html");

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
        // eslint-disable-next-line no-undef
        () => document.body.outerHTML,
      );

      expect(
        JSON.stringify(
          await prettier.format(pageHtmlAfterClose, {
            parser: "html",
            plugins: [prettierHTML, prettierCSS],
          }),
        ),
      ).toMatchSnapshot("page html");
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

      // Delay for the overlay to appear
      await delay(1000);

      await page.waitForSelector("#webpack-dev-server-client-overlay");

      // eslint-disable-next-line no-undef
      const pageHtml = await page.evaluate(() => document.body.outerHTML);
      const overlayHandle = await page.$("#webpack-dev-server-client-overlay");
      const overlayFrame = await overlayHandle.contentFrame();
      const overlayHtml = await overlayFrame.evaluate(
        // eslint-disable-next-line no-undef
        () => document.body.outerHTML,
      );

      expect(
        JSON.stringify(
          await prettier.format(pageHtml, {
            parser: "html",
            plugins: [prettierHTML, prettierCSS],
          }),
        ),
      ).toMatchSnapshot("page html");
      expect(
        JSON.stringify(
          await prettier.format(overlayHtml, {
            parser: "html",
            plugins: [prettierHTML, prettierCSS],
          }),
        ),
      ).toMatchSnapshot("overlay html");
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

      // Delay for the overlay to appear
      await delay(1000);

      await page.waitForSelector("#webpack-dev-server-client-overlay");

      // eslint-disable-next-line no-undef
      const pageHtml = await page.evaluate(() => document.body.outerHTML);
      const overlayHandle = await page.$("#webpack-dev-server-client-overlay");
      const overlayFrame = await overlayHandle.contentFrame();
      const overlayHtml = await overlayFrame.evaluate(
        // eslint-disable-next-line no-undef
        () => document.body.outerHTML,
      );

      expect(
        JSON.stringify(
          await prettier.format(pageHtml, {
            parser: "html",
            plugins: [prettierHTML, prettierCSS],
          }),
        ),
      ).toMatchSnapshot("page html");
      expect(
        JSON.stringify(
          await prettier.format(overlayHtml, {
            parser: "html",
            plugins: [prettierHTML, prettierCSS],
          }),
        ),
      ).toMatchSnapshot("overlay html");
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

      // Delay for the overlay to appear
      await delay(1000);

      const overlayHandle = await page.$("#webpack-dev-server-client-overlay");
      const overlayFrame = await overlayHandle.contentFrame();
      const overlayHtml = await overlayFrame.evaluate(
        // eslint-disable-next-line no-undef
        () => document.body.outerHTML,
      );

      expect(
        JSON.stringify(
          await prettier.format(overlayHtml, {
            parser: "html",
            plugins: [prettierHTML, prettierCSS],
          }),
        ),
      ).toMatchSnapshot("overlay html");
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

      // Delay for the overlay to appear
      await delay(1000);

      const overlayHandle = await page.$("#webpack-dev-server-client-overlay");

      expect(overlayHandle).toBe(null);
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

      // Delay for the overlay to appear
      await delay(1000);

      const overlayHandle = await page.$("#webpack-dev-server-client-overlay");
      const overlayFrame = await overlayHandle.contentFrame();
      const overlayHtml = await overlayFrame.evaluate(
        // eslint-disable-next-line no-undef
        () => document.body.outerHTML,
      );

      expect(
        JSON.stringify(
          await prettier.format(overlayHtml, {
            parser: "html",
            plugins: [prettierHTML, prettierCSS],
          }),
        ),
      ).toMatchSnapshot("overlay html");
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

      // Delay for the overlay to appear
      await delay(1000);

      const overlayHandle = await page.$("#webpack-dev-server-client-overlay");

      expect(overlayHandle).toBe(null);
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
      const consoleMessages = [];

      page.on("console", (message) => {
        consoleMessages.push(message.text());
      });

      await page.goto(`http://localhost:${port}/`, {
        waitUntil: "networkidle0",
      });

      // Delay for the overlay to appear
      await delay(1000);

      // eslint-disable-next-line no-undef
      const pageHtml = await page.evaluate(() => document.body.outerHTML);
      const overlayHandle = await page.$("#webpack-dev-server-client-overlay");
      const overlayFrame = await overlayHandle.contentFrame();
      const overlayHtml = await overlayFrame.evaluate(
        // eslint-disable-next-line no-undef
        () => document.body.outerHTML,
      );

      expect(
        JSON.stringify(
          await prettier.format(pageHtml, {
            parser: "html",
            plugins: [prettierHTML, prettierCSS],
          }),
        ),
      ).toMatchSnapshot("page html");
      expect(
        JSON.stringify(
          await prettier.format(overlayHtml, {
            parser: "html",
            plugins: [prettierHTML, prettierCSS],
          }),
        ),
      ).toMatchSnapshot("overlay html");
    } catch (error) {
      throw error;
    } finally {
      await server.stop();
    }
  });
});
