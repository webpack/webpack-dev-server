"use strict";

const webpack = require("webpack");
const Server = require("../../lib/Server");
const config = require("../fixtures/universal-compiler-config/webpack.config");
const runBrowser = require("../helpers/run-browser");
const port = require("../ports-map")["universal-compiler"];

describe("universal compiler", () => {
  it("client bundle should have the inlined the client runtime", async () => {
    const compiler = webpack(config);
    const devServerOptions = {
      port,
    };
    const server = new Server(devServerOptions, compiler);

    await server.start();

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

    const response = await page.goto(`http://127.0.0.1:${port}/client.js`, {
      waitUntil: "networkidle0",
    });

    const responseText = await response.text();

    expect(responseText).toContain("Hello from the client");
    expect(responseText).toContain("WebsocketClient");

    expect(consoleMessages.map((message) => message.text())).toMatchSnapshot(
      "console messages"
    );

    expect(pageErrors).toMatchSnapshot("page errors");

    await browser.close();
    await server.stop();
  });

  it("server bundle should NOT have the inlined the client runtime", async () => {
    // we wouldn't normally request a server bundle
    // but we'll do it here to check the contents
    const compiler = webpack(config);
    const devServerOptions = {
      port,
    };
    const server = new Server(devServerOptions, compiler);

    await server.start();

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

    const response = await page.goto(`http://127.0.0.1:${port}/server.js`, {
      waitUntil: "networkidle0",
    });

    const responseText = await response.text();

    expect(responseText).toContain("Hello from the server");
    expect(responseText).not.toContain("WebsocketServer");

    expect(consoleMessages.map((message) => message.text())).toMatchSnapshot(
      "console messages"
    );

    expect(pageErrors).toMatchSnapshot("page errors");

    await browser.close();
    await server.stop();
  });
});
