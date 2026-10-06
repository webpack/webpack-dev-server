import fs from "node:fs";
import { createRequire } from "node:module";
import path from "node:path";
import { after, before, describe, it } from "node:test";
import { fileURLToPath } from "node:url";
import { expect } from "expect";
import webpack from "webpack";
import Server from "../../lib/Server.js";
import config from "../fixtures/compatibility-config/webpack.config.js";
import runBrowser from "../helpers/run-browser.js";
import waitFor from "../helpers/wait-for.js";
import portsMap from "../ports-map.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const require = createRequire(import.meta.url);

const [port, ownSocketPort] = portsMap.compatibility;
const CHANGING = path.resolve(
  __dirname,
  "../fixtures/compatibility-config/changing.cjs",
);
const OVERLAY_ID = "webpack-dev-server-client-overlay";
const INDICATOR_ID = "webpack-dev-middleware-building-indicator";

/**
 * Rewrite the module the fixture app requires, and so rebuild it.
 * @param {string} content the module's source
 */
function writeChanging(content) {
  fs.writeFileSync(CHANGING, content);
}

/**
 * @param {import("webpack").Compiler} compiler compiler
 * @returns {boolean} whether `HotModuleReplacementPlugin` was applied to it
 */
function hasHmrPlugin(compiler) {
  return compiler.hooks.compilation.taps.some(
    (tap) => tap.name === "HotModuleReplacementPlugin",
  );
}

/**
 * Start a server over the fixture, open a page on it, and collect what the
 * page logs.
 * @param {Record<string, unknown>} options dev server options
 * @param {Record<string, unknown>=} extra extra webpack configuration
 * @returns {Promise<{ server: Server, compiler: import("webpack").Compiler, page: import("puppeteer").Page, browser: import("puppeteer").Browser, messages: string[], errors: Error[], stop: () => Promise<void> }>} what is running
 */
async function open(options, extra = {}) {
  const compiler = webpack({ ...config, ...extra });
  const server = new Server({ port, ...options }, compiler);

  await server.start();

  const { page, browser } = await runBrowser();
  const messages = [];
  const errors = [];

  page
    .on("console", (message) => {
      messages.push(message.text());
    })
    .on("pageerror", (error) => {
      errors.push(error);
    });

  return {
    server,
    compiler,
    page,
    browser,
    messages,
    errors,
    stop: async () => {
      await browser.close();
      await server.stop();
    },
  };
}

