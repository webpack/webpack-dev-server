import path from "node:path";
import { fileURLToPath } from "node:url";
import { describe, it } from "node:test";

import webpack from "webpack";
import Server from "../../lib/Server.js";
import config from "../fixtures/client-config/webpack.config.js";
import runBrowser from "../helpers/run-browser.js";
import portsMap from "../ports-map.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const port = portsMap.entry;

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

describe("entry", () => {
  const entryFirst = path.resolve(
    __dirname,
    "../fixtures/client-config/foo.js",
  );
  const entrySecond = path.resolve(
    __dirname,
    "../fixtures/client-config/bar.js",
  );

  it("should work with single entry", async (t) => {
    const compiler = webpack({ ...config, entry: entryFirst });
    const devServerOptions = {
      port,
    };
    const server = new Server(devServerOptions, compiler);

    await server.start();

    const { page, browser } = await runBrowser();

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

      await page.goto(`http://localhost:${port}/`, {
        waitUntil: "networkidle0",
      });

      t.assert.snapshot(consoleMessages.map((message) => message.text()));
      t.assert.snapshot(pageErrors);
    } finally {
      await browser.close();
      await server.stop();
    }
  });

  it("should work with single array entry", async (t) => {
    const compiler = webpack({ ...config, entry: [entryFirst, entrySecond] });
    const devServerOptions = {
      port,
    };
    const server = new Server(devServerOptions, compiler);

    await server.start();

    const { page, browser } = await runBrowser();

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

      await page.goto(`http://localhost:${port}/`, {
        waitUntil: "networkidle0",
      });

      t.assert.snapshot(consoleMessages.map((message) => message.text()));
      t.assert.snapshot(pageErrors);
    } finally {
      await browser.close();
      await server.stop();
    }
  });

  it("should work with object entry", async (t) => {
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

    const { page, browser } = await runBrowser();

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

      await page.goto(`http://localhost:${port}/`, {
        waitUntil: "networkidle0",
      });

      t.assert.snapshot(consoleMessages.map((message) => message.text()));
      t.assert.snapshot(pageErrors);
    } finally {
      await browser.close();
      await server.stop();
    }
  });

  it("should work with dynamic entry", async (t) => {
    const compiler = webpack({ ...config, entry: () => entryFirst });
    const devServerOptions = {
      port,
    };
    const server = new Server(devServerOptions, compiler);

    await server.start();

    const { page, browser } = await runBrowser();

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

      await page.goto(`http://localhost:${port}/`, {
        waitUntil: "networkidle0",
      });

      t.assert.snapshot(consoleMessages.map((message) => message.text()));
      t.assert.snapshot(pageErrors);
    } finally {
      await browser.close();
      await server.stop();
    }
  });

  it("should work with dynamic async entry", async (t) => {
    const compiler = webpack({
      ...config,
      entry: () =>
        new Promise((resolve) => {
          resolve([entryFirst]);
        }),
    });
    const devServerOptions = {
      port,
    };
    const server = new Server(devServerOptions, compiler);

    await server.start();

    const { page, browser } = await runBrowser();

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

      await page.goto(`http://localhost:${port}/`, {
        waitUntil: "networkidle0",
      });

      t.assert.snapshot(consoleMessages.map((message) => message.text()));
      t.assert.snapshot(pageErrors);
    } finally {
      await browser.close();
      await server.stop();
    }
  });

  it("should work with multiple entries", async (t) => {
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
        waitUntil: "networkidle0",
      });
      await page.addScriptTag({ url: `http://localhost:${port}/runtime.js` });
      await page.addScriptTag({ url: `http://localhost:${port}/foo.js` });
      await waitForConsoleLogFinished(consoleMessages);

      t.assert.snapshot(consoleMessages);
      t.assert.snapshot(pageErrors);
    } finally {
      await browser.close();
      await server.stop();
    }
  });

  it("should work with multiple entries #2", async (t) => {
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
        waitUntil: "networkidle0",
      });
      await page.addScriptTag({ url: `http://localhost:${port}/runtime.js` });
      await page.addScriptTag({ url: `http://localhost:${port}/bar.js` });
      await waitForConsoleLogFinished(consoleMessages);

      t.assert.snapshot(consoleMessages);
      t.assert.snapshot(pageErrors);
    } finally {
      await browser.close();
      await server.stop();
    }
  });

  it('should work with multiple entries and "dependOn"', async (t) => {
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
        waitUntil: "networkidle0",
      });
      await page.addScriptTag({ url: `http://localhost:${port}/bar.js` });
      await page.addScriptTag({ url: `http://localhost:${port}/foo.js` });
      await waitForConsoleLogFinished(consoleMessages);

      t.assert.snapshot(consoleMessages);
      t.assert.snapshot(pageErrors);
    } finally {
      await browser.close();
      await server.stop();
    }
  });

  it("should work with empty", async (t) => {
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

    const { page, browser } = await runBrowser();

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

      await page.goto(`http://localhost:${port}/`, {
        waitUntil: "networkidle0",
      });

      t.assert.snapshot(consoleMessages.map((message) => message.text()));
      t.assert.snapshot(pageErrors);
    } finally {
      await browser.close();
      await server.stop();
    }
  });
});
