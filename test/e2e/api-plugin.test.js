"use strict";

const webpack = require("webpack");
const Server = require("../../lib/Server");
const config = require("../fixtures/client-config/webpack.config");
const compile = require("../helpers/compile");
const runBrowser = require("../helpers/run-browser");
const port = require("../ports-map")["api-plugin"];

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
});
