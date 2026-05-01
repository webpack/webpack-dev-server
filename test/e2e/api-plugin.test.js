"use strict";

const webpack = require("webpack");
const Server = require("../../lib/Server");
const config = require("../fixtures/client-config/webpack.config");
const multiCompilerConfig = require("../fixtures/multi-compiler-two-configurations/webpack.config");
const compile = require("../helpers/compile");
const runBrowser = require("../helpers/run-browser");
const port = require("../ports-map")["api-plugin"];
const [portA, portB] = require("../ports-map")["api-plugin-multi"];

describe("API (plugin)", () => {
  it("should work with plugin API", async () => {
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

    expect(consoleMessages.map((message) => message.text())).toMatchSnapshot(
      "console messages",
    );
    expect(pageErrors).toMatchSnapshot("page errors");

    await browser.close();
    await new Promise((resolve) => {
      compiler.close(resolve);
    });
  });

  it("should not start the server multiple times on recompilation", async () => {
    const compiler = webpack(config);
    const server = new Server({ port });
    const setupSpy = jest.spyOn(server, "setup");
    const listenSpy = jest.spyOn(server, "listen");

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
    const stopSpy = jest.spyOn(server, "stop");

    server.apply(compiler);

    await compile(compiler, port);

    await new Promise((resolve) => {
      compiler.close(resolve);
    });

    expect(stopSpy).toHaveBeenCalledTimes(1);
    stopSpy.mockRestore();
  });

  describe("plugin in webpack config", () => {
    it("should work when added to webpack config plugins array", async () => {
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

        expect(
          consoleMessages.map((message) => message.text()),
        ).toMatchSnapshot("console messages");
        expect(pageErrors).toMatchSnapshot("page errors");
      } finally {
        await browser.close();
        await new Promise((resolve) => {
          compiler.close(resolve);
        });
      }
    });

    it("should work with output.clean: true", async () => {
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
        expect(
          consoleMessages.map((message) => message.text()),
        ).toMatchSnapshot("console messages");
        expect(pageErrors).toMatchSnapshot("page errors");
      } finally {
        await browser.close();
        await new Promise((resolve) => {
          compiler.close(resolve);
        });
      }
    });
  });

  describe("MultiCompiler", () => {
    it("should work with plugin API", async () => {
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
        expect(
          consoleMessages.map((message) => message.text()),
        ).toMatchSnapshot("console messages");
        expect(pageErrors).toMatchSnapshot("page errors");
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
      const setupSpy = jest.spyOn(server, "setup");
      const listenSpy = jest.spyOn(server, "listen");

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
      const stopSpy = jest.spyOn(server, "stop");

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

    it("should stay passive when a standalone server runs on the same compiler", async () => {
      const compiler = webpack(config);
      const pluginServer = new Server({ port });
      const standaloneServer = new Server({ port }, compiler);

      const pluginSetupSpy = jest.spyOn(pluginServer, "setup");
      const pluginListenSpy = jest.spyOn(pluginServer, "listen");

      pluginServer.apply(compiler);
      await standaloneServer.start();

      try {
        // The standalone server drives compilation through its own
        // webpack-dev-middleware. The plugin's hooks fire during that
        // compilation but must stay passive — so the plugin's own setup() and
        // listen() are never called.
        expect(pluginSetupSpy).not.toHaveBeenCalled();
        expect(pluginListenSpy).not.toHaveBeenCalled();
      } finally {
        pluginSetupSpy.mockRestore();
        pluginListenSpy.mockRestore();
        await standaloneServer.stop();
        await pluginServer.stop();
      }
    });
  });
});
