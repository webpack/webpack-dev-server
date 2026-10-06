import path from "node:path";
import { afterEach, beforeEach, describe, it } from "node:test";
import { fileURLToPath } from "node:url";
import { expect } from "expect";
import fs from "graceful-fs";
import { fn, spyOn } from "jest-mock";
import webpack from "webpack";
import WebSocket from "ws";
import Server from "../../lib/Server.js";
import config from "../fixtures/client-config/webpack.config.js";
import multiCompilerConfig from "../fixtures/multi-compiler-one-configuration/webpack.config.js";
import reloadConfig from "../fixtures/reload-config/webpack.config.js";
import HTMLGeneratorPlugin from "../helpers/html-generator-plugin.js";
import runBrowser from "../helpers/run-browser.js";
import portsMap from "../ports-map.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const port = portsMap["hot-and-live-reload"];

const cssFilePath = path.resolve(
  __dirname,
  "../fixtures/reload-config/main.css",
);

// What a rebuild reports about itself is different on every run and on every
// machine: how long it took, and the absolute path of the file that changed.
const root = path.resolve(__dirname, "../..");

/**
 * @param {string} text a console message
 * @returns {string} the message without the parts that vary between runs
 */
function normalize(text) {
  return text
    .replaceAll(root, "<root>")
    .replace(/rebuilt in \d+ms/, "rebuilt in <time>");
}

// What the client says when a build finishes, under whichever name it was given:
// this server's, or the middleware's for a client wired by hand. It is the last
// thing a page that applies nothing says, so waiting for it means the page has
// said everything there is to say.
const INVALID_MESSAGE =
  /^\[webpack-dev-(?:server|middleware)\] bundle rebuilt in/;

