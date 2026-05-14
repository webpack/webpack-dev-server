"use strict";

const os = require("node:os");
const path = require("node:path");
const { describe, it } = require("node:test");
const { expect } = require("expect");
const { spyOn } = require("jest-mock");
const webpack = require("webpack");
const WebSocket = require("ws");
const Server = require("../../lib/Server");
const config = require("../fixtures/client-config/webpack.config");
const multiCompilerConfig = require("../fixtures/multi-compiler-two-configurations/webpack.config");
const compile = require("../helpers/compile");
const runBrowser = require("../helpers/run-browser");
const port = require("../ports-map")["api-plugin"];
const [portA, portB] = require("../ports-map")["api-plugin-multi"];

describe("API (plugin)", () => {
  it("should work with plugin API", async (t) => {
    const compiler = webpack(config);
    const server = new Server({ port });

    server.apply(compiler);

    await compile(compiler, port);

    const { page, browser } = await runBrowser();

    const pageErrors = [];
    const consoleMessages = [];

    page
      .on("console", (message) => {
        consoleMessages.push(message);
      })
      .on("pageerror", (error) => {
        pageErrors.push(error);
      });

    await page.goto(`http://127.0.0.1:${port}/`, {
      waitUntil: "networkidle0",
    });

    t.assert.snapshot(consoleMessages.map((message) => message.text()));
    t.assert.snapshot(pageErrors);

    await browser.close();
    await new Promise((resolve) => {
      compiler.close(resolve);
    });
  });

  it("should not start the server multiple times on recompilation", async () => {
    const compiler = webpack(config);
    const server = new Server({ port });
    const setupSpy = spyOn(server, "setup");
    const listenSpy = spyOn(server, "listen");

    server.apply(compiler);

    const { watching } = await compile(compiler, port);

    // Trigger a recompilation by invalidating
    await new Promise((resolve) => {
      watching.invalidate(() => {
        resolve();
      });
    });

    // Wait for the recompilation to finish
    await new Promise((resolve) => {
      setTimeout(resolve, 2000);
    });

    expect(setupSpy).toHaveBeenCalledTimes(1);
    expect(listenSpy).toHaveBeenCalledTimes(1);

    setupSpy.mockRestore();
    listenSpy.mockRestore();
    await new Promise((resolve) => {
      compiler.close(resolve);
    });
  });

  it("should stop the server cleanly via compiler.close()", async () => {
    const compiler = webpack(config);
    const server = new Server({ port });
    const stopSpy = spyOn(server, "stop");

    server.apply(compiler);

    await compile(compiler, port);

    await new Promise((resolve) => {
      compiler.close(resolve);
    });

    expect(stopSpy).toHaveBeenCalledTimes(1);
    stopSpy.mockRestore();
  });

  it("should stay passive in build mode (compiler.run)", async () => {
    // The shared fixture writes output to "/", which would be unwritable
    // outside of webpack-dev-middleware's in-memory FS. Use a tmp dir so the
    // real `compiler.run()` can flush its assets.
    const compiler = webpack({
      ...config,
      output: {
        ...config.output,
        path: path.join(os.tmpdir(), `wds-build-mode-${Date.now()}`),
      },
    });
    const server = new Server({ port });
    const setupSpy = spyOn(server, "setup");
    const listenSpy = spyOn(server, "listen");

    server.apply(compiler);

    // `compiler.run()` is a one-shot build (no watch). The plugin must stay
    // passive so the build can finish and the process can exit normally.
    await new Promise((resolve, reject) => {
      compiler.run((error) => {
        if (error) reject(error);
        else resolve();
      });
    });

    expect(setupSpy).not.toHaveBeenCalled();
    expect(listenSpy).not.toHaveBeenCalled();

    setupSpy.mockRestore();
    listenSpy.mockRestore();
    await new Promise((resolve) => {
      compiler.close(resolve);
    });
  });

  it("should send 'invalid' to WebSocket clients when recompilation is triggered", async () => {
    const compiler = webpack(config);
    const server = new Server({ port });
    server.apply(compiler);

    const { watching } = await compile(compiler, port);

    const sawInvalid = await new Promise((resolve, reject) => {
      let initialOkSeen = false;
      const ws = new WebSocket(`ws://127.0.0.1:${port}/ws`, {
        headers: {
          host: `127.0.0.1:${port}`,
          origin: `http://127.0.0.1:${port}`,
        },
      });

      ws.on("error", reject);
      ws.on("message", (raw) => {
        const { type } = JSON.parse(raw.toString());
        // Wait for the initial "ok" (sent right after the WS handshake),
        // then trigger an invalidation. The server's `compiler.hooks.invalid`
        // tap should push an "invalid" message before the next compile
        // finishes.
        if (!initialOkSeen && type === "ok") {
          initialOkSeen = true;
          watching.invalidate();
          return;
        }
        if (type === "invalid") {
          ws.close();
          resolve(true);
        }
      });
    });

    expect(sawInvalid).toBe(true);

    await new Promise((resolve) => {
      compiler.close(resolve);
    });
  });

  it("should use constructor options instead of compiler.options.devServer", async () => {
    // Plugin reads its options from its constructor argument; values on
    // `compiler.options.devServer` are intentionally ignored. This protects
    // the documented contract.
    const compiler = webpack({
      ...config,
      // Pretend an unrelated `devServer` block exists in the user's config.
      // The plugin must not pick `port: portB` from it.
      devServer: { port: portB, host: "0.0.0.0" },
    });
    const server = new Server({ port: portA });
    server.apply(compiler);

    await compile(compiler, portA);

    const responseA = await fetch(`http://127.0.0.1:${portA}/`);
    expect(responseA.status).toBe(200);

    let portBReachable = true;
    try {
      await fetch(`http://127.0.0.1:${portB}/`);
    } catch {
      portBReachable = false;
    }
    expect(portBReachable).toBe(false);

    await new Promise((resolve) => {
      compiler.close(resolve);
    });
  });

  it("should propagate setup errors via the watch callback", async () => {
    const compiler = webpack(config);
    // Using a URL as `static.directory` throws inside `normalizeOptions`
    // during `setup()`. The rejection should bubble out through the
    // `beforeCompile.tapPromise` handler and reach `compiler.watch()`'s
    // user callback as an error.
    const server = new Server({
      port,
      static: "https://absolute-url.example/some/path",
    });
    server.apply(compiler);

    const error = await new Promise((resolve, reject) => {
      compiler.watch({}, (err) => {
        if (err) {
          resolve(err);
        } else {
          reject(new Error("expected setup to fail"));
        }
      });
    });

    expect(error.message).toMatch(
      /Using a URL as static.directory is not supported/,
    );

    await new Promise((resolve) => {
      compiler.close(resolve);
    });
  });

  describe("plugin in webpack config", () => {
    it("should work when added to webpack config plugins array", async (t) => {
      const server = new Server({ port });
      const compiler = webpack({
        ...config,
        plugins: [...config.plugins, server],
      });

      await compile(compiler, port);

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

        await page.goto(`http://127.0.0.1:${port}/`, {
          waitUntil: "networkidle0",
        });

        t.assert.snapshot(consoleMessages.map((message) => message.text()));
        t.assert.snapshot(pageErrors);
      } finally {
        await browser.close();
        await new Promise((resolve) => {
          compiler.close(resolve);
        });
      }
    });

    it("should work with output.clean: true", async (t) => {
      const server = new Server({ port });
      const compiler = webpack({
        ...config,
        output: {
          ...config.output,
          clean: true,
        },
        plugins: [...config.plugins, server],
      });

      await compile(compiler, port);

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

        const response = await page.goto(`http://127.0.0.1:${port}/`, {
          waitUntil: "networkidle0",
        });

        expect(response.status()).toBe(200);
        t.assert.snapshot(consoleMessages.map((message) => message.text()));
        t.assert.snapshot(pageErrors);
      } finally {
        await browser.close();
        await new Promise((resolve) => {
          compiler.close(resolve);
        });
      }
    });
  });

  describe("MultiCompiler", () => {
    it("should work with plugin API", async (t) => {
      const compiler = webpack(multiCompilerConfig);
      const server = new Server({ port });

      server.apply(compiler);

      await compile(compiler, port);

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

        const response = await page.goto(
          `http://127.0.0.1:${port}/one-main.html`,
          {
            waitUntil: "networkidle0",
          },
        );

        expect(response.status()).toBe(200);
        t.assert.snapshot(consoleMessages.map((message) => message.text()));
        t.assert.snapshot(pageErrors);
      } finally {
        await browser.close();
        await new Promise((resolve) => {
          compiler.close(resolve);
        });
      }
    });

    it("should call setup and listen once across all child compilers", async () => {
      const compiler = webpack(multiCompilerConfig);
      const server = new Server({ port });
      const setupSpy = spyOn(server, "setup");
      const listenSpy = spyOn(server, "listen");

      server.apply(compiler);

      await compile(compiler, port);

      expect(setupSpy).toHaveBeenCalledTimes(1);
      expect(listenSpy).toHaveBeenCalledTimes(1);

      setupSpy.mockRestore();
      listenSpy.mockRestore();
      await new Promise((resolve) => {
        compiler.close(resolve);
      });
    });

    it("should stop the server only once when all child compilers shut down", async () => {
      const compiler = webpack(multiCompilerConfig);
      const server = new Server({ port });
      const stopSpy = spyOn(server, "stop");

      server.apply(compiler);

      await compile(compiler, port);

      await new Promise((resolve) => {
        compiler.close(resolve);
      });

      expect(stopSpy).toHaveBeenCalledTimes(1);
      stopSpy.mockRestore();
    });

    it("should run two independent plugin servers on different child compilers", async () => {
      const serverA = new Server({ port: portA });
      const serverB = new Server({ port: portB });
      const [configA, configB] = multiCompilerConfig;
      const compiler = webpack([
        { ...configA, plugins: [...configA.plugins, serverA] },
        { ...configB, plugins: [...configB.plugins, serverB] },
      ]);

      await compile(compiler, portA);
      // The second server is independent, but `compile()` only awaits one
      // port, so poll the second one until it answers.
      await new Promise((resolve) => {
        const interval = setInterval(async () => {
          try {
            await fetch(`http://127.0.0.1:${portB}/`);
            clearInterval(interval);
            resolve();
          } catch {
            // Server not ready yet; keep polling.
          }
        }, 100);
      });

      const { page, browser } = await runBrowser();

      try {
        const responseA = await page.goto(
          `http://127.0.0.1:${portA}/one-main.html`,
          { waitUntil: "networkidle0" },
        );
        expect(responseA.status()).toBe(200);

        const responseB = await page.goto(
          `http://127.0.0.1:${portB}/two-main.html`,
          { waitUntil: "networkidle0" },
        );
        expect(responseB.status()).toBe(200);
      } finally {
        await browser.close();
        await new Promise((resolve) => {
          compiler.close(resolve);
        });
      }
    });
  });
});
