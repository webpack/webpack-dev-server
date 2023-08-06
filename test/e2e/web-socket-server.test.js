"use strict";

const webpack = require("webpack");
const Server = require("../../lib/Server");
const config = require("../fixtures/client-config/webpack.config");
const runBrowser = require("../helpers/run-browser");
const port = require("../ports-map")["web-socket-server-test"];

describe("web socket server", () => {
  it("should work allow to disable", async () => {
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

      const client = page._client();

      client.on("Network.webSocketCreated", (test) => {
        webSocketRequests.push(test);
      });

      await page.goto(`http://127.0.0.1:${port}/`, {
        waitUntil: "networkidle0",
      });

      expect(webSocketRequests).toHaveLength(0);
      expect(consoleMessages.map((message) => message.text())).toMatchSnapshot(
        "console messages"
      );
      expect(pageErrors).toMatchSnapshot("page errors");
    } catch (error) {
      throw error;
    } finally {
      await browser.close();
      await server.stop();
    }
  });
});