describe("hot and live reload", () => {
  const modes = [
    {
      title: "should work and refresh content using hot module replacement",
    },
    {
      title: "should work and do nothing when web socket server disabled",
      options: {
        webSocketServer: false,
      },
    },
    // Default web socket serve ("ws")
    {
      title:
        "should work and refresh content using hot module replacement when hot enabled",
      options: {
        hot: true,
      },
    },
    {
      title:
        "should work and refresh content using hot module replacement when live reload enabled",
      options: {
        liveReload: true,
      },
    },
    {
      title: "should not refresh content when hot and no live reload disabled",
      options: {
        hot: false,
        liveReload: false,
      },
    },
    {
      title:
        "should work and refresh content using hot module replacement when live reload disabled and hot enabled",
      options: {
        liveReload: false,
        hot: true,
      },
    },
    {
      title: "should work and refresh content using live reload",
      options: {
        liveReload: true,
        hot: false,
      },
    },
    {
      title:
        "should work and refresh content using hot module replacement when live reload enabled and hot disabled",
      options: {
        liveReload: true,
        hot: true,
      },
    },
    // "ws" web socket serve
    {
      title:
        "should work and refresh content using hot module replacement when hot enabled",
      options: {
        webSocketServer: "ws",
        hot: true,
      },
    },
    {
      title:
        "should work and refresh content using hot module replacement when live reload enabled",
      options: {
        webSocketServer: "ws",
        liveReload: true,
      },
    },
    {
      title: "should not refresh content when hot and no live reload disabled",
      options: {
        webSocketServer: "ws",
        hot: false,
        liveReload: false,
      },
    },
    {
      title:
        "should work and refresh content using hot module replacement when live reload disabled and hot enabled",
      options: {
        webSocketServer: "ws",
        liveReload: false,
        hot: true,
      },
    },
    {
      title:
        "should work and refresh content using live reload when live reload enabled and hot disabled",
      options: {
        webSocketServer: "ws",
        liveReload: true,
        hot: false,
      },
    },
    {
      title:
        "should work and refresh content using hot module replacement when live reload and hot enabled",
      options: {
        webSocketServer: "ws",
        liveReload: true,
        hot: true,
      },
    },
    {
      title:
        'should work and allow to disable hot module replacement using the "webpack-dev-server-hot=false"',
      query: "?webpack-dev-server-hot=false",
      options: {
        liveReload: true,
        hot: true,
      },
    },
    {
      title:
        'should work and allow to disable live reload using the "webpack-dev-server-live-reload=false"',
      query: "?webpack-dev-server-live-reload=false",
      options: {
        liveReload: true,
        hot: false,
      },
    },
    {
      title:
        'should work and allow to disable hot module replacement and live reload using the "webpack-dev-server-hot=false&webpack-dev-server-live-reload=false"',
      query:
        "?webpack-dev-server-hot=false&webpack-dev-server-live-reload=false",
      options: {
        liveReload: true,
        hot: true,
      },
    },
    {
      title: "should work with manual client setup",
      webpackOptions: {
        entry: [
          // A client wired by hand, through this package's published path —
          // which is webpack-dev-middleware's client re-exported. Nothing is
          // injected for it, so its query says where to connect and what to
          // speak; the server no longer pushes that after the handshake.
          `${fileURLToPath(import.meta.resolve("../../client/index.js"))}?path=/ws&transport=ws`,
          fileURLToPath(
            import.meta.resolve("../fixtures/reload-config/foo.js"),
          ),
        ],
      },
      options: {
        client: false,
        liveReload: true,
        hot: true,
      },
    },
    // TODO we still output logs from webpack, need to improve this
    {
      title:
        "should work with manual client setup and allow to enable hot module replacement",
      webpackOptions: {
        entry: [
          "webpack/hot/dev-server",
          `${fileURLToPath(import.meta.resolve("../../client/index.js"))}?path=/ws&transport=ws&apply=hmr`,
          fileURLToPath(
            import.meta.resolve("../fixtures/reload-config/foo.js"),
          ),
        ],
        plugins: [
          new webpack.HotModuleReplacementPlugin(),
          new HTMLGeneratorPlugin(),
        ],
      },
      options: {
        client: false,
        liveReload: false,
        hot: false,
      },
    },
    {
      title:
        "should work with manual client setup and allow to disable hot module replacement",
      webpackOptions: {
        entry: [
          `${fileURLToPath(import.meta.resolve("../../client/index.js"))}?path=/ws&transport=ws&apply=reload`,
          fileURLToPath(
            import.meta.resolve("../fixtures/reload-config/foo.js"),
          ),
        ],
      },
      options: {
        client: false,
        liveReload: true,
        hot: true,
      },
    },
    {
      title:
        "should work with manual client setup and allow to enable live reload",
      webpackOptions: {
        entry: [
          `${fileURLToPath(import.meta.resolve("../../client/index.js"))}?path=/ws&transport=ws&apply=reload`,
          fileURLToPath(
            import.meta.resolve("../fixtures/reload-config/foo.js"),
          ),
        ],
      },
      options: {
        client: false,
        liveReload: false,
        hot: false,
      },
    },
    {
      title:
        "should work with manual client setup and allow to disable live reload",
      webpackOptions: {
        entry: [
          `${fileURLToPath(import.meta.resolve("../../client/index.js"))}?path=/ws&transport=ws&apply=nothing`,
          fileURLToPath(
            import.meta.resolve("../fixtures/reload-config/foo.js"),
          ),
        ],
      },
      options: {
        client: false,
        liveReload: true,
        hot: false,
      },
    },
  ];

  let browser;
  let server;

  beforeEach(() => {
    fs.writeFileSync(cssFilePath, "body { background-color: rgb(0, 0, 255); }");
  });

  afterEach(async () => {
    if (browser) {
      await browser.close();
    }

    if (server) {
      await server.stop();
    }

    fs.unlinkSync(cssFilePath);
  });

  for (const mode of modes) {
    const webSocketServerTitle =
      mode.options && mode.options.webSocketServer
        ? mode.options.webSocketServer
        : "default";

    // eslint-disable-next-line no-loop-func
    it(`${mode.title} (${webSocketServerTitle})`, async (t) => {
      const webpackOptions = { ...reloadConfig, ...mode.webpackOptions };
      const compiler = webpack(webpackOptions);
      const testDevServerOptions = mode.options || {};
      const devServerOptions = { port, ...testDevServerOptions };

      server = new Server(devServerOptions, compiler);

      await server.start();

      const webSocketServerLaunched =
        testDevServerOptions.webSocketServer !== false;

      await new Promise((resolve) => {
        const ws = new WebSocket(`ws://localhost:${devServerOptions.port}/ws`, {
          headers: {
            host: `localhost:${devServerOptions.port}`,
            origin: `http://localhost:${devServerOptions.port}`,
          },
        });

        let opened = false;
        let received = false;
        let errored = false;

        ws.on("error", (_error) => {
          errored = true;

          ws.close();
        });

        ws.on("open", () => {
          opened = true;
        });

        ws.on("message", (data) => {
          const message = JSON.parse(data);

          // The catch-up a newly connected client is sent, or the build that
          // followed: `sync` is one the page is already running, `built` one
          // it is not.
          if (message.action === "sync" || message.action === "built") {
            received = true;

            ws.close();
          }
        });

        ws.on("close", () => {
          if (opened && received && !errored) {
            resolve();
          } else if (!webSocketServerLaunched && errored) {
            resolve();
          }
        });
      });

      const launched = await runBrowser();

      ({ browser } = launched);

      const { page } = launched;

      const consoleMessages = [];
      const pageErrors = [];

      let doneHotUpdate = false;
      let hasDisconnectedMessage = false;

      page
        .on("console", (message) => {
          if (!hasDisconnectedMessage) {
            const text = message.text();

            hasDisconnectedMessage = /Disconnected!/.test(text);
            consoleMessages.push(normalize(text));
          }
        })
        .on("pageerror", (error) => {
          pageErrors.push(error);
        })
        .on("request", (requestObj) => {
          if (/\.hot-update\.json$/.test(requestObj.url())) {
            doneHotUpdate = true;
          }
        });

      await page.goto(`http://localhost:${port}/${mode.query || ""}`, {
        waitUntil: "networkidle0",
      });

      const backgroundColorBefore = await page.evaluate(() => {
        const { body } = document;

        return getComputedStyle(body)["background-color"];
      });

      expect(backgroundColorBefore).toBe("rgb(0, 0, 255)");

      fs.writeFileSync(
        cssFilePath,
        "body { background-color: rgb(255, 0, 0); }",
      );

      let waitHot =
        typeof testDevServerOptions.hot !== "undefined"
          ? testDevServerOptions.hot
          : true;
      let waitLiveReload =
        typeof testDevServerOptions.liveReload !== "undefined"
          ? testDevServerOptions.liveReload
          : true;

      if (webSocketServerLaunched === false) {
        waitHot = false;
        waitLiveReload = false;
      }

      // A client wired by hand says what a build should do in its own query,
      // which is what the page does regardless of this server's options.
      if (Array.isArray(webpackOptions.entry)) {
        const entry = webpackOptions.entry.find((item) =>
          /[?&]apply=/.test(item),
        );
        const match = /[?&]apply=([\w-]+)/.exec(entry || "");
        const apply = match ? match[1] : undefined;

        if (apply === "hmr") {
          waitHot = true;
        } else if (apply === "reload") {
          waitHot = false;
          waitLiveReload = true;
        } else if (apply === "nothing") {
          waitHot = false;
          waitLiveReload = false;
        }
      }

      const query = mode.query || "";

      if (query.includes("webpack-dev-server-hot=false")) {
        waitHot = false;
      }

      if (query.includes("webpack-dev-server-live-reload=false")) {
        waitLiveReload = false;
      }

      if (waitHot) {
        await page.waitForFunction(
          () =>
            getComputedStyle(document.body)["background-color"] ===
            "rgb(255, 0, 0)",
        );

        expect(doneHotUpdate).toBe(true);
      } else if (waitLiveReload) {
        await page.waitForNavigation({
          waitUntil: "networkidle0",
        });
      } else if (webSocketServerLaunched) {
        await new Promise((resolve) => {
          const interval = setInterval(() => {
            if (
              consoleMessages.some((message) => INVALID_MESSAGE.test(message))
            ) {
              clearInterval(interval);

              resolve();
            }
          }, 100);
        });
      }

      const backgroundColorAfter = await page.evaluate(() => {
        const { body } = document;

        return getComputedStyle(body)["background-color"];
      });

      if (!waitHot && !waitLiveReload) {
        expect(backgroundColorAfter).toBe("rgb(0, 0, 255)");
      } else {
        expect(backgroundColorAfter).toBe("rgb(255, 0, 0)");
      }

      t.assert.snapshot(consoleMessages);
      t.assert.snapshot(pageErrors);
    });
  }
});

