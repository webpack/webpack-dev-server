import { execFile } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { describe, it } from "node:test";
import { promisify } from "node:util";
import { expect } from "expect";
import webpack from "webpack";
import Server from "../../lib/Server.js";
import HTMLGeneratorPlugin from "../helpers/html-generator-plugin.js";
import runBrowser from "../helpers/run-browser.js";
import portsMap from "../ports-map.js";

const run = promisify(execFile);
const port = portsMap["universal-target"];

// `"universal"` and combined `["web", "node"]` targets emit ESM and are only
// available since webpack `5.108.0`, but `peerDependencies` allows `^5.101.0`.
const [major, minor] = webpack.version.split(".").map(Number);
const supportsUniversalTarget = major > 5 || (major === 5 && minor >= 108);

/**
 * An app that runs anywhere: it renders only where there is a page.
 * @param {string} text what the page's heading says
 * @returns {string} the module's source
 */
function app(text) {
  return `console.log("Hey.");

if (typeof document !== "undefined") {
  document.querySelector("h1").textContent = ${JSON.stringify(text)};
}

if (import.meta.webpackHot) {
  import.meta.webpackHot.accept();
}
`;
}

/**
 * @param {import("puppeteer").Page} page page
 * @param {string} text what the heading should say
 * @returns {Promise<void>} resolved once it does
 */
function waitForHeading(page, text) {
  return page
    .waitForFunction(
      (expected) => document.querySelector("h1")?.textContent === expected,
      { timeout: 60000, polling: 100 },
      text,
    )
    .then(() => {});
}

/**
 * Serve the app, built for `target`, from a directory of its own.
 * @param {string | string[]} target webpack target
 * @returns {Promise<{ compiler: import("webpack").Compiler, server: Server, dir: string, edit: (source: string) => void, close: () => Promise<void> }>} what is running
 */
async function serve(target) {
  const dir = fs.mkdtempSync(
    path.join(fs.realpathSync.native(os.tmpdir()), "wds-universal-"),
  );

  fs.writeFileSync(path.join(dir, "app.js"), app("v1"));

  const compiler = webpack({
    mode: "development",
    devtool: false,
    context: dir,
    entry: "./app.js",
    target,
    output: { path: "/" },
    plugins: [new HTMLGeneratorPlugin()],
    stats: "none",
    infrastructureLogging: { level: "info", stream: { write: () => {} } },
  });
  const server = new Server({ port }, compiler);

  await server.start();

  return {
    compiler,
    server,
    dir,
    edit(source) {
      fs.writeFileSync(path.join(dir, "app.js"), source);
    },
    async close() {
      await server.stop();
      fs.rmSync(dir, { recursive: true, force: true, maxRetries: 10 });
    },
  };
}

// A universal build is one bundle for a page and for Node: this server's
// client is in it for the page, and when Node runs it, it does nothing.
describe("universal target", { skip: !supportsUniversalTarget }, () => {
  for (const target of ["universal", ["web", "node"]]) {
    it(`updates the page and shows the overlay, built for ${JSON.stringify(target)}`, async () => {
      const served = await serve(target);
      const { page, browser } = await runBrowser();

      try {
        const pageErrors = [];

        page.on("pageerror", (error) => {
          pageErrors.push(error);
        });

        await page.goto(`http://localhost:${port}/`);
        await waitForHeading(page, "v1");
        await page.evaluate(() => {
          globalThis.notReloaded = true;
        });

        served.edit(app("v2"));
        await waitForHeading(page, "v2");

        expect(await page.evaluate(() => globalThis.notReloaded)).toBe(true);

        served.edit("export const broken = ;");
        await page.waitForSelector("#webpack-dev-server-client-overlay", {
          timeout: 60000,
        });

        served.edit(app("v3"));
        await waitForHeading(page, "v3");
        await page.waitForFunction(
          () => !document.querySelector("#webpack-dev-server-client-overlay"),
          { timeout: 60000, polling: 100 },
        );

        expect(pageErrors).toEqual([]);
      } finally {
        await browser.close();
        await served.close();
      }
    });

    it(`runs in Node without a word from the client, built for ${JSON.stringify(target)}`, async () => {
      const served = await serve(target);

      try {
        await new Promise((resolve) => {
          served.server.middleware.waitUntilValid(resolve);
        });

        // What this server served, run as it is.
        const bundle = path.join(served.dir, "main.mjs");
        const source = served.compiler.outputFileSystem.readFileSync(
          "/main.mjs",
          "utf8",
        );

        expect(source).toMatch(/client[\\/]+index\.js\?/);

        fs.writeFileSync(bundle, source);

        // Rejects on an exit code other than 0, and on a process still
        // running — a connection, a timer — after the timeout.
        const { stdout, stderr } = await run(process.execPath, [bundle], {
          timeout: 20000,
        });

        expect(stderr).toBe("");
        // The app, and nothing from the client.
        expect(stdout).toBe("Hey.\n");
      } finally {
        await served.close();
      }
    });
  }
});
