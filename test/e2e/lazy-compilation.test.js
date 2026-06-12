import { describe, it } from "node:test";

import webpack from "webpack";
import Server from "../../lib/Server.js";
import lazyCompilationMultipleEntriesConfig from "../fixtures/lazy-compilation-multiple-entries/webpack.config.js";
import lazyCompilationSingleEntryConfig from "../fixtures/lazy-compilation-single-entry/webpack.config.js";
import runBrowser from "../helpers/run-browser.js";
import portsMap from "../ports-map.js";

const port = portsMap["lazy-compilation"];

describe("lazy compilation", () => {
  // TODO freezes because webpack doesn't close `eventsource`, uncomment once fixed upstream
  it.skip("should work with single entry", async (t) => {
    const compiler = webpack(lazyCompilationSingleEntryConfig);
    const server = new Server({ port }, compiler);

    await server.start();

    const { page, browser } = await runBrowser();

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

      await page.goto(`http://localhost:${port}/test.html`, {
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

      t.assert.snapshot(consoleMessages);
      t.assert.snapshot(pageErrors);
    } finally {
      await browser.close();
      await server.stop();
    }
  });

  it.skip("should work with multiple entries", async (t) => {
    const compiler = webpack(lazyCompilationMultipleEntriesConfig);
    const server = new Server({ port }, compiler);

    await server.start();

    const { page, browser } = await runBrowser();

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

      await page.goto(`http://localhost:${port}/test-one.html`, {
        waitUntil: "domcontentloaded",
      });
      await new Promise((resolve) => {
        const interval = setInterval(() => {
          console.log(consoleMessages);
          if (consoleMessages.includes("One.")) {
            clearInterval(interval);

            resolve();
          }
        }, 100);
      });

      await page.goto(`http://localhost:${port}/test-two.html`, {
        waitUntil: "domcontentloaded",
      });
      await new Promise((resolve) => {
        const interval = setInterval(() => {
          console.log(consoleMessages);
          if (consoleMessages.includes("Two.")) {
            clearInterval(interval);

            resolve();
          }
        }, 100);
      });

      t.assert.snapshot(consoleMessages);
      t.assert.snapshot(pageErrors);
    } finally {
      await browser.close();
      await server.stop();
    }
  });
});