// the following cases check to make sure that the HMR
// plugin is actually added

describe("simple hot config HMR plugin", () => {
  let compiler;
  let server;
  let page;
  let browser;
  let pageErrors;
  let consoleMessages;

  beforeEach(async () => {
    compiler = webpack(config);

    ({ page, browser } = await runBrowser());

    pageErrors = [];
    consoleMessages = [];
  });

  afterEach(async () => {
    await browser.close();
    await server.stop();
  });

  it("should register the HMR plugin before compilation is complete", async (t) => {
    let pluginFound = false;

    compiler.hooks.compilation.intercept({
      register: (tapInfo) => {
        if (tapInfo.name === "HotModuleReplacementPlugin") {
          pluginFound = true;
        }

        return tapInfo;
      },
    });

    server = new Server({ port }, compiler);

    await server.start();

    expect(pluginFound).toBe(true);

    page
      .on("console", (message) => {
        consoleMessages.push(message);
      })
      .on("pageerror", (error) => {
        pageErrors.push(error);
      });

    const response = await page.goto(`http://localhost:${port}/`, {
      waitUntil: "networkidle0",
    });

    t.assert.snapshot(response.status());

    t.assert.snapshot(consoleMessages.map((message) => message.text()));

    t.assert.snapshot(pageErrors);
  });
});