// What worked against webpack-dev-server 6.0 and has to keep working now its
// client and its socket are webpack-dev-middleware's.
describe("compatibility", () => {
  before(() => {
    writeChanging("module.exports = 1;\n");
  });

  after(() => {
    fs.rmSync(CHANGING, { force: true });
  });

  // `@pmmmwh/react-refresh-webpack-plugin` bundles `require(
  // "webpack-dev-server/client/socket")` into every page by default, and
  // reads this server's own messages off the connection it finds there.
  it("lets React Refresh's overlay read the build from the socket", async () => {
    const { page, server, stop } = await open({ port });

    try {
      await page.goto(`http://127.0.0.1:${port}/`, {
        waitUntil: "domcontentloaded",
      });
      await page.waitForFunction(() => globalThis.socketReady === true, {
        timeout: 30000,
      });

      writeChanging("this is not valid javascript {{{\n");

      await page.waitForFunction(
        () =>
          globalThis.legacyMessages.some(
            (message) => message.type === "errors",
          ),
        { timeout: 30000 },
      );

      const errors = await page.evaluate(
        () =>
          globalThis.legacyMessages.find((message) => message.type === "errors")
            .data,
      );

      // Webpack's own error objects, as the plugin formats them.
      expect(errors[0].message).toContain("Module parse failed");

      writeChanging("module.exports = 2;\n");

      await page.waitForFunction(
        () =>
          globalThis.legacyMessages.some((message) => message.type === "ok"),
        { timeout: 30000 },
      );

      expect(server.webSocketServer.clients.length).toBeGreaterThan(0);
    } finally {
      writeChanging("module.exports = 1;\n");
      await stop();
    }
  });

  it("still sends this server's messages as they were", async () => {
    const { page, server, stop } = await open({ port });

    try {
      await page.goto(`http://127.0.0.1:${port}/`, {
        waitUntil: "domcontentloaded",
      });
      await page.waitForFunction(() => globalThis.socketReady === true, {
        timeout: 30000,
      });

      await new Promise((resolve) => {
        server.invalidate(resolve);
      });

      await page.waitForFunction(
        () =>
          globalThis.legacyMessages.some(
            (message) => message.type === "still-ok",
          ),
        { timeout: 30000 },
      );

      const types = await page.evaluate(() =>
        globalThis.legacyMessages.map((message) => message.type),
      );

      expect(types).toContain("invalid");
      expect(types).toContain("still-ok");
    } finally {
      await stop();
    }
  });

  // `devServer.sendMessage(devServer.webSocketServer.clients, ...)`, as the
  // changelog has documented since v4.
  it("reloads the page on sendMessage's static-changed, and lists the clients", async () => {
    const { page, server, stop } = await open({ port });
    const connections = [];

    server.webSocketServer.implementation.on("connection", (client) => {
      connections.push(client);
    });

    try {
      await page.goto(`http://127.0.0.1:${port}/`, {
        waitUntil: "domcontentloaded",
      });
      await page.waitForFunction(() => globalThis.socketReady === true, {
        timeout: 30000,
      });
      await waitFor(() => server.webSocketServer.clients.length > 0);
      await page.evaluate(() => {
        globalThis.notReloaded = true;
      });

      server.sendMessage(server.webSocketServer.clients, "static-changed");

      await page.waitForFunction(() => globalThis.notReloaded === undefined, {
        timeout: 30000,
      });

      expect(connections.length).toBeGreaterThan(0);
    } finally {
      await stop();
    }
  });

  it("shows the overlay under this server's Trusted Types policy name", async () => {
    writeChanging("broken for trusted types {{{\n");

    const { page, errors, stop } = await open({
      port,
      headers: {
        "Content-Security-Policy":
          "require-trusted-types-for 'script'; trusted-types webpack-dev-server#overlay",
      },
    });

    try {
      await page.goto(`http://127.0.0.1:${port}/`, {
        waitUntil: "domcontentloaded",
      });
      await page.waitForSelector(`#${OVERLAY_ID}`, { timeout: 30000 });

      expect(errors.map((error) => error.message).join("\n")).not.toContain(
        "Trusted Type",
      );
    } finally {
      writeChanging("module.exports = 1;\n");
      await stop();
    }
  });

  it("hands an overlay filter a problem with a message, as it always was", async () => {
    writeChanging("FILTERED-OUT {{{\n");

    const { page, messages, stop } = await open({
      port,
      client: {
        overlay: {
          errors: (error) => !error.message.includes("FILTERED-OUT"),
          // A module that does not parse also throws when it runs, which is
          // the other overlay; this is about the build's.
          runtimeErrors: false,
        },
      },
    });

    try {
      await page.goto(`http://127.0.0.1:${port}/`, {
        waitUntil: "domcontentloaded",
      });
      await waitFor(() =>
        messages.some((text) => text.includes("FILTERED-OUT")),
      );

      // Logged, and left out of the overlay by the filter.
      expect(await page.$(`#${OVERLAY_ID}`)).toBeNull();

      writeChanging("shown in the overlay {{{\n");

      await page.waitForSelector(`#${OVERLAY_ID}`, { timeout: 30000 });
    } finally {
      writeChanging("module.exports = 1;\n");
      await stop();
    }
  });

  it("shows no building indicator unless client.progress asks for one", async () => {
    const { page, stop } = await open({ port });

    try {
      await page.goto(`http://127.0.0.1:${port}/`, {
        waitUntil: "domcontentloaded",
      });
      await page.waitForFunction(() => globalThis.socketReady === true, {
        timeout: 30000,
      });
      await page.evaluate((id) => {
        globalThis.indicatorSeen = false;
        new MutationObserver(() => {
          if (document.querySelector(`#${id}`)) {
            globalThis.indicatorSeen = true;
          }
        }).observe(document.body, { childList: true, subtree: true });
      }, INDICATOR_ID);

      writeChanging("module.exports = 3;\n");

      await page.waitForFunction(
        () =>
          globalThis.legacyMessages.some((message) => message.type === "ok"),
        { timeout: 30000 },
      );

      expect(await page.evaluate(() => globalThis.indicatorSeen)).toBe(false);
    } finally {
      writeChanging("module.exports = 1;\n");
      await stop();
    }
  });

  it("connects a client entry written by hand, bare or with the old query", async () => {
    const query = new URLSearchParams({
      protocol: "ws:",
      hostname: "0.0.0.0",
      port: String(port),
      pathname: "/ws",
      logging: "info",
      reconnect: "10",
      hot: "true",
      "live-reload": "true",
    });

    for (const entry of [
      "webpack-dev-server/client/index.js",
      `webpack-dev-server/client/index.js?${query}`,
    ]) {
      const { page, messages, stop } = await open(
        { port, client: false },
        { entry: [entry, "./app.js"] },
      );

      try {
        await page.goto(`http://127.0.0.1:${port}/`, {
          waitUntil: "domcontentloaded",
        });
        await waitFor(() =>
          messages.some((text) => text.includes("] connected")),
        );

        // Labelled as this server's, unless the query names a `logging` of its
        // own, which replaces the label along with the level.
        if (!entry.includes("?")) {
          expect(
            messages.find((text) => text.includes("] connected")),
          ).toContain("[webpack-dev-server]");
        }
      } finally {
        await stop();
      }
    }
  });

  it("uses a client transport of someone else's in place of the built-in one", async () => {
    const { page, messages, stop } = await open({
      port,
      client: {
        webSocketTransport:
          require.resolve("../fixtures/custom-client/CustomWebSocketClient.js"),
      },
    });

    try {
      await page.goto(`http://127.0.0.1:${port}/`, {
        waitUntil: "domcontentloaded",
      });

      // The fixture logs "open" from its own `onOpen`.
      await waitFor(() => messages.includes("open"));

      expect(messages).toContain("open");
    } finally {
      await stop();
    }
  });

  it("hands webSocketServer.options to the ws server, a port of its own included", async () => {
    let verified = 0;
    const { page, messages, stop } = await open({
      port,
      webSocketServer: {
        type: "ws",
        options: {
          host: "127.0.0.1",
          port: ownSocketPort,
          verifyClient: () => {
            verified += 1;

            return true;
          },
        },
      },
    });

    try {
      await page.goto(`http://127.0.0.1:${port}/`, {
        waitUntil: "domcontentloaded",
      });
      await waitFor(() =>
        messages.some((text) => text.includes("] connected")),
      );

      expect(verified).toBeGreaterThan(0);
    } finally {
      await stop();
    }
  });

  it("keeps the plugin and adds no client with client: false", async () => {
    const compiler = webpack(config);
    const server = new Server({ port, client: false }, compiler);

    await server.start();

    try {
      expect(hasHmrPlugin(compiler)).toBe(true);
    } finally {
      await server.stop();
    }
  });

  it("adds no plugin with client: false and hot: false", async () => {
    const compiler = webpack(config);
    const server = new Server(
      { port, client: false, hot: false, liveReload: false },
      compiler,
    );

    await server.start();

    try {
      expect(hasHmrPlugin(compiler)).toBe(false);
    } finally {
      await server.stop();
    }
  });

  // A server bundle hot-reloads itself through `module.hot`, and a project
  // told not to add the plugin itself has relied on this server for it.
  it("gives the server half of a multi-compiler build the plugin too", async () => {
    const compiler = webpack([
      { ...config, name: "web" },
      { ...config, name: "server", target: "node", plugins: [] },
    ]);
    const server = new Server({ port }, compiler);

    await server.start();

    try {
      expect(compiler.compilers.map(hasHmrPlugin)).toEqual([true, true]);
    } finally {
      await server.stop();
    }
  });

  it("still answers getClientEntry and getClientHotEntry, with a deprecation", async () => {
    const warnings = [];
    const onWarning = (warning) => {
      warnings.push(warning.code);
    };

    process.on("warning", onWarning);

    try {
      const server = new Server({ port, hot: "only" }, webpack(config));

      expect(server.getClientEntry()).toBe(
        path.resolve(__dirname, "../../client/index.js"),
      );
      expect(server.getClientHotEntry()).toBe(
        require.resolve("webpack/hot/only-dev-server"),
      );

      await waitFor(() => warnings.length >= 2);

      expect(warnings).toEqual(
        expect.arrayContaining([
          "DEP_WEBPACK_DEV_SERVER_GET_CLIENT_ENTRY",
          "DEP_WEBPACK_DEV_SERVER_GET_CLIENT_HOT_ENTRY",
        ]),
      );
    } finally {
      process.off("warning", onWarning);
    }
  });
});
