"use strict";

const webpack = require("webpack");
const Server = require("../../lib/Server");
const config = require("../fixtures/multi-compiler-config/webpack.config");
const runBrowser = require("../helpers/run-browser");
const port = require("../ports-map")["multi-compiler"];

describe("Multi compiler", () => {
  it(`should work with multiple compilers`, async () => {
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

    await page.goto(`http://127.0.0.1:${port}/main`, {
      waitUntil: "networkidle0",
    });

    expect(consoleMessages.map((message) => message.text())).toMatchSnapshot(
      "console messages"
    );

    expect(pageErrors).toMatchSnapshot("page errors");

    await browser.close();
    await server.close();
  });
});
