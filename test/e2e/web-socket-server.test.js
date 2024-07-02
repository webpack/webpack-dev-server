"use strict";

const webpack = require("webpack");
const { test } = require("@playwright/test");
const { describe } = require("@playwright/test");
const { expect } = require("@playwright/test");
const Server = require("../../lib/Server");
const config = require("../fixtures/client-config/webpack.config");
const sessionSubscribe = require("../helpers/session-subscribe");
const port = require("../ports-map")["web-socket-server-test"];

describe("web socket server", () => {
  test("should work allow to disable", async ({ page }) => {
    const devServerPort = port;

    const compiler = webpack(config);
    const devServerOptions = {
      webSocketServer: false,
      port: devServerPort,
    };
    const server = new Server(devServerOptions, compiler);

    await server.start();

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

      const webSocketRequests = [];
      const session = await page.context().newCDPSession(page);

      session.on("Network.webSocketCreated", (payload) => {
        webSocketRequests.push(payload);
      });

      await session.send("Target.setAutoAttach", {
        autoAttach: true,
        flatten: true,
        waitForDebuggerOnStart: true,
      });

      sessionSubscribe(session);

      await page.goto(`http://127.0.0.1:${port}/`, {
        waitUntil: "networkidle0",
      });

      expect(webSocketRequests).toHaveLength(0);
      expect(
        JSON.stringify(consoleMessages.map((message) => message.text())),
      ).toMatchSnapshot();
      expect(JSON.stringify(pageErrors)).toMatchSnapshot();
    } catch (error) {
      throw error;
    } finally {
      await server.stop();
    }
  });
});
