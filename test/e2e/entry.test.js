"use strict";

const path = require("path");
const webpack = require("webpack");
const { test } = require("../helpers/playwright-test");
const { expect } = require("../helpers/playwright-custom-expects");
const Server = require("../../lib/Server");
const config = require("../fixtures/client-config/webpack.config");
const port = require("../ports-map").entry;

const HOT_ENABLED_MESSAGE =
  "[webpack-dev-server] Server started: Hot Module Replacement enabled, Live Reloading enabled, Progress disabled, Overlay enabled.";

const waitForConsoleLogFinished = async (consoleLogs) => {
  await new Promise((resolve) => {
    const interval = setInterval(() => {
      if (consoleLogs.includes(HOT_ENABLED_MESSAGE)) {
        clearInterval(interval);

        resolve();
      }
    }, 100);
  });
};

test.describe("entry", () => {
  const entryFirst = path.resolve(
    __dirname,
    "../fixtures/client-config/foo.js",
  );
  const entrySecond = path.resolve(
    __dirname,
    "../fixtures/client-config/bar.js",
  );

  test("should work with single entry", async ({ page }) => {
    const compiler = webpack({ ...config, entry: entryFirst });
    const devServerOptions = {
      port,
    };
    const server = new Server(devServerOptions, compiler);

    await server.start();

    try {
      const pageErrors = [];
      const consoleMessages = [];

      page
        .on("console", (message) => {
          consoleMessages.push(message);
        })
        .on("pageerror", (error) => {
          pageErrors.push(error);
        });

      await page.goto(`http://127.0.0.1:${port}/`, {
        waitUntil: "networkidle0",
      });

      expect(
        consoleMessages.map((message) => message.text()),
      ).toMatchSnapshotWithArray("console messages");
      expect(pageErrors).toMatchSnapshotWithArray("page errors");
    } catch (error) {
      throw error;
    } finally {
      await server.stop();
    }
  });

  test("should work with single array entry", async ({ page }) => {
    const compiler = webpack({ ...config, entry: [entryFirst, entrySecond] });
    const devServerOptions = {
      port,
    };
    const server = new Server(devServerOptions, compiler);

    await server.start();

    try {
      const pageErrors = [];
      const consoleMessages = [];

      page
        .on("console", (message) => {
          consoleMessages.push(message);
        })
        .on("pageerror", (error) => {
          pageErrors.push(error);
        });

      await page.goto(`http://127.0.0.1:${port}/`, {
        waitUntil: "networkidle0",
      });

      expect(
        consoleMessages.map((message) => message.text()),
      ).toMatchSnapshotWithArray("console messages");
      expect(pageErrors).toMatchSnapshotWithArray("page errors");
    } catch (error) {
      throw error;
    } finally {
      await server.stop();
    }
  });

  test("should work with object entry", async ({ page }) => {
    const compiler = webpack({
      ...config,
      entry: {
        main: { import: entryFirst },
      },
    });
    const devServerOptions = {
      port,
    };
    const server = new Server(devServerOptions, compiler);

    await server.start();

    try {
      const pageErrors = [];
      const consoleMessages = [];

      page
        .on("console", (message) => {
          consoleMessages.push(message);
        })
        .on("pageerror", (error) => {
          pageErrors.push(error);
        });

      await page.goto(`http://127.0.0.1:${port}/`, {
        waitUntil: "networkidle0",
      });

      expect(
        consoleMessages.map((message) => message.text()),
      ).toMatchSnapshotWithArray("console messages");
      expect(pageErrors).toMatchSnapshotWithArray("page errors");
    } catch (error) {
      throw error;
    } finally {
      await server.stop();
    }
  });

  test("should work with dynamic entry", async ({ page }) => {
    const compiler = webpack({ ...config, entry: () => entryFirst });
    const devServerOptions = {
      port,
    };
    const server = new Server(devServerOptions, compiler);

    await server.start();

    try {
      const pageErrors = [];
      const consoleMessages = [];

      page
        .on("console", (message) => {
          consoleMessages.push(message);
        })
        .on("pageerror", (error) => {
          pageErrors.push(error);
        });

      await page.goto(`http://127.0.0.1:${port}/`, {
        waitUntil: "networkidle0",
      });

      expect(
        consoleMessages.map((message) => message.text()),
      ).toMatchSnapshotWithArray("console messages");
      expect(pageErrors).toMatchSnapshotWithArray("page errors");
    } catch (error) {
      throw error;
    } finally {
      await server.stop();
    }
  });

  test("should work with dynamic async entry", async ({ page }) => {
    const compiler = webpack({
      ...config,
      entry: () => new Promise((resolve) => resolve([entryFirst])),
    });
    const devServerOptions = {
      port,
    };
    const server = new Server(devServerOptions, compiler);

    await server.start();

    try {
      const pageErrors = [];
      const consoleMessages = [];

      page
        .on("console", (message) => {
          consoleMessages.push(message);
        })
        .on("pageerror", (error) => {
          pageErrors.push(error);
        });

      await page.goto(`http://127.0.0.1:${port}/`, {
        waitUntil: "networkidle0",
      });

      expect(
        consoleMessages.map((message) => message.text()),
      ).toMatchSnapshotWithArray("console messages");
      expect(pageErrors).toMatchSnapshotWithArray("page errors");
    } catch (error) {
      throw error;
    } finally {
      await server.stop();
    }
  });

  test("should work with multiple entries", async ({ page }) => {
    const compiler = webpack({
      ...config,
      entry: {
        foo: entryFirst,
        bar: entrySecond,
      },
      optimization: {
        runtimeChunk: {
          name: "runtime",
        },
      },
    });
    const devServerOptions = {
      port,
    };
    const server = new Server(devServerOptions, compiler);

    await server.start();

    try {
      const pageErrors = [];
      const consoleMessages = [];

      page
        .on("console", (message) => {
          consoleMessages.push(message.text());
        })
        .on("pageerror", (error) => {
          pageErrors.push(error);
        });

      await page.goto(`http://127.0.0.1:${port}/test.html`, {
        waitUntil: "networkidle0",
      });
      await page.addScriptTag({ url: `http://127.0.0.1:${port}/runtime.js` });
      await page.addScriptTag({ url: `http://127.0.0.1:${port}/foo.js` });
      await waitForConsoleLogFinished(consoleMessages);

      expect(consoleMessages).toMatchSnapshotWithArray("console messages");
      expect(pageErrors).toMatchSnapshotWithArray("page errors");
    } catch (error) {
      throw error;
    } finally {
      await server.stop();
    }
  });

  test("should work with multiple entries #2", async ({ page }) => {
    const compiler = webpack({
      ...config,
      entry: {
        foo: entryFirst,
        bar: entrySecond,
      },
      optimization: {
        runtimeChunk: {
          name: "runtime",
        },
      },
    });
    const devServerOptions = {
      port,
    };
    const server = new Server(devServerOptions, compiler);

    await server.start();

    try {
      const pageErrors = [];
      const consoleMessages = [];

      page
        .on("console", (message) => {
          consoleMessages.push(message.text());
        })
        .on("pageerror", (error) => {
          pageErrors.push(error);
        });

      await page.goto(`http://127.0.0.1:${port}/test.html`, {
        waitUntil: "networkidle0",
      });
      await page.addScriptTag({ url: `http://127.0.0.1:${port}/runtime.js` });
      await page.addScriptTag({ url: `http://127.0.0.1:${port}/bar.js` });
      await waitForConsoleLogFinished(consoleMessages);

      expect(consoleMessages).toMatchSnapshotWithArray("console messages");
      expect(pageErrors).toMatchSnapshotWithArray("page errors");
    } catch (error) {
      throw error;
    } finally {
      await server.stop();
    }
  });

  test('should work with multiple entries and "dependOn"', async ({ page }) => {
    const compiler = webpack({
      ...config,
      entry: {
        foo: {
          import: entryFirst,
          dependOn: "bar",
        },
        bar: entrySecond,
      },
    });
    const devServerOptions = {
      port,
    };
    const server = new Server(devServerOptions, compiler);

    await server.start();

    try {
      const pageErrors = [];
      const consoleMessages = [];

      page
        .on("console", (message) => {
          consoleMessages.push(message.text());
        })
        .on("pageerror", (error) => {
          pageErrors.push(error);
        });

      await page.goto(`http://127.0.0.1:${port}/test.html`, {
        waitUntil: "networkidle0",
      });
      await page.addScriptTag({ url: `http://127.0.0.1:${port}/bar.js` });
      await page.addScriptTag({ url: `http://127.0.0.1:${port}/foo.js` });
      await waitForConsoleLogFinished(consoleMessages);

      expect(consoleMessages).toMatchSnapshotWithArray("console messages");
      expect(pageErrors).toMatchSnapshotWithArray("page errors");
    } catch (error) {
      throw error;
    } finally {
      await server.stop();
    }
  });

  test("should work with empty", async ({ page }) => {
    const compiler = webpack({
      ...config,
      entry: {},
    });

    new webpack.EntryPlugin(compiler.context, entryFirst, {
      name: "main",
    }).apply(compiler);

    const devServerOptions = {
      port,
    };
    const server = new Server(devServerOptions, compiler);

    await server.start();

    try {
      const pageErrors = [];
      const consoleMessages = [];

      page
        .on("console", (message) => {
          consoleMessages.push(message);
        })
        .on("pageerror", (error) => {
          pageErrors.push(error);
        });

      await page.goto(`http://127.0.0.1:${port}/`, {
        waitUntil: "networkidle0",
      });

      expect(
        consoleMessages.map((message) => message.text()),
      ).toMatchSnapshotWithArray("console messages");
      expect(pageErrors).toMatchSnapshotWithArray("page errors");
    } catch (error) {
      throw error;
    } finally {
      await server.stop();
    }
  });
});