describe("simple hot config HMR plugin with already added HMR plugin", () => {
  let compiler;
  let server;
  let page;
  let browser;
  let pageErrors;
  let consoleMessages;

  beforeEach(async () => {
    compiler = webpack({
      ...config,
      plugins: [...config.plugins, new webpack.HotModuleReplacementPlugin()],
    });

    ({ page, browser } = await runBrowser());

    pageErrors = [];
    consoleMessages = [];
  });

  afterEach(async () => {
    await browser.close();
    await server.stop();
  });

  it("should register the HMR plugin before compilation is complete", async (t) => {
    let pluginFound = false;

    compiler.hooks.compilation.intercept({
      register: (tapInfo) => {
        if (tapInfo.name === "HotModuleReplacementPlugin") {
          pluginFound = true;
        }

        return tapInfo;
      },
    });

    server = new Server({ port }, compiler);

    await server.start();

    expect(compiler.options.plugins).toHaveLength(2);
    expect(pluginFound).toBe(true);

    page
      .on("console", (message) => {
        consoleMessages.push(message);
      })
      .on("pageerror", (error) => {
        pageErrors.push(error);
      });

    const response = await page.goto(`http://localhost:${port}/`, {
      waitUntil: "networkidle0",
    });

    t.assert.snapshot(response.status());

    t.assert.snapshot(consoleMessages.map((message) => message.text()));

    t.assert.snapshot(pageErrors);
  });
});

