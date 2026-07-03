import fs from "node:fs";
import http from "node:http";
import os from "node:os";
import path from "node:path";
import { afterEach, beforeEach, describe, it } from "node:test";
import { fileURLToPath } from "node:url";
import { expect } from "expect";
import { spyOn } from "jest-mock";
import webpack from "webpack";
import WebSocket from "ws";
import Server from "../../lib/Server.js";
import config from "../fixtures/client-config/webpack.config.js";
import multiCompilerConfig from "../fixtures/multi-compiler-two-configurations/webpack.config.js";
import reloadConfig from "../fixtures/reload-config/webpack.config.js";
import compile from "../helpers/compile.js";
import runBrowser from "../helpers/run-browser.js";
import portsMap from "../ports-map.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const port = portsMap["api-plugin"];
const [portA, portB] = portsMap["api-plugin-multi"];

const cssFilePath = path.resolve(
  __dirname,
  "../fixtures/reload-config/main.css",
);

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

  it("should tear down without error when the compiler is closed", async () => {
    // In plugin mode the host owns `watching`, so `stop()` must not call
    // `middleware.close()` — otherwise `compiler.close` surfaces a TypeError.
    const compiler = webpack(config);
    const server = new Server({ port });

    server.apply(compiler);

    await compile(compiler, port);

    const closeError = await new Promise((resolve) => {
      compiler.close((error) => resolve(error));
    });

    expect(closeError).toBeFalsy();
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

  it("should serve from the in-memory file system, not the real disk", async () => {
    // Point output at a real (but non-existent) tmp dir so we can assert that
    // nothing is flushed to it. The plugin must hand the compiler
    // webpack-dev-middleware's in-memory file system before the first build
    // writes anything.
    const outputPath = path.join(os.tmpdir(), `wds-plugin-memfs-${Date.now()}`);
    const compiler = webpack({
      ...config,
      output: {
        ...config.output,
        path: outputPath,
      },
    });
    const server = new Server({ port });

    server.apply(compiler);

    await compile(compiler, port);

    // `outputFileSystem` was swapped, so it is never the Node.js `fs`.
    expect(compiler.outputFileSystem).not.toBe(fs);

    // Assets live in memory...
    const inMemoryFiles = compiler.outputFileSystem.readdirSync(outputPath);
    expect(inMemoryFiles).toContain("main.js");
    expect(inMemoryFiles).toContain("index.html");

    // ...and the real disk stays untouched.
    expect(fs.existsSync(outputPath)).toBe(false);

    // It is also reachable over HTTP, proving the server reads from that same
    // in-memory file system.
    const response = await fetch(`http://127.0.0.1:${port}/main.js`);
    expect(response.status).toBe(200);

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

  it("should trigger a rebuild via `server.invalidate()` in plugin mode", async () => {
    const compiler = webpack(config);
    const server = new Server({ port });
    server.apply(compiler);

    await compile(compiler, port);

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

        if (!initialOkSeen && type === "ok") {
          initialOkSeen = true;
          // Must invalidate the host's `watching` (the middleware has none in
          // plugin mode) instead of throwing.
          server.invalidate();
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

  it("should trigger a rebuild via the /webpack-dev-server/invalidate route in plugin mode", async () => {
    const compiler = webpack(config);
    const server = new Server({ port });
    server.apply(compiler);

    await compile(compiler, port);

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

        if (!initialOkSeen && type === "ok") {
          initialOkSeen = true;
          // Hit the route as a browser would (same-origin, so it passes the
          // cross-origin check) — it must trigger a rebuild, not crash.
          http
            .get(
              `http://127.0.0.1:${port}/webpack-dev-server/invalidate`,
              {
                headers: {
                  host: `127.0.0.1:${port}`,
                  origin: `http://127.0.0.1:${port}`,
                },
              },
              (res) => res.resume(),
            )
            .on("error", reject);
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

  it("should invoke the callback after `server.invalidate()` rebuilds in plugin mode", async () => {
    const compiler = webpack(config);
    const server = new Server({ port });
    server.apply(compiler);

    await compile(compiler, port);

    // The callback fires once the invalidated build finishes.
    await new Promise((resolve) => {
      server.invalidate(resolve);
    });

    await new Promise((resolve) => {
      compiler.close(resolve);
    });
  });

  it("should invoke the callback when `server.invalidate()` runs with no active watching", async () => {
    const compiler = webpack(config);
    const server = new Server({ port });
    server.apply(compiler);

    // No `compiler.watch()` — there is no `watching`, so invalidate is a no-op
    // that still calls the callback.
    await new Promise((resolve) => {
      server.invalidate(resolve);
    });

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
    // `watchRun.tapPromise` handler and reach `compiler.watch()`'s
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

  it("should log a listen() failure instead of throwing", async () => {
    // The server is started from the `done` hook, which is a `SyncHook`, so
    // `listen()` runs detached. A failure there must be logged, not surface as
    // an unhandled rejection.
    const compiler = webpack(config);
    const server = new Server({ port });
    server.apply(compiler);

    const listenError = new Error("listen failed");
    const listenSpy = spyOn(server, "listen").mockImplementation(() =>
      Promise.reject(listenError),
    );
    const errorSpy = spyOn(server.logger, "error");

    await new Promise((resolve, reject) => {
      const timer = setTimeout(
        () => reject(new Error("listen error was not logged")),
        30000,
      );
      errorSpy.mockImplementation(() => {
        clearTimeout(timer);
        resolve();
      });
      compiler.watch({}, () => {});
    });

    expect(errorSpy).toHaveBeenCalledTimes(1);
    expect(errorSpy).toHaveBeenCalledWith(listenError);

    listenSpy.mockRestore();
    errorSpy.mockRestore();
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

    it("should serve rebuilt assets from memory with output.clean: true", async () => {
      // A dedicated, editable entry so a rebuild produces observably different
      // output. `output.clean` wipes the output directory before each build, so
      // this exercises that the fresh assets are written back to the in-memory
      // file system (and the stale ones are gone) rather than the real disk.
      const entryPath = path.join(
        os.tmpdir(),
        `wds-clean-entry-${Date.now()}.js`,
      );
      fs.writeFileSync(entryPath, 'globalThis.MARKER = "before-rebuild";\n');

      const server = new Server({ port });
      const compiler = webpack({
        ...config,
        entry: entryPath,
        output: {
          ...config.output,
          clean: true,
        },
        plugins: [...config.plugins, server],
      });

      await compile(compiler, port);

      try {
        const fetchBundle = async () => {
          const response = await fetch(`http://127.0.0.1:${port}/main.js`);
          return response.text();
        };

        // The first build is served from the in-memory file system.
        expect(await fetchBundle()).toContain("before-rebuild");

        // Edit the source and let the watcher rebuild it under `output.clean`.
        fs.writeFileSync(entryPath, 'globalThis.MARKER = "after-rebuild";\n');
        await new Promise((resolve, reject) => {
          const start = Date.now();
          const interval = setInterval(async () => {
            let bundle;
            try {
              bundle = await fetchBundle();
            } catch {
              return;
            }
            if (bundle.includes("after-rebuild")) {
              clearInterval(interval);
              resolve();
            } else if (Date.now() - start > 30000) {
              clearInterval(interval);
              reject(new Error("rebuild was not served in time"));
            }
          }, 200);
        });

        // The rebuilt bundle is served fresh and the stale build is gone.
        const rebuilt = await fetchBundle();
        expect(rebuilt).toContain("after-rebuild");
        expect(rebuilt).not.toContain("before-rebuild");

        // ...and it still lives in the in-memory file system, not the disk.
        expect(compiler.outputFileSystem).not.toBe(fs);
      } finally {
        await new Promise((resolve) => {
          compiler.close(resolve);
        });
        fs.unlinkSync(entryPath);
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

  describe("hot module replacement", () => {
    beforeEach(() => {
      fs.writeFileSync(
        cssFilePath,
        "body { background-color: rgb(0, 0, 255); }",
      );
    });

    afterEach(() => {
      fs.unlinkSync(cssFilePath);
    });

    it("should apply hot module replacement updates", async () => {
      const server = new Server({ port, hot: true });
      const compiler = webpack({
        ...reloadConfig,
        plugins: [...reloadConfig.plugins, server],
      });

      await compile(compiler, port);

      const { page, browser } = await runBrowser();

      try {
        const pageErrors = [];
        let doneHotUpdate = false;

        page
          .on("pageerror", (error) => {
            pageErrors.push(error);
          })
          .on("request", (request) => {
            if (/\.hot-update\.json$/.test(request.url())) {
              doneHotUpdate = true;
            }
          });

        await page.goto(`http://127.0.0.1:${port}/`, {
          waitUntil: "networkidle0",
        });

        const backgroundColorBefore = await page.evaluate(
          () => getComputedStyle(document.body)["background-color"],
        );

        expect(backgroundColorBefore).toBe("rgb(0, 0, 255)");

        fs.writeFileSync(
          cssFilePath,
          "body { background-color: rgb(255, 0, 0); }",
        );

        // The change must arrive through HMR (a `.hot-update.json` fetch),
        // not a full page reload.
        await page.waitForFunction(
          () =>
            getComputedStyle(document.body)["background-color"] ===
            "rgb(255, 0, 0)",
        );

        expect(doneHotUpdate).toBe(true);
        expect(pageErrors).toEqual([]);

        // The hot-update delta is served from webpack-dev-middleware's in-memory
        // file system, never the real disk.
        expect(compiler.outputFileSystem).not.toBe(fs);
        const outputFiles = compiler.outputFileSystem.readdirSync("/");
        expect(
          outputFiles.some((file) => /\.hot-update\.json$/.test(file)),
        ).toBe(true);
      } finally {
        await browser.close();
        await new Promise((resolve) => {
          compiler.close(resolve);
        });
      }
    });
  });
});
