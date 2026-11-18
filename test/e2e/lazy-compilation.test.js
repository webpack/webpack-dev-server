import { describe, it } from "node:test";

import webpack from "webpack";
import Server from "../../lib/Server.js";
import config from "../fixtures/client-config/webpack.config.js";
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

  it("should serve the lazy compilation backend from its own server", async (t) => {
    const compiler = webpack(config);
    /** @type {((options: { client: string, listen?: { port: number } }) => { client: string, server?: unknown, urlBase?: string }) | undefined} */
    let backendOptions;
    // The installed webpack may predate the hook, so a stand-in provides it.
    compiler.webpack = {
      ...webpack,
      hmr: {
        LazyCompilationPlugin: {
          getCompilerHooks: (hookCompiler) => {
            t.assert.strictEqual(hookCompiler, compiler);

            return {
              backendOptions: {
                tap: (name, fn) => {
                  backendOptions = fn;
                },
              },
            };
          },
        },
      },
    };
    const server = new Server({ port }, compiler);

    await server.start();

    try {
      const options = backendOptions({ client: "client.js" });

      t.assert.strictEqual(options.server, server.server);
      t.assert.strictEqual(options.urlBase, `http://localhost:${port}`);
      t.assert.strictEqual(options.client, "client.js");

      for (const own of [
        { client: "client.js", listen: { port: 1 } },
        { client: "client.js", listen: 0 },
      ]) {
        t.assert.strictEqual(backendOptions(own), own);
      }
    } finally {
      await server.stop();
    }
  });

  it("should keep the lazy compilation backend's own server on port 0", async (t) => {
    const compiler = webpack(config);
    /** @type {((options: { client: string }) => { client: string, server?: unknown }) | undefined} */
    let backendOptions;
    compiler.webpack = {
      ...webpack,
      hmr: {
        LazyCompilationPlugin: {
          getCompilerHooks: () => ({
            backendOptions: {
              tap: (name, fn) => {
                backendOptions = fn;
              },
            },
          }),
        },
      },
    };
    const server = new Server({ port: 0 }, compiler);

    await server.start();

    try {
      const options = { client: "client.js" };

      t.assert.strictEqual(backendOptions(options), options);
    } finally {
      await server.stop();
    }
  });
});
