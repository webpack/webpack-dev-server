"use strict";

const { describe, it } = require("node:test");
const { expect } = require("expect");
const webpack = require("webpack");
const Server = require("../../lib/Server");
const config = require("../fixtures/client-config/webpack.config");
const runBrowser = require("../helpers/run-browser");
const sessionSubscribe = require("../helpers/session-subscribe");
const port = require("../ports-map")["web-socket-server-test"];

describe("web socket server", () => {
  it("should work allow to disable", async (t) => {
    const devServerPort = port;

    const compiler = webpack(config);
    const devServerOptions = {
      webSocketServer: false,
      port: devServerPort,
    };
    const server = new Server(devServerOptions, compiler);

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

      const webSocketRequests = [];
      const session = await page.createCDPSession();

      await session.send("Target.setAutoAttach", {
        autoAttach: true,
        flatten: true,
        waitForDebuggerOnStart: true,
      });

      await sessionSubscribe(session);

      session.on("Network.webSocketCreated", (test) => {
        webSocketRequests.push(test);
      });

      await page.goto(`http://localhost:${port}/`, {
        waitUntil: "networkidle0",
      });

      expect(webSocketRequests).toHaveLength(0);
      await t.test("console messages", async (t) =>
        t.assert.snapshot(consoleMessages.map((message) => message.text())),
      );
      await t.test("page errors", async (t) => t.assert.snapshot(pageErrors));
    } finally {
      await browser.close();
      await server.stop();
    }
  });
});
