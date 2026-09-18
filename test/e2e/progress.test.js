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

// Drives the `wds-progress` element the client created and reads back what the
// browser actually renders for the inner indicator.
const readIndicator = (page, percent) =>
  page.evaluate((value) => {
    const host = document.querySelector("wds-progress");

    host.setAttribute("progress", String(value));

    const element = host.shadowRoot.querySelector("#progress");
    const style = getComputedStyle(element);

    return {
      type: host.getAttribute("type"),
      role: host.getAttribute("role"),
      // cspell:ignore valuenow
      ariaValueNow: host.getAttribute("aria-valuenow"),
      classes: [...element.classList],
      width: style.width,
      height: style.height,
      backgroundColor: style.backgroundColor,
      display: style.display,
      percentText: host.shadowRoot.querySelector("#percent-value")?.textContent,
    };
  }, percent);

/**
 * @param {import("puppeteer").Page} page page
 * @param {"linear" | "circular"} type progress type
 * @returns {Promise<() => Promise<void>>} triggers one rebuild and waits for it
 */
async function setupRebuilds(page, type) {
  let hotUpdates = 0;

  page.on("request", (interceptedRequest) => {
    if (interceptedRequest.isInterceptResolutionHandled()) return;

    if (/\.hot-update\.(json|js)$/.test(interceptedRequest.url())) {
      hotUpdates += 1;
    }
  });

  await page.goto(`http://localhost:${port}/`, { waitUntil: "networkidle0" });

  let color = 0;

  return async () => {
    const seen = hotUpdates;

    color += 1;
    fs.writeFileSync(
      cssFilePath,
      `body { background-color: rgb(${color}, 0, 0); }`,
    );

    await new Promise((resolve) => {
      const timer = setInterval(() => {
        if (hotUpdates > seen) {
          clearInterval(timer);
          resolve();
        }
      }, 100);
    });

    await page.waitForSelector(`wds-progress[type="${type}"]`);
  };
}

describe("progress", () => {
  it("should work and log progress in a browser console", async () => {
    fs.writeFileSync(cssFilePath, "body { background-color: rgb(0, 0, 255); }");

    const compiler = webpack(reloadConfig);
    const devServerOptions = {
      port,
      client: {
        progress: true,
      },
    };
    const server = new Server(devServerOptions, compiler);

    await server.start();

    try {
      const { page, browser } = await runBrowser();

      const consoleMessages = [];

      try {
        let doHotUpdate = false;

        page
          .on("console", (message) => {
            consoleMessages.push(message);
          })
          .on("request", (interceptedRequest) => {
            if (interceptedRequest.isInterceptResolutionHandled()) return;

            if (/\.hot-update\.(json|js)$/.test(interceptedRequest.url())) {
              doHotUpdate = true;
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
            if (doHotUpdate) {
              clearInterval(timer);

              resolve();
            }
          }, 100);
        });
      } finally {
        await browser.close();
      }

      const progressConsoleMessage = consoleMessages.filter((message) =>
        /^\[webpack-dev-server\] (\[[a-zA-Z]+\] )?[0-9]{1,3}% - /.test(
          message.text(),
        ),
      );

      expect(progressConsoleMessage.length).toBeGreaterThan(0);
    } finally {
      fs.unlinkSync(cssFilePath);

      await server.stop();
    }
  });

  it('should render a visible bar when "progress" is "linear"', async () => {
    fs.writeFileSync(cssFilePath, "body { background-color: rgb(0, 0, 255); }");

    const compiler = webpack(reloadConfig);
    const server = new Server(
      { port, client: { progress: "linear" } },
      compiler,
    );

    await server.start();

    const { page, browser } = await runBrowser();

    try {
      const consoleMessages = [];

      page.on("console", (message) => {
        consoleMessages.push(message.text());
      });

      const rebuild = await setupRebuilds(page, "linear");

      await rebuild();

      // The resource query only recognized "true", so a visual mode was
      // reported as disabled until the socket resent it.
      expect(
        consoleMessages.find((message) => /Server started:/.test(message)),
      ).toContain("Progress enabled");

      const running = await readIndicator(page, 40);

      expect(running.type).toBe("linear");
      expect(running.classes).not.toContain("hidden");
      // The linear rules used to be keyed on `#bar`, which no template emits,
      // so the element rendered with no size and no color at all.
      expect(running.height).toBe("4px");
      expect(running.backgroundColor).toBe("rgb(186, 223, 172)");
      expect(running.width).not.toBe("0px");
      expect(running.role).toBe("progressbar");
      expect(running.ariaValueNow).toBe("40");

      const done = await readIndicator(page, 100);

      expect(done.ariaValueNow).toBe("100");
      expect(done.classes).toContain("disappear");
    } finally {
      await browser.close();
      fs.unlinkSync(cssFilePath);
      await server.stop();
    }
  });

  it('should render a ring when "progress" is "circular"', async () => {
    fs.writeFileSync(cssFilePath, "body { background-color: rgb(0, 0, 255); }");

    const compiler = webpack(reloadConfig);
    const server = new Server(
      { port, client: { progress: "circular" } },
      compiler,
    );

    await server.start();

    const { page, browser } = await runBrowser();

    try {
      const rebuild = await setupRebuilds(page, "circular");

      await rebuild();

      const running = await readIndicator(page, 60);

      expect(running.type).toBe("circular");
      expect(running.role).toBe("progressbar");
      expect(running.ariaValueNow).toBe("60");
      expect(running.percentText).toBe("60");
      expect(running.classes).not.toContain("hidden");
      expect(running.display).not.toBe("none");
    } finally {
      await browser.close();
      fs.unlinkSync(cssFilePath);
      await server.stop();
    }
  });

  it("should show the indicator again on a later rebuild", async () => {
    fs.writeFileSync(cssFilePath, "body { background-color: rgb(0, 0, 255); }");

    const compiler = webpack(reloadConfig);
    const server = new Server(
      { port, client: { progress: "linear" } },
      compiler,
    );

    await server.start();

    const { page, browser } = await runBrowser();

    try {
      const rebuild = await setupRebuilds(page, "linear");

      await rebuild();

      // Completing a build leaves the fade-out running; the next build has to
      // clear it, or the indicator stays invisible for the rest of the session.
      await readIndicator(page, 100);

      const restarted = await readIndicator(page, 10);

      expect(restarted.classes).not.toContain("disappear");
      expect(restarted.classes).not.toContain("hidden");
      expect(restarted.display).not.toBe("none");
      expect(
        await page.evaluate(
          () =>
            getComputedStyle(
              document
                .querySelector("wds-progress")
                .shadowRoot.querySelector("#progress"),
            ).opacity,
        ),
      ).toBe("1");
    } finally {
      await browser.close();
      fs.unlinkSync(cssFilePath);
      await server.stop();
    }
  });
});
