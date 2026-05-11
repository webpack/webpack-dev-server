import path from "node:path";
import { fileURLToPath } from "node:url";
import { describe, it } from "node:test";
import { expect } from "expect";
import webpack from "webpack";
import Server from "../../lib/Server.js";
import config from "../fixtures/client-config/webpack.config.js";

// Set up jsdom before loading fixtures that use browser APIs like Worker
import "../helpers/jsdom-setup.js";

import workerConfig from "../fixtures/worker-config/webpack.config.js";
import workerConfigDevServerFalse from "../fixtures/worker-config-dev-server-false/webpack.config.js";
import runBrowser from "../helpers/run-browser.js";
import portsMap from "../ports-map.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const port = portsMap.target;

const sortByTerm = (data, term) =>
  data.sort((a, b) => (a.indexOf(term) < b.indexOf(term) ? -1 : 1));

describe("target", () => {
  const targets = [
    false,
    "browserslist:defaults",
    "web",
    "webworker",
    "node",
    "async-node",
    "electron-main",
    "electron-preload",
    "electron-renderer",
    "nwjs",
    "node-webkit",
    "es5",
    ["web", "es5"],
  ];

  for (const target of targets) {
    it(`should work using "${target}" target`, async (t) => {
      const compiler = webpack({
        ...config,
        target,
        ...(target === false || target === "es5"
          ? {
              output: { chunkFormat: "array-push", path: "/" },
            }
          : {}),
      });
      const server = new Server({ port }, compiler);

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

        if (
          target === "node" ||
          target === "async-node" ||
          target === "electron-main" ||
          target === "electron-preload" ||
          target === "electron-renderer" ||
          target === "nwjs" ||
          target === "node-webkit"
        ) {
          const hasRequireOrGlobalError =
            pageErrors.filter((pageError) =>
              /require is not defined|global is not defined/.test(pageError),
            ).length === 1;

          expect(hasRequireOrGlobalError).toBe(true);
        } else {
          t.assert.snapshot(pageErrors);
        }
      } finally {
        await browser.close();
        await server.stop();
      }
    });
  }

  it("should work using multi compiler mode with `web` and `webworker` targets", async (t) => {
    const compiler = webpack(workerConfig);
    const server = new Server({ port }, compiler);

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

      t.assert.snapshot(
        sortByTerm(
          consoleMessages.map((message) => message.text()),
          "Worker said:",
        ),
      );

      t.assert.snapshot(pageErrors);
    } finally {
      await browser.close();
      await server.stop();
    }
  });

  it("should work using multi compiler mode with `web` and `webworker` targets with `devServer: false`", async (t) => {
    const compiler = webpack(workerConfigDevServerFalse);
    const server = new Server(
      {
        port,
        static: {
          directory: path.resolve(
            __dirname,
            "../fixtures/worker-config-dev-server-false/public/",
          ),
        },
      },
      compiler,
    );

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

      t.assert.snapshot(
        sortByTerm(
          consoleMessages.map((message) => message.text()),
          "Worker said:",
        ),
      );

      t.assert.snapshot(pageErrors);
    } finally {
      await browser.close();
      await server.stop();
    }
  });
});
