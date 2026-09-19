import path from "node:path";
import { afterEach, describe, it, mock } from "node:test";
import { fileURLToPath } from "node:url";
import { expect } from "expect";
import fs from "graceful-fs";
import { fn } from "jest-mock";
import { format } from "prettier";
import waitForExpect from "wait-for-expect";
import webpack from "webpack";
import Server from "../../lib/Server.js";
import trustedTypesConfig from "../fixtures/overlay-config/trusted-types.webpack.config.js";
import config from "../fixtures/overlay-config/webpack.config.js";
import runBrowser from "../helpers/run-browser.js";
import portsMap from "../ports-map.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const port = portsMap.overlay;
const pathToOverlayFixture = path.resolve(
  __dirname,
  "../fixtures/overlay-config/foo.js",
);
const overlayFixtureCode = fs.readFileSync(pathToOverlayFixture);

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

const delay = (ms) =>
  new Promise((resolve) => {
    setTimeout(resolve, ms);
  });

describe("overlay", () => {
  // Several tests below break this fixture on purpose so that the compiler
  // emits an error, then repair it once they are done. Repairing it here too
  // means an assertion that fails in between cannot leave the fixture broken
  // on disk, where it used to make every following test compile the broken
  // file and turn a single mismatch into a cascade of failures.
  afterEach(() => {
    if (!fs.readFileSync(pathToOverlayFixture).equals(overlayFixtureCode)) {
      fs.writeFileSync(pathToOverlayFixture, overlayFixtureCode);
    }
  });

  it("should show a warning for initial compilation", async (t) => {
    const compiler = webpack(config);

    new WarningPlugin().apply(compiler);

    const devServerOptions = {
      port,
    };
    const server = new Server(devServerOptions, compiler);

    await server.start();

    const { page, browser } = await runBrowser();

    try {
      await page.goto(`http://localhost:${port}/`, {
        waitUntil: "networkidle0",
      });

      // Delay for the overlay to appear
      await delay(1000);

      const pageHtml = await page.evaluate(() => document.body.outerHTML);
      const overlayHandle = await page.$("#webpack-dev-server-client-overlay");
      const overlayFrame = await overlayHandle.contentFrame();
      const overlayHtml = await overlayFrame.evaluate(
        () => document.body.outerHTML,
      );

      t.assert.snapshot(
        await format(pageHtml, {
          parser: "html",
        }),
      );
      t.assert.snapshot(
        await format(overlayHtml, {
          parser: "html",
        }),
      );
    } finally {
      await browser.close();
      await server.stop();
    }
  });

  it("should show an error for initial compilation", async (t) => {
    const compiler = webpack(config);

    new ErrorPlugin().apply(compiler);

    const devServerOptions = {
      port,
    };
    const server = new Server(devServerOptions, compiler);

    await server.start();

    const { page, browser } = await runBrowser();

    try {
      await page.goto(`http://localhost:${port}/`, {
        waitUntil: "networkidle0",
      });

      // Delay for the overlay to appear
      await delay(1000);

      const pageHtml = await page.evaluate(() => document.body.outerHTML);
      const overlayHandle = await page.$("#webpack-dev-server-client-overlay");
      const overlayFrame = await overlayHandle.contentFrame();
      const overlayHtml = await overlayFrame.evaluate(
        () => document.body.outerHTML,
      );

      t.assert.snapshot(
        await format(pageHtml, {
          parser: "html",
        }),
      );
      t.assert.snapshot(
        await format(overlayHtml, {
          parser: "html",
        }),
      );
    } finally {
      await browser.close();
      await server.stop();
    }
  });

  it("should show a warning and error for initial compilation", async (t) => {
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

    const { page, browser } = await runBrowser();

    try {
      await page.goto(`http://localhost:${port}/`, {
        waitUntil: "networkidle0",
      });

      // Delay for the overlay to appear
      await delay(1000);

      const pageHtml = await page.evaluate(() => document.body.outerHTML);
      const overlayHandle = await page.$("#webpack-dev-server-client-overlay");
      const overlayFrame = await overlayHandle.contentFrame();
      const overlayHtml = await overlayFrame.evaluate(
        () => document.body.outerHTML,
      );

      t.assert.snapshot(
        await format(pageHtml, {
          parser: "html",
        }),
      );
      t.assert.snapshot(
        await format(overlayHtml, {
          parser: "html",
        }),
      );
    } finally {
      await browser.close();
      await server.stop();
    }
  });

  it("should show an ansi formatted error for initial compilation", async (t) => {
    const compiler = webpack(config);

    new ErrorPlugin(
      "[0m [90m 18 |[39m           [33mRender[39m [33mansi formatted text[39m[0m",
    ).apply(compiler);

    const devServerOptions = {
      port,
    };
    const server = new Server(devServerOptions, compiler);

    await server.start();

    const { page, browser } = await runBrowser();

    try {
      await page.goto(`http://localhost:${port}/`, {
        waitUntil: "networkidle0",
      });

      // Delay for the overlay to appear
      await delay(1000);

      const pageHtml = await page.evaluate(() => document.body.outerHTML);
      const overlayHandle = await page.$("#webpack-dev-server-client-overlay");
      const overlayFrame = await overlayHandle.contentFrame();
      const overlayHtml = await overlayFrame.evaluate(
        () => document.body.outerHTML,
      );

      t.assert.snapshot(
        await format(pageHtml, {
          parser: "html",
        }),
      );
      t.assert.snapshot(
        await format(overlayHtml, {
          parser: "html",
        }),
      );
    } finally {
      await browser.close();
      await server.stop();
    }
  });

  it("should show a warning and error for initial compilation and protects against xss", async (t) => {
    const compiler = webpack(config);

    new WarningPlugin("<strong>strong</strong>").apply(compiler);
    new ErrorPlugin("<strong>strong</strong>").apply(compiler);

    const devServerOptions = {
      port,
    };
    const server = new Server(devServerOptions, compiler);

    await server.start();

    const { page, browser } = await runBrowser();

    try {
      await page.goto(`http://localhost:${port}/`, {
        waitUntil: "networkidle0",
      });

      // Delay for the overlay to appear
      await delay(1000);

      const pageHtml = await page.evaluate(() => document.body.outerHTML);
      const overlayHandle = await page.$("#webpack-dev-server-client-overlay");
      const overlayFrame = await overlayHandle.contentFrame();
      const overlayHtml = await overlayFrame.evaluate(
        () => document.body.outerHTML,
      );

      t.assert.snapshot(
        await format(pageHtml, {
          parser: "html",
        }),
      );
      t.assert.snapshot(
        await format(overlayHtml, {
          parser: "html",
        }),
      );
    } finally {
      await browser.close();
      await server.stop();
    }
  });

  it("should not show initially, then show on an error, then hide on fix", async (t) => {
    const compiler = webpack(config);
    const devServerOptions = {
      port,
    };
    const server = new Server(devServerOptions, compiler);

    await server.start();

    const { page, browser } = await runBrowser();

    try {
      await page.goto(`http://localhost:${port}/`, {
        waitUntil: "networkidle0",
      });

      let pageHtml = await page.evaluate(() => document.body.outerHTML);
      let overlayHandle = await page.$("#webpack-dev-server-client-overlay");

      expect(overlayHandle).toBeNull();
      t.assert.snapshot(
        await format(pageHtml, {
          parser: "html",
        }),
      );

      fs.writeFileSync(pathToOverlayFixture, "`;");

      await page.waitForSelector("#webpack-dev-server-client-overlay");

      overlayHandle = await page.$("#webpack-dev-server-client-overlay");
      pageHtml = await page.evaluate(() => document.body.outerHTML);

      const overlayFrame = await overlayHandle.contentFrame();
      const overlayHtml = await overlayFrame.evaluate(
        () => document.body.outerHTML,
      );

      t.assert.snapshot(
        await format(pageHtml, {
          parser: "html",
        }),
      );
      t.assert.snapshot(
        await format(overlayHtml, {
          parser: "html",
        }),
      );

      // Marks this document so the wait below can tell it from the reloaded one.
      await page.evaluate(() => {
        globalThis.documentFromBeforeTheFix = true;
      });

      fs.writeFileSync(pathToOverlayFixture, overlayFixtureCode);

      // This fixture builds, so the client dismisses the overlay when `invalid`
      // announces the rebuild and then live reloads the page once that build
      // lands. Reading on the dismiss reads the document from before the fix
      // and races the reload that follows, which is what destroyed the
      // execution context mid-evaluate. Wait for the reloaded page instead.
      await waitForExpect(async () => {
        const reloaded = await page.evaluate(
          () => globalThis.documentFromBeforeTheFix === undefined,
        );

        expect(reloaded).toBe(true);

        overlayHandle = await page.$("#webpack-dev-server-client-overlay");

        expect(overlayHandle).toBeNull();

        pageHtml = await page.evaluate(() => document.body.outerHTML);
      }, 60000);

      t.assert.snapshot(
        await format(pageHtml, {
          parser: "html",
        }),
      );
    } finally {
      await browser.close();
      await server.stop();
    }
  });

  it("should not show initially, then show on an error, then show other error, then hide on fix", async (t) => {
    const compiler = webpack(config);
    const devServerOptions = {
      port,
    };
    const server = new Server(devServerOptions, compiler);

    await server.start();

    const { page, browser } = await runBrowser();

    try {
      await page.goto(`http://localhost:${port}/`, {
        waitUntil: "networkidle0",
      });

      let pageHtml = await page.evaluate(() => document.body.outerHTML);
      let overlayHandle = await page.$("#webpack-dev-server-client-overlay");

      expect(overlayHandle).toBeNull();
      t.assert.snapshot(
        await format(pageHtml, {
          parser: "html",
        }),
      );

      fs.writeFileSync(pathToOverlayFixture, "`;");

      await page.waitForSelector("#webpack-dev-server-client-overlay");

      overlayHandle = await page.$("#webpack-dev-server-client-overlay");
      pageHtml = await page.evaluate(() => document.body.outerHTML);

      let overlayFrame = await overlayHandle.contentFrame();
      let overlayHtml = await overlayFrame.evaluate(
        () => document.body.outerHTML,
      );

      t.assert.snapshot(
        await format(pageHtml, {
          parser: "html",
        }),
      );
      t.assert.snapshot(
        await format(overlayHtml, {
          parser: "html",
        }),
      );

      const firstErrorOverlayHtml = overlayHtml;

      fs.writeFileSync(pathToOverlayFixture, "`;a");

      // The `invalid` message announcing the rebuild dismisses the overlay and
      // the errors it produces show it again, so the hidden state in between
      // lasts only as long as that build and is not reliably observable —
      // waiting for it is a race this test loses as a two minute timeout. What
      // is under test is the second, different error reaching the overlay.
      await waitForExpect(async () => {
        overlayHandle = await page.$("#webpack-dev-server-client-overlay");

        expect(overlayHandle).not.toBeNull();

        overlayFrame = await overlayHandle.contentFrame();
        overlayHtml = await overlayFrame.evaluate(
          () => document.body.outerHTML,
        );

        expect(overlayHtml).not.toBe(firstErrorOverlayHtml);
      }, 60000);

      pageHtml = await page.evaluate(() => document.body.outerHTML);

      t.assert.snapshot(
        await format(pageHtml, {
          parser: "html",
        }),
      );
      t.assert.snapshot(
        await format(overlayHtml, {
          parser: "html",
        }),
      );

      // Marks this document so the wait below can tell it from the reloaded one.
      await page.evaluate(() => {
        globalThis.documentFromBeforeTheFix = true;
      });

      fs.writeFileSync(pathToOverlayFixture, overlayFixtureCode);

      // This fixture builds, so the client dismisses the overlay when `invalid`
      // announces the rebuild and then live reloads the page once that build
      // lands. Reading on the dismiss reads the document from before the fix
      // and races the reload that follows, which is what destroyed the
      // execution context mid-evaluate. Wait for the reloaded page instead.
      await waitForExpect(async () => {
        const reloaded = await page.evaluate(
          () => globalThis.documentFromBeforeTheFix === undefined,
        );

        expect(reloaded).toBe(true);

        overlayHandle = await page.$("#webpack-dev-server-client-overlay");

        expect(overlayHandle).toBeNull();

        pageHtml = await page.evaluate(() => document.body.outerHTML);
      }, 60000);

      t.assert.snapshot(
        await format(pageHtml, {
          parser: "html",
        }),
      );
    } finally {
      await browser.close();
      await server.stop();
    }
  });

  it("should not show initially, then show on an error and allow to close", async (t) => {
    const compiler = webpack(config);
    const devServerOptions = {
      port,
    };
    const server = new Server(devServerOptions, compiler);

    await server.start();

    const { page, browser } = await runBrowser();

    try {
      await page.goto(`http://localhost:${port}/`, {
        waitUntil: "networkidle0",
      });

      let pageHtml = await page.evaluate(() => document.body.outerHTML);
      let overlayHandle = await page.$("#webpack-dev-server-client-overlay");

      expect(overlayHandle).toBeNull();
      t.assert.snapshot(
        await format(pageHtml, {
          parser: "html",
        }),
      );

      fs.writeFileSync(pathToOverlayFixture, "`;");

      await page.waitForSelector("#webpack-dev-server-client-overlay");

      overlayHandle = await page.$("#webpack-dev-server-client-overlay");
      pageHtml = await page.evaluate(() => document.body.outerHTML);

      const overlayFrame = await overlayHandle.contentFrame();
      const overlayHtml = await overlayFrame.evaluate(
        () => document.body.outerHTML,
      );

      t.assert.snapshot(
        await format(pageHtml, {
          parser: "html",
        }),
      );
      t.assert.snapshot(
        await format(overlayHtml, {
          parser: "html",
        }),
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

      expect(overlayHandle).toBeNull();
      t.assert.snapshot(
        await format(pageHtml, {
          parser: "html",
        }),
      );

      fs.writeFileSync(pathToOverlayFixture, overlayFixtureCode);
    } finally {
      await browser.close();
      await server.stop();
    }
  });

  it("should open editor when error with file info is clicked", async () => {
    const mockLaunchEditorCb = fn();
    const launchEditorMock = mock.module("launch-editor", {
      defaultExport: mockLaunchEditorCb,
    });

    const compiler = webpack(config);
    const devServerOptions = {
      port,
    };
    const server = new Server(devServerOptions, compiler);

    await server.start();

    const { page, browser } = await runBrowser();

    try {
      await page.goto(`http://localhost:${port}/`, {
        waitUntil: "networkidle0",
      });

      fs.writeFileSync(pathToOverlayFixture, "`;");

      await page.waitForSelector("#webpack-dev-server-client-overlay");

      const frame = page
        .frames()
        .find((item) => item.name() === "webpack-dev-server-client-overlay");

      const errorHandle = await frame.$("[data-can-open]");

      await errorHandle.click();

      await waitForExpect(() => {
        expect(mockLaunchEditorCb).toHaveBeenCalledTimes(1);
      });

      fs.writeFileSync(pathToOverlayFixture, overlayFixtureCode);
    } finally {
      await browser.close();
      await server.stop();
      launchEditorMock.restore();
    }
  });

  it('should not show a warning when "client.overlay" is "false"', async (t) => {
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

    const { page, browser } = await runBrowser();

    try {
      await page.goto(`http://localhost:${port}/`, {
        waitUntil: "networkidle0",
      });

      // Delay for the overlay to appear
      await delay(1000);

      const pageHtml = await page.evaluate(() => document.body.outerHTML);
      const overlayHandle = await page.$("#webpack-dev-server-client-overlay");

      expect(overlayHandle).toBeNull();
      t.assert.snapshot(
        await format(pageHtml, {
          parser: "html",
        }),
      );
    } finally {
      await browser.close();
      await server.stop();
    }
  });

  it('should not show a warning when "client.overlay.warnings" is "false"', async (t) => {
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

    const { page, browser } = await runBrowser();

    try {
      await page.goto(`http://localhost:${port}/`, {
        waitUntil: "networkidle0",
      });

      // Delay for the overlay to appear
      await delay(1000);

      const pageHtml = await page.evaluate(() => document.body.outerHTML);
      const overlayHandle = await page.$("#webpack-dev-server-client-overlay");

      expect(overlayHandle).toBeNull();
      t.assert.snapshot(
        await format(pageHtml, {
          parser: "html",
        }),
      );
    } finally {
      await browser.close();
      await server.stop();
    }
  });

  it("should not show warning when it is filtered", async () => {
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

    const { page, browser } = await runBrowser();

    try {
      await page.goto(`http://localhost:${port}/`, {
        waitUntil: "networkidle0",
      });

      // Delay for the overlay to appear
      await delay(1000);

      const overlayHandle = await page.$("#webpack-dev-server-client-overlay");

      expect(overlayHandle).toBeNull();
    } finally {
      await browser.close();
      await server.stop();
    }
  });

  it("should show warning when it is not filtered", async (t) => {
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

    const { page, browser } = await runBrowser();

    try {
      await page.goto(`http://localhost:${port}/`, {
        waitUntil: "networkidle0",
      });

      // Delay for the overlay to appear
      await delay(1000);

      const pageHtml = await page.evaluate(() => document.body.outerHTML);
      const overlayHandle = await page.$("#webpack-dev-server-client-overlay");
      const overlayFrame = await overlayHandle.contentFrame();
      const overlayHtml = await overlayFrame.evaluate(
        () => document.body.outerHTML,
      );

      t.assert.snapshot(
        await format(pageHtml, {
          parser: "html",
        }),
      );
      t.assert.snapshot(
        await format(overlayHtml, {
          parser: "html",
        }),
      );
    } finally {
      await browser.close();
      await server.stop();
    }
  });

  it('should show a warning when "client.overlay" is "true"', async (t) => {
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

    const { page, browser } = await runBrowser();

    try {
      await page.goto(`http://localhost:${port}/`, {
        waitUntil: "networkidle0",
      });

      // Delay for the overlay to appear
      await delay(1000);

      const pageHtml = await page.evaluate(() => document.body.outerHTML);
      const overlayHandle = await page.$("#webpack-dev-server-client-overlay");
      const overlayFrame = await overlayHandle.contentFrame();
      const overlayHtml = await overlayFrame.evaluate(
        () => document.body.outerHTML,
      );

      t.assert.snapshot(
        await format(pageHtml, {
          parser: "html",
        }),
      );
      t.assert.snapshot(
        await format(overlayHtml, {
          parser: "html",
        }),
      );
    } finally {
      await browser.close();
      await server.stop();
    }
  });

  it('should show a warning when "client.overlay.warnings" is "true"', async (t) => {
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

    const { page, browser } = await runBrowser();

    try {
      await page.goto(`http://localhost:${port}/`, {
        waitUntil: "networkidle0",
      });

      // Delay for the overlay to appear
      await delay(1000);

      const pageHtml = await page.evaluate(() => document.body.outerHTML);
      const overlayHandle = await page.$("#webpack-dev-server-client-overlay");
      const overlayFrame = await overlayHandle.contentFrame();
      const overlayHtml = await overlayFrame.evaluate(
        () => document.body.outerHTML,
      );

      t.assert.snapshot(
        await format(pageHtml, {
          parser: "html",
        }),
      );
      t.assert.snapshot(
        await format(overlayHtml, {
          parser: "html",
        }),
      );
    } finally {
      await browser.close();
      await server.stop();
    }
  });

  it('should show a warning when "client.overlay.errors" is "true"', async (t) => {
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

    const { page, browser } = await runBrowser();

    try {
      await page.goto(`http://localhost:${port}/`, {
        waitUntil: "networkidle0",
      });

      // Delay for the overlay to appear
      await delay(1000);

      const pageHtml = await page.evaluate(() => document.body.outerHTML);
      const overlayHandle = await page.$("#webpack-dev-server-client-overlay");
      const overlayFrame = await overlayHandle.contentFrame();
      const overlayHtml = await overlayFrame.evaluate(
        () => document.body.outerHTML,
      );

      t.assert.snapshot(
        await format(pageHtml, {
          parser: "html",
        }),
      );
      t.assert.snapshot(
        await format(overlayHtml, {
          parser: "html",
        }),
      );
    } finally {
      await browser.close();
      await server.stop();
    }
  });

  it('should not show an error when "client.overlay" is "false"', async (t) => {
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

    const { page, browser } = await runBrowser();

    try {
      await page.goto(`http://localhost:${port}/`, {
        waitUntil: "networkidle0",
      });

      // Delay for the overlay to appear
      await delay(1000);

      const pageHtml = await page.evaluate(() => document.body.outerHTML);
      const overlayHandle = await page.$("#webpack-dev-server-client-overlay");

      expect(overlayHandle).toBeNull();
      t.assert.snapshot(
        await format(pageHtml, {
          parser: "html",
        }),
      );
    } finally {
      await browser.close();
      await server.stop();
    }
  });

  it('should not show an error when "client.overlay.errors" is "false"', async (t) => {
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

    const { page, browser } = await runBrowser();

    try {
      await page.goto(`http://localhost:${port}/`, {
        waitUntil: "networkidle0",
      });

      // Delay for the overlay to appear
      await delay(1000);

      const pageHtml = await page.evaluate(() => document.body.outerHTML);
      const overlayHandle = await page.$("#webpack-dev-server-client-overlay");

      expect(overlayHandle).toBeNull();
      t.assert.snapshot(
        await format(pageHtml, {
          parser: "html",
        }),
      );
    } finally {
      await browser.close();
      await server.stop();
    }
  });

  it("should not show error when it is filtered", async () => {
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

    const { page, browser } = await runBrowser();

    try {
      await page.goto(`http://localhost:${port}/`, {
        waitUntil: "networkidle0",
      });

      // Delay for the overlay to appear
      await delay(1000);

      const overlayHandle = await page.$("#webpack-dev-server-client-overlay");

      expect(overlayHandle).toBeNull();
    } finally {
      await browser.close();
      await server.stop();
    }
  });

  it("should show error when it is not filtered", async (t) => {
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

    const { page, browser } = await runBrowser();

    try {
      await page.goto(`http://localhost:${port}/`, {
        waitUntil: "networkidle0",
      });

      // Delay for the overlay to appear
      await delay(1000);

      const pageHtml = await page.evaluate(() => document.body.outerHTML);
      const overlayHandle = await page.$("#webpack-dev-server-client-overlay");
      const overlayFrame = await overlayHandle.contentFrame();
      const overlayHtml = await overlayFrame.evaluate(
        () => document.body.outerHTML,
      );

      t.assert.snapshot(
        await format(pageHtml, {
          parser: "html",
        }),
      );
      t.assert.snapshot(
        await format(overlayHtml, {
          parser: "html",
        }),
      );
    } finally {
      await browser.close();
      await server.stop();
    }
  });

  it('should show an error when "client.overlay" is "true"', async (t) => {
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

    const { page, browser } = await runBrowser();

    try {
      await page.goto(`http://localhost:${port}/`, {
        waitUntil: "networkidle0",
      });

      // Delay for the overlay to appear
      await delay(1000);

      const pageHtml = await page.evaluate(() => document.body.outerHTML);
      const overlayHandle = await page.$("#webpack-dev-server-client-overlay");
      const overlayFrame = await overlayHandle.contentFrame();
      const overlayHtml = await overlayFrame.evaluate(
        () => document.body.outerHTML,
      );

      t.assert.snapshot(
        await format(pageHtml, {
          parser: "html",
        }),
      );
      t.assert.snapshot(
        await format(overlayHtml, {
          parser: "html",
        }),
      );
    } finally {
      await browser.close();
      await server.stop();
    }
  });

  it("should show overlay when Trusted Types are enabled", async (t) => {
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

    const { page, browser } = await runBrowser();

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

      const pageHtml = await page.evaluate(() => document.body.outerHTML);
      const overlayHandle = await page.$("#webpack-dev-server-client-overlay");
      const overlayFrame = await overlayHandle.contentFrame();
      const overlayHtml = await overlayFrame.evaluate(
        () => document.body.outerHTML,
      );

      expect(
        consoleMessages.filter((item) =>
          /requires 'TrustedHTML' assignment/.test(item),
        ),
      ).toHaveLength(0);
      t.assert.snapshot(
        await format(pageHtml, {
          parser: "html",
        }),
      );
      t.assert.snapshot(
        await format(overlayHtml, {
          parser: "html",
        }),
      );
    } finally {
      await browser.close();
      await server.stop();
    }
  });

  it("should show overlay when Trusted Types are enabled and the \"require-trusted-types-for 'script'\" header was used", async (t) => {
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

    const { page, browser } = await runBrowser();

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

      const pageHtml = await page.evaluate(() => document.body.outerHTML);
      const overlayHandle = await page.$("#webpack-dev-server-client-overlay");
      const overlayFrame = await overlayHandle.contentFrame();
      const overlayHtml = await overlayFrame.evaluate(
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
      t.assert.snapshot(
        await format(pageHtml, {
          parser: "html",
        }),
      );
      t.assert.snapshot(
        await format(overlayHtml, {
          parser: "html",
        }),
      );
    } finally {
      await browser.close();
      await server.stop();
    }
  });

  it("should not show overlay when Trusted Types are enabled, but policy is not allowed", async (t) => {
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

    const { page, browser } = await runBrowser();

    try {
      await page.goto(`http://localhost:${port}/`, {
        waitUntil: "networkidle0",
      });

      // Delay for the overlay to appear
      await delay(1000);

      const pageHtml = await page.evaluate(() => document.body.outerHTML);
      const overlayHandle = await page.$("#webpack-dev-server-client-overlay");
      expect(overlayHandle).toBeNull();
      t.assert.snapshot(
        await format(pageHtml, {
          parser: "html",
        }),
      );
    } finally {
      await browser.close();
      await server.stop();
    }
  });

  it('should show an error when "client.overlay.errors" is "true"', async (t) => {
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

    const { page, browser } = await runBrowser();

    try {
      await page.goto(`http://localhost:${port}/`, {
        waitUntil: "networkidle0",
      });

      // Delay for the overlay to appear
      await delay(1000);

      const pageHtml = await page.evaluate(() => document.body.outerHTML);
      const overlayHandle = await page.$("#webpack-dev-server-client-overlay");
      const overlayFrame = await overlayHandle.contentFrame();
      const overlayHtml = await overlayFrame.evaluate(
        () => document.body.outerHTML,
      );

      t.assert.snapshot(
        await format(pageHtml, {
          parser: "html",
        }),
      );
      t.assert.snapshot(
        await format(overlayHtml, {
          parser: "html",
        }),
      );
    } finally {
      await browser.close();
      await server.stop();
    }
  });

  it('should show an error when "client.overlay.warnings" is "true"', async (t) => {
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

    const { page, browser } = await runBrowser();

    try {
      await page.goto(`http://localhost:${port}/`, {
        waitUntil: "networkidle0",
      });

      // Delay for the overlay to appear
      await delay(1000);

      const pageHtml = await page.evaluate(() => document.body.outerHTML);
      const overlayHandle = await page.$("#webpack-dev-server-client-overlay");
      const overlayFrame = await overlayHandle.contentFrame();
      const overlayHtml = await overlayFrame.evaluate(
        () => document.body.outerHTML,
      );

      t.assert.snapshot(
        await format(pageHtml, {
          parser: "html",
        }),
      );
      t.assert.snapshot(
        await format(overlayHtml, {
          parser: "html",
        }),
      );
    } finally {
      await browser.close();
      await server.stop();
    }
  });

  it("should show a warning and hide them after closing connection", async (t) => {
    const compiler = webpack(config);

    new WarningPlugin().apply(compiler);

    const devServerOptions = { port };
    const server = new Server(devServerOptions, compiler);

    await server.start();

    const { page, browser } = await runBrowser();

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

      const pageHtml = await page.evaluate(() => document.body.outerHTML);
      const overlayHandle = await page.$("#webpack-dev-server-client-overlay");
      const overlayFrame = await overlayHandle.contentFrame();
      const overlayHtml = await overlayFrame.evaluate(
        () => document.body.outerHTML,
      );

      t.assert.snapshot(
        await format(pageHtml, {
          parser: "html",
        }),
      );
      t.assert.snapshot(
        await format(overlayHtml, {
          parser: "html",
        }),
      );

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

      t.assert.snapshot(
        await format(pageHtmlAfterClose, {
          parser: "html",
        }),
      );
    } finally {
      await browser.close();
      await server.stop();
    }
  });

  it("should show an error after invalidation", async (t) => {
    const compiler = webpack(config);

    new ErrorPlugin("Error from compilation", 1).apply(compiler);

    const devServerOptions = {
      port,
    };
    const server = new Server(devServerOptions, compiler);

    await server.start();

    const { page, browser } = await runBrowser();

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

      const pageHtml = await page.evaluate(() => document.body.outerHTML);
      const overlayHandle = await page.$("#webpack-dev-server-client-overlay");
      const overlayFrame = await overlayHandle.contentFrame();
      const overlayHtml = await overlayFrame.evaluate(
        () => document.body.outerHTML,
      );

      t.assert.snapshot(
        await format(pageHtml, {
          parser: "html",
        }),
      );
      t.assert.snapshot(
        await format(overlayHtml, {
          parser: "html",
        }),
      );
    } finally {
      await browser.close();
      await server.stop();
    }
  });

  it("should show a warning after invalidation", async (t) => {
    const compiler = webpack(config);

    new WarningPlugin("Warning from compilation", 1).apply(compiler);

    const devServerOptions = {
      port,
    };
    const server = new Server(devServerOptions, compiler);

    await server.start();

    const { page, browser } = await runBrowser();

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

      const pageHtml = await page.evaluate(() => document.body.outerHTML);
      const overlayHandle = await page.$("#webpack-dev-server-client-overlay");
      const overlayFrame = await overlayHandle.contentFrame();
      const overlayHtml = await overlayFrame.evaluate(
        () => document.body.outerHTML,
      );

      t.assert.snapshot(
        await format(pageHtml, {
          parser: "html",
        }),
      );
      t.assert.snapshot(
        await format(overlayHtml, {
          parser: "html",
        }),
      );
    } finally {
      await browser.close();
      await server.stop();
    }
  });

  it("should show error for uncaught runtime error", async (t) => {
    const compiler = webpack(config);

    const server = new Server(
      {
        port,
      },
      compiler,
    );

    await server.start();

    const { page, browser } = await runBrowser();

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
        () => document.body.outerHTML,
      );

      t.assert.snapshot(
        await format(overlayHtml, {
          parser: "html",
        }),
      );
    } finally {
      await browser.close();
      await server.stop();
    }
  });

  it("should keep the overlay for a runtime error thrown during the initial load", async () => {
    const compiler = webpack({
      ...config,
      entry: "./throw-on-initial-load.js",
    });

    const server = new Server(
      {
        port,
      },
      compiler,
    );

    await server.start();

    const { page, browser } = await runBrowser();

    try {
      await page.goto(`http://localhost:${port}/`, {
        waitUntil: "networkidle0",
      });

      // The entry throws while the page is still loading, so the overlay is up
      // before the socket handshake reports the (successful) compilation. That
      // `ok` used to dismiss it milliseconds later — see #5024.
      await waitForExpect(async () => {
        const overlayHandle = await page.$(
          "#webpack-dev-server-client-overlay",
        );

        expect(overlayHandle).not.toBeNull();

        const overlayFrame = await overlayHandle.contentFrame();
        const overlayText = await overlayFrame.evaluate(
          () => document.body.textContent,
        );

        expect(overlayText).toContain("Injected error");
      });
    } finally {
      await browser.close();
      await server.stop();
    }
  });

  it("should not show filtered runtime error", async () => {
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

    const { page, browser } = await runBrowser();

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

      expect(overlayHandle).toBeNull();
    } finally {
      await browser.close();
      await server.stop();
    }
  });

  it("should show error for uncaught promise rejection", async (t) => {
    const compiler = webpack(config);

    const server = new Server(
      {
        port,
      },
      compiler,
    );

    await server.start();

    const { page, browser } = await runBrowser();

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
        () => document.body.outerHTML,
      );

      t.assert.snapshot(
        await format(overlayHtml, {
          parser: "html",
        }),
      );
    } finally {
      await browser.close();
      await server.stop();
    }
  });

  it("should not show filtered promise rejection", async () => {
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

    const { page, browser } = await runBrowser();

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

      expect(overlayHandle).toBeNull();
    } finally {
      await browser.close();
      await server.stop();
    }
  });

  it("should not show filtered promise rejection with specific error cause", async () => {
    const compiler = webpack(config);

    const server = new Server(
      {
        port,
        client: {
          overlay: {
            runtimeErrors: (error) =>
              !/Injected/.test(error.cause.error.message),
          },
        },
      },
      compiler,
    );

    await server.start();

    const { page, browser } = await runBrowser();

    try {
      await page.goto(`http://localhost:${port}/`, {
        waitUntil: "networkidle0",
      });

      await page.addScriptTag({
        content: `(function throwError() {
        setTimeout(function () {
          Promise.reject({ error: new Error('Injected async error') });
        }, 0);
      })();`,
      });

      // Delay for the overlay to appear
      await delay(1000);

      const overlayHandle = await page.$("#webpack-dev-server-client-overlay");

      expect(overlayHandle).toBeNull();
    } finally {
      await browser.close();
      await server.stop();
    }
  });

  it('should show overlay when "Content-Security-Policy" is "default-src \'self\'" was used', async (t) => {
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

    const { page, browser } = await runBrowser();

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

      const pageHtml = await page.evaluate(() => document.body.outerHTML);
      const overlayHandle = await page.$("#webpack-dev-server-client-overlay");
      const overlayFrame = await overlayHandle.contentFrame();
      const overlayHtml = await overlayFrame.evaluate(
        () => document.body.outerHTML,
      );

      t.assert.snapshot(
        await format(pageHtml, {
          parser: "html",
        }),
      );
      t.assert.snapshot(
        await format(
          overlayHtml.replace(
            /<button ([^>]+)>.+<\/button>/m,
            "<button $1>X</button>",
          ),
          {
            parser: "html",
          },
        ),
      );
    } finally {
      await browser.close();
      await server.stop();
    }
  });

  it("should allow dismissing with Escape more than once", async () => {
    const compiler = webpack(config);
    const server = new Server({ port }, compiler);

    await server.start();

    const { page, browser } = await runBrowser();

    try {
      await page.goto(`http://localhost:${port}/`, {
        waitUntil: "networkidle0",
      });

      fs.writeFileSync(pathToOverlayFixture, "`;");
      await page.waitForSelector("#webpack-dev-server-client-overlay");

      await page.keyboard.press("Escape");
      await page.waitForSelector("#webpack-dev-server-client-overlay", {
        hidden: true,
      });

      fs.writeFileSync(pathToOverlayFixture, overlayFixtureCode);
      await delay(1000);
      fs.writeFileSync(pathToOverlayFixture, "`;");
      await page.waitForSelector("#webpack-dev-server-client-overlay");

      // Dismissing used to remove the key handler for good, so the second
      // overlay of a session could not be closed with the keyboard at all.
      await page.keyboard.press("Escape");
      await page.waitForSelector("#webpack-dev-server-client-overlay", {
        hidden: true,
      });

      expect(await page.$("#webpack-dev-server-client-overlay")).toBeNull();

      fs.writeFileSync(pathToOverlayFixture, overlayFixtureCode);
    } finally {
      await browser.close();
      await server.stop();
    }
  });

  it("should reopen when a Trusted Types policy name is enforced", async () => {
    const compiler = webpack(trustedTypesConfig);
    const server = new Server(
      {
        port,
        headers: [
          {
            key: "Content-Security-Policy",
            // Without `allow-duplicates`, asking for a policy name twice is a
            // TypeError, so the overlay must keep the one it already made.
            value: "trusted-types webpack webpack#dev-overlay",
          },
        ],
        client: {
          overlay: { trustedTypesPolicyName: "webpack#dev-overlay" },
        },
      },
      compiler,
    );

    await server.start();

    const { page, browser } = await runBrowser();

    try {
      const pageErrors = [];

      page.on("pageerror", (error) => {
        pageErrors.push(error);
      });

      await page.goto(`http://localhost:${port}/`, {
        waitUntil: "networkidle0",
      });

      fs.writeFileSync(pathToOverlayFixture, "`;");
      await page.waitForSelector("#webpack-dev-server-client-overlay");

      await page.keyboard.press("Escape");
      await page.waitForSelector("#webpack-dev-server-client-overlay", {
        hidden: true,
      });

      fs.writeFileSync(pathToOverlayFixture, overlayFixtureCode);
      await delay(1000);
      fs.writeFileSync(pathToOverlayFixture, "`;");

      await page.waitForSelector("#webpack-dev-server-client-overlay");

      const overlayHandle = await page.$("#webpack-dev-server-client-overlay");
      const overlayFrame = await overlayHandle.contentFrame();

      expect(
        await overlayFrame.evaluate(() => document.body.textContent),
      ).toContain("Compiled with problems");
      expect(
        pageErrors.filter((error) =>
          /trusted type policy/i.test(error.message),
        ),
      ).toHaveLength(0);

      fs.writeFileSync(pathToOverlayFixture, overlayFixtureCode);
    } finally {
      await browser.close();
      await server.stop();
    }
  });

  it("should render only the overlay messages a filter accepts", async () => {
    const compiler = webpack(config);

    new WarningPlugin("Shown warning").apply(compiler);
    new WarningPlugin("Hidden warning").apply(compiler);

    const server = new Server(
      {
        port,
        client: {
          overlay: {
            warnings: (error) => {
              const message = typeof error === "string" ? error : error.message;
              return message !== "Hidden warning";
            },
          },
        },
      },
      compiler,
    );

    await server.start();

    const { page, browser } = await runBrowser();

    try {
      await page.goto(`http://localhost:${port}/`, {
        waitUntil: "networkidle0",
      });

      await page.waitForSelector("#webpack-dev-server-client-overlay");

      const overlayHandle = await page.$("#webpack-dev-server-client-overlay");
      const overlayFrame = await overlayHandle.contentFrame();
      const overlayText = await overlayFrame.evaluate(
        () => document.body.textContent,
      );

      expect(overlayText).toContain("Shown warning");
      // The filter used to decide only whether to open the overlay; every
      // message was then rendered, filtered out or not.
      expect(overlayText).not.toContain("Hidden warning");
    } finally {
      await browser.close();
      await server.stop();
    }
  });
});
