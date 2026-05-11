import { describe, it } from "node:test";
import { fileURLToPath } from "node:url";
import { expect } from "expect";
import webpack from "webpack";
import Server from "../../lib/Server.js";
import WebsocketServer from "../../lib/servers/WebsocketServer.js";
import defaultConfig from "../fixtures/provide-plugin-default/webpack.config.js";
import wsConfig from "../fixtures/provide-plugin-ws-config/webpack.config.js";
import runBrowser from "../helpers/run-browser.js";
import portsMap from "../ports-map.js";

const port = portsMap["server-and-client-transport"];

describe("server and client transport", () => {
  it('should use default web socket server ("ws")', async (t) => {
    const compiler = webpack(defaultConfig);
    const devServerOptions = {
      port,
    };
    const server = new Server(devServerOptions, compiler);

    await server.start();

    const { page, browser } = await runBrowser();

    try {
      const consoleMessages = [];

      page.on("console", (message) => {
        consoleMessages.push(message);
      });

      await page.goto(`http://localhost:${port}/`, {
        waitUntil: "networkidle0",
      });

      const isCorrectTransport = await page.evaluate(
        () => globalThis.injectedClient === globalThis.expectedClient,
      );

      expect(isCorrectTransport).toBe(true);
      t.assert.snapshot(consoleMessages.map((message) => message.text()));
    } finally {
      await browser.close();
      await server.stop();
    }
  });

  it('should use "ws" web socket server when specify "ws" value', async (t) => {
    const compiler = webpack(defaultConfig);
    const devServerOptions = {
      port,
      webSocketServer: "ws",
    };
    const server = new Server(devServerOptions, compiler);

    await server.start();

    const { page, browser } = await runBrowser();

    try {
      const consoleMessages = [];

      page.on("console", (message) => {
        consoleMessages.push(message);
      });

      await page.goto(`http://localhost:${port}/`, {
        waitUntil: "networkidle0",
      });

      const isCorrectTransport = await page.evaluate(
        () => globalThis.injectedClient === globalThis.expectedClient,
      );

      expect(isCorrectTransport).toBe(true);
      t.assert.snapshot(consoleMessages.map((message) => message.text()));
    } finally {
      await browser.close();
      await server.stop();
    }
  });

  it('should use "ws" web socket server when specify "ws" value using object', async (t) => {
    const compiler = webpack(defaultConfig);
    const devServerOptions = {
      port,
      webSocketServer: {
        type: "ws",
      },
    };
    const server = new Server(devServerOptions, compiler);

    await server.start();

    const { page, browser } = await runBrowser();

    try {
      const consoleMessages = [];

      page.on("console", (message) => {
        consoleMessages.push(message);
      });

      await page.goto(`http://localhost:${port}/`, {
        waitUntil: "networkidle0",
      });

      const isCorrectTransport = await page.evaluate(
        () => globalThis.injectedClient === globalThis.expectedClient,
      );

      expect(isCorrectTransport).toBe(true);
      t.assert.snapshot(consoleMessages.map((message) => message.text()));
    } finally {
      await browser.close();
      await server.stop();
    }
  });

  it("should use custom web socket server when specify class", async (t) => {
    const compiler = webpack(defaultConfig);
    const devServerOptions = {
      port,
      client: {
        webSocketTransport: "ws",
      },
      webSocketServer: WebsocketServer,
    };
    const server = new Server(devServerOptions, compiler);

    await server.start();

    const { page, browser } = await runBrowser();

    try {
      const consoleMessages = [];

      page.on("console", (message) => {
        consoleMessages.push(message);
      });

      await page.goto(`http://localhost:${port}/`, {
        waitUntil: "networkidle0",
      });

      const isCorrectTransport = await page.evaluate(
        () => globalThis.injectedClient === globalThis.expectedClient,
      );

      expect(isCorrectTransport).toBe(true);
      t.assert.snapshot(consoleMessages.map((message) => message.text()));
    } finally {
      await browser.close();
      await server.stop();
    }
  });

  it("should use custom web socket server when specify class using object", async (t) => {
    const compiler = webpack(defaultConfig);
    const devServerOptions = {
      port,
      client: {
        webSocketTransport: "ws",
      },
      webSocketServer: {
        type: WebsocketServer,
      },
    };
    const server = new Server(devServerOptions, compiler);

    await server.start();

    const { page, browser } = await runBrowser();

    try {
      const consoleMessages = [];

      page.on("console", (message) => {
        consoleMessages.push(message);
      });

      await page.goto(`http://localhost:${port}/`, {
        waitUntil: "networkidle0",
      });

      const isCorrectTransport = await page.evaluate(
        () => globalThis.injectedClient === globalThis.expectedClient,
      );

      expect(isCorrectTransport).toBe(true);
      t.assert.snapshot(consoleMessages.map((message) => message.text()));
    } finally {
      await browser.close();
      await server.stop();
    }
  });

  it("should use custom web socket server when specify path to class", async (t) => {
    const compiler = webpack(defaultConfig);
    const devServerOptions = {
      port,
      client: {
        webSocketTransport: "ws",
      },
      webSocketServer: fileURLToPath(import.meta.resolve("../../lib/servers/WebsocketServer.js")),
    };
    const server = new Server(devServerOptions, compiler);

    await server.start();

    const { page, browser } = await runBrowser();

    try {
      const consoleMessages = [];

      page.on("console", (message) => {
        consoleMessages.push(message);
      });

      await page.goto(`http://localhost:${port}/`, {
        waitUntil: "networkidle0",
      });

      const isCorrectTransport = await page.evaluate(
        () => globalThis.injectedClient === globalThis.expectedClient,
      );

      expect(isCorrectTransport).toBe(true);
      t.assert.snapshot(consoleMessages.map((message) => message.text()));
    } finally {
      await browser.close();
      await server.stop();
    }
  });

  it("should use custom web socket server when specify path to class using object", async (t) => {
    const compiler = webpack(defaultConfig);
    const devServerOptions = {
      port,
      client: {
        webSocketTransport: "ws",
      },
      webSocketServer: {
        type: fileURLToPath(import.meta.resolve("../../lib/servers/WebsocketServer.js")),
      },
    };
    const server = new Server(devServerOptions, compiler);

    await server.start();

    const { page, browser } = await runBrowser();

    try {
      const consoleMessages = [];

      page.on("console", (message) => {
        consoleMessages.push(message);
      });

      await page.goto(`http://localhost:${port}/`, {
        waitUntil: "networkidle0",
      });

      const isCorrectTransport = await page.evaluate(
        () => globalThis.injectedClient === globalThis.expectedClient,
      );

      expect(isCorrectTransport).toBe(true);
      t.assert.snapshot(consoleMessages.map((message) => message.text()));
    } finally {
      await browser.close();
      await server.stop();
    }
  });

  it("should throw an error on wrong path", async (t) => {
    expect.assertions(1);

    const compiler = webpack(defaultConfig);
    const devServerOptions = {
      port,
      webSocketServer: {
        type: "/bad/path/to/implementation",
      },
    };
    const server = new Server(devServerOptions, compiler);

    try {
      await server.start();
    } catch (error) {
      t.assert.snapshot(error.message);
    } finally {
      await server.stop();
    }
  });

  it('should use "ws" transport, when web socket server is not specify', async (t) => {
    const compiler = webpack(wsConfig);
    const devServerOptions = {
      port,
      client: {
        webSocketTransport: "ws",
      },
    };
    const server = new Server(devServerOptions, compiler);

    await server.start();

    const { page, browser } = await runBrowser();

    try {
      const consoleMessages = [];

      page.on("console", (message) => {
        consoleMessages.push(message);
      });

      await page.goto(`http://localhost:${port}/`, {
        waitUntil: "networkidle0",
      });

      const isCorrectTransport = await page.evaluate(
        () => globalThis.injectedClient === globalThis.expectedClient,
      );

      expect(isCorrectTransport).toBe(true);
      t.assert.snapshot(consoleMessages.map((message) => message.text()));
    } finally {
      await browser.close();
      await server.stop();
    }
  });

  it('should use "ws" transport and "ws" web socket server', async (t) => {
    const compiler = webpack(wsConfig);
    const devServerOptions = {
      port,
      client: {
        webSocketTransport: "ws",
      },
      webSocketServer: "ws",
    };
    const server = new Server(devServerOptions, compiler);

    await server.start();

    const { page, browser } = await runBrowser();

    try {
      const consoleMessages = [];

      page.on("console", (message) => {
        consoleMessages.push(message);
      });

      await page.goto(`http://localhost:${port}/`, {
        waitUntil: "networkidle0",
      });

      const isCorrectTransport = await page.evaluate(
        () => globalThis.injectedClient === globalThis.expectedClient,
      );

      expect(isCorrectTransport).toBe(true);
      t.assert.snapshot(consoleMessages.map((message) => message.text()));
    } finally {
      await browser.close();
      await server.stop();
    }
  });

  it("should throw an error on invalid path to server transport", async (t) => {
    const compiler = webpack(defaultConfig);
    const devServerOptions = {
      port,
      webSocketServer: {
        type: "invalid/path",
      },
    };
    const server = new Server(devServerOptions, compiler);
    try {
      await server.start();
      throw new Error("server.start() should have thrown");
    } catch (error) {
      t.assert.snapshot(error.message);
    } finally {
      await server.stop();
    }
  });

  it("should throw an error on invalid path to client transport", async (t) => {
    const compiler = webpack(defaultConfig);
    const devServerOptions = {
      port,
      client: {
        webSocketTransport: "invalid/path",
      },
    };
    const server = new Server(devServerOptions, compiler);
    try {
      await server.start();
      throw new Error("server.start() should have thrown");
    } catch (error) {
      t.assert.snapshot(error.message);
    } finally {
      await server.stop();
    }
  });
});
