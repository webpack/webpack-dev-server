import path from "node:path";
import { describe, it } from "node:test";
import { fileURLToPath } from "node:url";
import { expect } from "expect";
import fs from "graceful-fs";
import webpack from "webpack";
import Server from "../../lib/Server.js";
import reloadConfig from "../fixtures/reload-config-2/webpack.config.js";
import runBrowser from "../helpers/run-browser.js";
import portsMap from "../ports-map.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const port = portsMap.progress;

const cssFilePath = path.resolve(
  __dirname,
  "../fixtures/reload-config-2/main.css",
);

// The indicator itself, how it looks and how it moves, belongs to
// webpack-dev-middleware and is tested there. What is this server's to check is
// that `client.progress` turns it on, and that the build's progress is what
// reaches it.

/**
 * Serve the fixture with `client.progress` as given, load a page that records
 * what the build tells it, and rebuild once.
 * @param {boolean | "linear" | "circular"} progress the `client.progress` option
 * @returns {Promise<{ progressMessages: number, indicatorSeen: boolean }>} what the page saw while it rebuilt
 */
async function rebuildWith(progress) {
  fs.writeFileSync(cssFilePath, "body { background-color: rgb(0, 0, 255); }");

  const compiler = webpack(reloadConfig);
  const server = new Server({ port, client: { progress } }, compiler);

  await server.start();

  try {
    const { page, browser } = await runBrowser();

    try {
      // Before any script runs, so nothing the first build says is missed.
      await page.evaluateOnNewDocument(() => {
        globalThis.progressMessages = 0;
        globalThis.indicatorSeen = false;

        globalThis.addEventListener("message", (event) => {
          if (event.data && event.data.type === "webpackProgress") {
            globalThis.progressMessages += 1;
          }
        });

        new MutationObserver(() => {
          if (
            document.querySelector("#webpack-dev-middleware-building-indicator")
          ) {
            globalThis.indicatorSeen = true;
          }
        }).observe(document, { childList: true, subtree: true });
      });

      let hotUpdated = false;

      page.on("request", (request) => {
        if (/\.hot-update\.(json|js)$/.test(request.url())) {
          hotUpdated = true;
        }
      });

      await page.goto(`http://localhost:${port}/`, {
        waitUntil: "networkidle0",
      });

      fs.writeFileSync(
        cssFilePath,
        "body { background-color: rgb(255, 0, 0); }",
      );

      await new Promise((resolve) => {
        const timer = setInterval(() => {
          if (hotUpdated) {
            clearInterval(timer);
            resolve();
          }
        }, 100);
      });

      return await page.evaluate(() => ({
        progressMessages: globalThis.progressMessages,
        indicatorSeen: globalThis.indicatorSeen,
      }));
    } finally {
      await browser.close();
    }
  } finally {
    fs.unlinkSync(cssFilePath);

    await server.stop();
  }
}

describe("progress", () => {
  it("should report the build's progress to the page and show the indicator", async () => {
    const { progressMessages, indicatorSeen } = await rebuildWith(true);

    expect(progressMessages).toBeGreaterThan(0);
    expect(indicatorSeen).toBe(true);
  });

  for (const progress of ["linear", "circular"]) {
    it(`should show the indicator when "progress" is "${progress}"`, async () => {
      const { indicatorSeen } = await rebuildWith(progress);

      expect(indicatorSeen).toBe(true);
    });
  }

  it("should not show the indicator when `progress` is off", async () => {
    const { indicatorSeen } = await rebuildWith(false);

    expect(indicatorSeen).toBe(false);
  });
});
