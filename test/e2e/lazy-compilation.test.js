"use strict";

const webpack = require("webpack");
const { describe, test } = require("@playwright/test");
const { expect } = require("../helpers/playwright-custom-expects");
const Server = require("../../lib/Server");
const lazyCompilationSingleEntryConfig = require("../fixtures/lazy-compilation-single-entry/webpack.config");
const lazyCompilationMultipleEntriesConfig = require("../fixtures/lazy-compilation-multiple-entries/webpack.config");
const port = require("../ports-map")["lazy-compilation"];

describe("lazy compilation", () => {
  test(`should work with single entry`, async ({ page }) => {
    const compiler = webpack(lazyCompilationSingleEntryConfig);
    const server = new Server({ port }, compiler);

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
        waitUntil: "domcontentloaded",
      });
      await new Promise((resolve) => {
        const interval = setInterval(() => {
          if (consoleMessages.includes("Hey.")) {
            clearInterval(interval);

            resolve();
          }
        }, 100);
      });

      expect(consoleMessages).toMatchSnapshotWithArray("console messages");
      expect(pageErrors).toMatchSnapshotWithArray("page errors");
    } catch (error) {
      throw error;
    } finally {
      await server.stop();
    }
  });

  test(`should work with multiple entries`, async ({ page }) => {
    const compiler = webpack(lazyCompilationMultipleEntriesConfig);
    const server = new Server({ port }, compiler);

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

      await page.goto(`http://127.0.0.1:${port}/test-one.html`, {
        waitUntil: "domcontentloaded",
      });
      await new Promise((resolve) => {
        const interval = setInterval(() => {
          if (consoleMessages.includes("One.")) {
            clearInterval(interval);

            resolve();
          }
        }, 100);
      });

      await page.goto(`http://127.0.0.1:${port}/test-two.html`, {
        waitUntil: "domcontentloaded",
      });
      await new Promise((resolve) => {
        const interval = setInterval(() => {
          if (consoleMessages.includes("Two.")) {
            clearInterval(interval);

            resolve();
          }
        }, 100);
      });

      expect(consoleMessages).toMatchSnapshotWithArray("console messages");
      expect(pageErrors).toMatchSnapshotWithArray("page errors");
    } catch (error) {
      throw error;
    } finally {
      await server.stop();
    }
  });
});
