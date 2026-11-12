import path from "node:path";
import { describe, it } from "node:test";
import { fileURLToPath } from "node:url";
import { expect } from "expect";
import webpack from "webpack";
import Server from "../../lib/Server.js";
import config from "../fixtures/client-config/webpack.config.js";

// Set up jsdom before loading fixtures that use browser APIs like Worker
import "../helpers/jsdom-setup.js";

import workerConfig from "../fixtures/worker-config/webpack.config.js";
import workerConfigDevServerFalse from "../fixtures/worker-config-dev-server-false/webpack.config.js";
import runBrowser from "../helpers/run-browser.js";
import waitFor from "../helpers/wait-for.js";
import portsMap from "../ports-map.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const port = portsMap.target;

const sortByTerm = (data, term) =>
  data.toSorted((a, b) => (a.indexOf(term) < b.indexOf(term) ? -1 : 1));

// `"universal"` and combined `["web", "node"]` targets emit ESM and are only
// available since webpack `5.108.0`, but `peerDependencies` allows `^5.101.0`.
const [major, minor] = webpack.version.split(".").map(Number);
const supportsUniversalTarget = major > 5 || (major === 5 && minor >= 108);

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
    ...(supportsUniversalTarget ? ["universal", ["web", "node"]] : []),
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

        // ESM bundles load deferred, so wait for the entry to run
        if (compiler.options.output.module) {
          const deadline = Date.now() + 10000;

          while (
            !consoleMessages.some((message) => message.text() === "Hey.") &&
            Date.now() < deadline
          ) {
            await new Promise((resolve) => {
              setTimeout(resolve, 100);
            });
          }
        }

        t.assert.snapshot(consoleMessages.map((message) => message.text()));

        t.assert.snapshot(pageErrors);
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

      // The worker posts its messages, and its own client connects, after the
      // navigation has settled, so wait for all of them instead of
      // snapshotting whichever ones happened to arrive first.
      const count = (term) =>
        consoleMessages.filter((message) => message.text().includes(term))
          .length;

      // At least, so a client that reconnects fails the snapshot below rather
      // than waiting out the test's timeout.
      await waitFor(
        () =>
          count("Worker said:") >= 2 &&
          count("[webpack-dev-server] connected") >= 2,
      );

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

      // The worker posts its messages after the navigation has settled, so
      // wait for both of them instead of snapshotting whichever ones happened
      // to arrive first.
      await waitFor(
        () =>
          consoleMessages.filter((message) =>
            message.text().includes("Worker said:"),
          ).length === 2,
      );

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

describe("non-web target warning", () => {
  /**
   * Build a compiler for `targets` whose infrastructure warnings land in
   * `warnings`.
   * @param {(string | false)[]} targets one target per compiler
   * @param {string[]} warnings where the warnings are collected
   * @returns {import("webpack").Compiler | import("webpack").MultiCompiler} compiler
   */
  const compile = (targets, warnings) => {
    const configs = targets.map((target, index) => ({
      ...config,
      ...(targets.length > 1 ? { name: `${target}-${index}` } : {}),
      target,
      output: {
        path: "/",
        filename: `${index}-[name].js`,
      },
      infrastructureLogging: {
        level: "warn",
        colors: false,
        stream: {
          write: (message) => {
            warnings.push(message);
          },
        },
      },
    }));

    return webpack(configs.length === 1 ? configs[0] : configs);
  };

  /**
   * @param {string[]} warnings collected warnings
   * @returns {string[]} the ones about a non-web target
   */
  const nonWebTargetWarnings = (warnings) =>
    warnings.filter((message) => message.includes("non-web target"));

  /**
   * @param {import("webpack").Compiler | import("webpack").MultiCompiler} compiler compiler
   * @param {Record<string, unknown>=} options dev server options
   * @returns {Promise<void>} resolved once the server started and stopped
   */
  const startAndStop = async (compiler, options = {}) => {
    const server = new Server({ port, ...options }, compiler);

    await server.start();
    await server.stop();
  };

  it("should warn once for a `node` target", async () => {
    const warnings = [];

    await startAndStop(compile(["node"], warnings));

    expect(nonWebTargetWarnings(warnings)).toEqual([
      "<w> [webpack-dev-server] The compiler has a non-web target (\"node\"), so no client is injected into it and 'hot' and 'liveReload' will not reach a page built from it.\n",
    ]);
  });

  it("should warn about `liveReload` alone when `hot` is disabled", async () => {
    const warnings = [];

    await startAndStop(compile(["node"], warnings), { hot: false });

    expect(nonWebTargetWarnings(warnings)).toEqual([
      "<w> [webpack-dev-server] The compiler has a non-web target (\"node\"), so no client is injected into it and 'liveReload' will not reach a page built from it.\n",
    ]);
  });

  it("should not warn when `hot` and `liveReload` are disabled", async () => {
    const warnings = [];

    await startAndStop(compile(["node"], warnings), {
      hot: false,
      liveReload: false,
    });

    expect(nonWebTargetWarnings(warnings)).toEqual([]);
  });

  it("should not warn when `client` is disabled", async () => {
    const warnings = [];

    await startAndStop(compile(["node"], warnings), { client: false });

    expect(nonWebTargetWarnings(warnings)).toEqual([]);
  });

  it("should not warn for a `web` target", async () => {
    const warnings = [];

    await startAndStop(compile(["web"], warnings));

    expect(nonWebTargetWarnings(warnings)).toEqual([]);
  });

  it("should not warn for the `node` compiler of a `web` and `node` multi compiler", async () => {
    const warnings = [];

    await startAndStop(compile(["web", "node"], warnings));

    expect(nonWebTargetWarnings(warnings)).toEqual([]);
  });

  it("should warn once per compiler when no compiler has a web target", async () => {
    const warnings = [];

    await startAndStop(compile(["node", "async-node"], warnings));

    expect(nonWebTargetWarnings(warnings)).toEqual([
      "<w> [webpack-dev-server] Compiler \"node-0\" has a non-web target (\"node\"), so no client is injected into it and 'hot' and 'liveReload' will not reach a page built from it.\n",
      "<w> [webpack-dev-server] Compiler \"async-node-1\" has a non-web target (\"async-node\"), so no client is injected into it and 'hot' and 'liveReload' will not reach a page built from it.\n",
    ]);
  });
});