describe("simple config with already added HMR plugin", () => {
  let loggerWarnSpy;
  let getInfrastructureLoggerSpy;
  let compiler;
  let server;

  beforeEach(() => {
    compiler = webpack({
      ...config,
      devServer: { hot: false },
      plugins: [...config.plugins, new webpack.HotModuleReplacementPlugin()],
    });

    loggerWarnSpy = fn();

    getInfrastructureLoggerSpy = spyOn(
      compiler,
      "getInfrastructureLogger",
    ).mockImplementation(() => ({
      warn: loggerWarnSpy,
      info: () => {},
      log: () => {},
    }));
  });

  afterEach(() => {
    getInfrastructureLoggerSpy.mockRestore();
    loggerWarnSpy.mockRestore();
  });

  it("should show warning with hot normalized as true", async () => {
    server = new Server({ port }, compiler);

    await server.start();

    expect(loggerWarnSpy).toHaveBeenCalledWith(
      '"hot: true" automatically applies HMR plugin, you don\'t have to add it manually to your webpack configuration.',
    );

    await server.stop();
  });

  it('should show warning with "hot: true"', async () => {
    server = new Server({ port, hot: true }, compiler);

    await server.start();

    expect(loggerWarnSpy).toHaveBeenCalledWith(
      '"hot: true" automatically applies HMR plugin, you don\'t have to add it manually to your webpack configuration.',
    );

    await server.stop();
  });

  it('should not show warning with "hot: false"', async () => {
    server = new Server({ port, hot: false }, compiler);

    await server.start();

    expect(loggerWarnSpy).not.toHaveBeenCalledWith(
      '"hot: true" automatically applies HMR plugin, you don\'t have to add it manually to your webpack configuration.',
    );

    await server.stop();
  });
});

describe("multi compiler hot config HMR plugin", () => {
  let compiler;
  let server;
  let page;
  let browser;
  let pageErrors;
  let consoleMessages;

  beforeEach(async () => {
    compiler = webpack(multiCompilerConfig);

    ({ page, browser } = await runBrowser());

    pageErrors = [];
    consoleMessages = [];
  });

  afterEach(async () => {
    await browser.close();
    await server.stop();
  });

  it("should register the HMR plugin before compilation is complete", async (t) => {
    let pluginFound = false;

    compiler.compilers[0].hooks.compilation.intercept({
      register: (tapInfo) => {
        if (tapInfo.name === "HotModuleReplacementPlugin") {
          pluginFound = true;
        }

        return tapInfo;
      },
    });

    server = new Server({ port }, compiler);

    await server.start();

    expect(pluginFound).toBe(true);

    page
      .on("console", (message) => {
        consoleMessages.push(message);
      })
      .on("pageerror", (error) => {
        pageErrors.push(error);
      });

    const response = await page.goto(`http://localhost:${port}/`, {
      waitUntil: "networkidle0",
    });

    t.assert.snapshot(response.status());

    t.assert.snapshot(consoleMessages.map((message) => message.text()));

    t.assert.snapshot(pageErrors);
  });
});

describe("hot disabled HMR plugin", () => {
  let compiler;
  let server;
  let page;
  let browser;
  let pageErrors;
  let consoleMessages;

  beforeEach(async () => {
    compiler = webpack(config);

    ({ page, browser } = await runBrowser());

    pageErrors = [];
    consoleMessages = [];
  });

  afterEach(async () => {
    await browser.close();
    await server.stop();
  });

  it("should NOT register the HMR plugin before compilation is complete", async (t) => {
    let pluginFound = false;

    compiler.hooks.compilation.intercept({
      register: (tapInfo) => {
        if (tapInfo.name === "HotModuleReplacementPlugin") {
          pluginFound = true;
        }

        return tapInfo;
      },
    });

    server = new Server({ port, hot: false }, compiler);

    await server.start();

    expect(pluginFound).toBe(false);

    page
      .on("console", (message) => {
        consoleMessages.push(message);
      })
      .on("pageerror", (error) => {
        pageErrors.push(error);
      });

    const response = await page.goto(`http://localhost:${port}/`, {
      waitUntil: "networkidle0",
    });

    t.assert.snapshot(response.status());

    t.assert.snapshot(consoleMessages.map((message) => message.text()));

    t.assert.snapshot(pageErrors);
  });
});
