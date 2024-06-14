"use strict";

const webpack = require("webpack");
const { test } = require("@playwright/test");
const { describe } = require("@playwright/test");
const { expect } = require("@playwright/test");
const Server = require("../../lib/Server");
const WebsocketServer = require("../../lib/servers/WebsocketServer");
const defaultConfig = require("../fixtures/provide-plugin-default/webpack.config");
const sockjsConfig = require("../fixtures/provide-plugin-sockjs-config/webpack.config");
const wsConfig = require("../fixtures/provide-plugin-ws-config/webpack.config");
const customConfig = require("../fixtures/provide-plugin-custom/webpack.config");
const port = require("../ports-map")["server-and-client-transport"];

describe("server and client transport", () => {
  test('should use default web socket server ("ws")', async ({ page }) => {
    const compiler = webpack(defaultConfig);
    const devServerOptions = {
      port,
    };
    const server = new Server(devServerOptions, compiler);

    await server.start();

    try {
      const consoleMessages = [];

      page.on("console", (message) => {
        consoleMessages.push(message);
      });

      await page.goto(`http://localhost:${port}/`, {
        waitUntil: "networkidle0",
      });

      const isCorrectTransport = await page.evaluate(
        // eslint-disable-next-line no-undef
        () => window.injectedClient === window.expectedClient,
      );

      expect(isCorrectTransport).toBe(true);
      expect(
        JSON.stringify(consoleMessages.map((message) => message.text())),
      ).toMatchSnapshot();
    } catch (error) {
      throw error;
    } finally {
      await server.stop();
    }
  });

  test('should use "ws" web socket server when specify "ws" value', async ({
    page,
  }) => {
    const compiler = webpack(defaultConfig);
    const devServerOptions = {
      port,
      webSocketServer: "ws",
    };
    const server = new Server(devServerOptions, compiler);

    await server.start();

    try {
      const consoleMessages = [];

      page.on("console", (message) => {
        consoleMessages.push(message);
      });

      await page.goto(`http://localhost:${port}/`, {
        waitUntil: "networkidle0",
      });

      const isCorrectTransport = await page.evaluate(
        // eslint-disable-next-line no-undef
        () => window.injectedClient === window.expectedClient,
      );

      expect(isCorrectTransport).toBe(true);
      expect(
        JSON.stringify(consoleMessages.map((message) => message.text())),
      ).toMatchSnapshot();
    } catch (error) {
      throw error;
    } finally {
      await server.stop();
    }
  });

  test('should use "ws" web socket server when specify "ws" value using object', async ({
    page,
  }) => {
    const compiler = webpack(defaultConfig);
    const devServerOptions = {
      port,
      webSocketServer: {
        type: "ws",
      },
    };
    const server = new Server(devServerOptions, compiler);

    await server.start();

    try {
      const consoleMessages = [];

      page.on("console", (message) => {
        consoleMessages.push(message);
      });

      await page.goto(`http://localhost:${port}/`, {
        waitUntil: "networkidle0",
      });

      const isCorrectTransport = await page.evaluate(
        // eslint-disable-next-line no-undef
        () => window.injectedClient === window.expectedClient,
      );

      expect(isCorrectTransport).toBe(true);
      expect(
        JSON.stringify(consoleMessages.map((message) => message.text())),
      ).toMatchSnapshot();
    } catch (error) {
      throw error;
    } finally {
      await server.stop();
    }
  });

  test('should use "sockjs" web socket server when specify "sockjs" value', async ({
    page,
  }) => {
    const compiler = webpack(sockjsConfig);
    const devServerOptions = {
      port,
      webSocketServer: "sockjs",
    };
    const server = new Server(devServerOptions, compiler);

    await server.start();

    try {
      const consoleMessages = [];

      page.on("console", (message) => {
        consoleMessages.push(message);
      });

      await page.goto(`http://localhost:${port}/`, {
        waitUntil: "networkidle0",
      });

      const isCorrectTransport = await page.evaluate(
        // eslint-disable-next-line no-undef
        () => window.injectedClient === window.expectedClient,
      );

      expect(isCorrectTransport).toBe(true);
      expect(
        JSON.stringify(consoleMessages.map((message) => message.text())),
      ).toMatchSnapshot();
    } catch (error) {
      throw error;
    } finally {
      await server.stop();
    }
  });

  test('should use "sockjs" web socket server when specify "sockjs" value using object', async ({
    page,
  }) => {
    const compiler = webpack(sockjsConfig);
    const devServerOptions = {
      port,
      webSocketServer: {
        type: "sockjs",
      },
    };
    const server = new Server(devServerOptions, compiler);

    await server.start();

    try {
      const consoleMessages = [];

      page.on("console", (message) => {
        consoleMessages.push(message);
      });

      await page.goto(`http://localhost:${port}/`, {
        waitUntil: "networkidle0",
      });

      const isCorrectTransport = await page.evaluate(
        // eslint-disable-next-line no-undef
        () => window.injectedClient === window.expectedClient,
      );

      expect(isCorrectTransport).toBe(true);
      expect(
        JSON.stringify(consoleMessages.map((message) => message.text())),
      ).toMatchSnapshot();
    } catch (error) {
      throw error;
    } finally {
      await server.stop();
    }
  });

  test("should use custom web socket server when specify class", async ({
    page,
  }) => {
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

    try {
      const consoleMessages = [];

      page.on("console", (message) => {
        consoleMessages.push(message);
      });

      await page.goto(`http://localhost:${port}/`, {
        waitUntil: "networkidle0",
      });

      const isCorrectTransport = await page.evaluate(
        // eslint-disable-next-line no-undef
        () => window.injectedClient === window.expectedClient,
      );

      expect(isCorrectTransport).toBe(true);
      expect(
        JSON.stringify(consoleMessages.map((message) => message.text())),
      ).toMatchSnapshot();
    } catch (error) {
      throw error;
    } finally {
      await server.stop();
    }
  });

  test("should use custom web socket server when specify class using object", async ({
    page,
  }) => {
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

    try {
      const consoleMessages = [];

      page.on("console", (message) => {
        consoleMessages.push(message);
      });

      await page.goto(`http://localhost:${port}/`, {
        waitUntil: "networkidle0",
      });

      const isCorrectTransport = await page.evaluate(
        // eslint-disable-next-line no-undef
        () => window.injectedClient === window.expectedClient,
      );

      expect(isCorrectTransport).toBe(true);
      expect(
        JSON.stringify(consoleMessages.map((message) => message.text())),
      ).toMatchSnapshot();
    } catch (error) {
      throw error;
    } finally {
      await server.stop();
    }
  });

  test("should use custom web socket server when specify path to class", async ({
    page,
  }) => {
    const compiler = webpack(defaultConfig);
    const devServerOptions = {
      port,
      client: {
        webSocketTransport: "ws",
      },
      webSocketServer: require.resolve("../../lib/servers/WebsocketServer"),
    };
    const server = new Server(devServerOptions, compiler);

    await server.start();

    try {
      const consoleMessages = [];

      page.on("console", (message) => {
        consoleMessages.push(message);
      });

      await page.goto(`http://localhost:${port}/`, {
        waitUntil: "networkidle0",
      });

      const isCorrectTransport = await page.evaluate(
        // eslint-disable-next-line no-undef
        () => window.injectedClient === window.expectedClient,
      );

      expect(isCorrectTransport).toBe(true);
      expect(
        JSON.stringify(consoleMessages.map((message) => message.text())),
      ).toMatchSnapshot();
    } catch (error) {
      throw error;
    } finally {
      await server.stop();
    }
  });

  test("should use custom web socket server when specify path to class using object", async ({
    page,
  }) => {
    const compiler = webpack(defaultConfig);
    const devServerOptions = {
      port,
      client: {
        webSocketTransport: "ws",
      },
      webSocketServer: {
        type: require.resolve("../../lib/servers/WebsocketServer"),
      },
    };
    const server = new Server(devServerOptions, compiler);

    await server.start();

    try {
      const consoleMessages = [];

      page.on("console", (message) => {
        consoleMessages.push(message);
      });

      await page.goto(`http://localhost:${port}/`, {
        waitUntil: "networkidle0",
      });

      const isCorrectTransport = await page.evaluate(
        // eslint-disable-next-line no-undef
        () => window.injectedClient === window.expectedClient,
      );

      expect(isCorrectTransport).toBe(true);
      expect(
        JSON.stringify(consoleMessages.map((message) => message.text())),
      ).toMatchSnapshot();
    } catch (error) {
      throw error;
    } finally {
      await server.stop();
    }
  });

  test("should throw an error on wrong path", async () => {
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
      expect(JSON.stringify(error.message)).toMatchSnapshot();
    } finally {
      await server.stop();
    }
  });

  test('should use "sockjs" transport, when web socket server is not specify', async ({
    page,
  }) => {
    const compiler = webpack(sockjsConfig);
    const devServerOptions = {
      port,
      client: {
        webSocketTransport: "sockjs",
      },
    };
    const server = new Server(devServerOptions, compiler);

    await server.start();

    try {
      const consoleMessages = [];

      page.on("console", (message) => {
        consoleMessages.push(message);
      });

      await page.goto(`http://localhost:${port}/main.js`, {
        waitUntil: "networkidle0",
      });

      const isCorrectTransport = await page.evaluate(
        // eslint-disable-next-line no-undef
        () => window.injectedClient === window.expectedClient,
      );

      expect(isCorrectTransport).toBe(true);
      expect(
        JSON.stringify(consoleMessages.map((message) => message.text())),
      ).toMatchSnapshot();
    } catch (error) {
      throw error;
    } finally {
      await server.stop();
    }
  });

  test('should use "ws" transport, when web socket server is not specify', async ({
    page,
  }) => {
    const compiler = webpack(wsConfig);
    const devServerOptions = {
      port,
      client: {
        webSocketTransport: "ws",
      },
    };
    const server = new Server(devServerOptions, compiler);

    await server.start();

    try {
      const consoleMessages = [];

      page.on("console", (message) => {
        consoleMessages.push(message);
      });

      await page.goto(`http://localhost:${port}/`, {
        waitUntil: "networkidle0",
      });

      const isCorrectTransport = await page.evaluate(
        // eslint-disable-next-line no-undef
        () => window.injectedClient === window.expectedClient,
      );

      expect(isCorrectTransport).toBe(true);
      expect(
        JSON.stringify(consoleMessages.map((message) => message.text())),
      ).toMatchSnapshot();
    } catch (error) {
      throw error;
    } finally {
      await server.stop();
    }
  });

  test('should use "sockjs" transport and "sockjs" web socket server', async ({
    page,
  }) => {
    const compiler = webpack(sockjsConfig);
    const devServerOptions = {
      port,
      client: {
        webSocketTransport: "sockjs",
      },
      webSocketServer: "sockjs",
    };
    const server = new Server(devServerOptions, compiler);

    await server.start();

    try {
      const consoleMessages = [];

      page.on("console", (message) => {
        consoleMessages.push(message);
      });

      await page.goto(`http://localhost:${port}/`, {
        waitUntil: "networkidle0",
      });

      const isCorrectTransport = await page.evaluate(
        // eslint-disable-next-line no-undef
        () => window.injectedClient === window.expectedClient,
      );

      expect(isCorrectTransport).toBe(true);
      expect(
        JSON.stringify(consoleMessages.map((message) => message.text())),
      ).toMatchSnapshot();
    } catch (error) {
      throw error;
    } finally {
      await server.stop();
    }
  });

  test('should use "ws" transport and "ws" web socket server', async ({
    page,
  }) => {
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

    try {
      const consoleMessages = [];

      page.on("console", (message) => {
        consoleMessages.push(message);
      });

      await page.goto(`http://localhost:${port}/`, {
        waitUntil: "networkidle0",
      });

      const isCorrectTransport = await page.evaluate(
        // eslint-disable-next-line no-undef
        () => window.injectedClient === window.expectedClient,
      );

      expect(isCorrectTransport).toBe(true);
      expect(
        JSON.stringify(consoleMessages.map((message) => message.text())),
      ).toMatchSnapshot();
    } catch (error) {
      throw error;
    } finally {
      await server.stop();
    }
  });

  test('should use custom transport and "sockjs" web socket server', async ({
    page,
  }) => {
    const compiler = webpack(customConfig);
    const devServerOptions = {
      port,
      client: {
        webSocketTransport: require.resolve(
          "../fixtures/custom-client/CustomSockJSClient",
        ),
      },
      webSocketServer: "sockjs",
    };
    const server = new Server(devServerOptions, compiler);

    await server.start();

    try {
      const consoleMessages = [];

      page.on("console", (message) => {
        consoleMessages.push(message);
      });

      await page.goto(`http://localhost:${port}/`, {
        waitUntil: "networkidle0",
      });

      const isCorrectTransport = await page.evaluate(
        // eslint-disable-next-line no-undef
        () => window.injectedClient === window.expectedClient,
      );

      expect(isCorrectTransport).toBe(true);
      expect(
        JSON.stringify(consoleMessages.map((message) => message.text())),
      ).toMatchSnapshot();
    } catch (error) {
      throw error;
    } finally {
      await server.stop();
    }
  });

  test("should throw an error on invalid path to server transport", async () => {
    const compiler = webpack(defaultConfig);
    const devServerOptions = {
      port,
      webSocketServer: {
        type: "invalid/path",
      },
    };
    const server = new Server(devServerOptions, compiler);
    await expect(async () => {
      await server.start();
    }).rejects.toThrowError();

    await server.stop();
  });

  test("should throw an error on invalid path to client transport", async () => {
    const compiler = webpack(defaultConfig);
    const devServerOptions = {
      port,
      client: {
        webSocketTransport: "invalid/path",
      },
    };
    const server = new Server(devServerOptions, compiler);
    await expect(async () => {
      await server.start();
    }).rejects.toThrowError();

    await server.stop();
  });
});
