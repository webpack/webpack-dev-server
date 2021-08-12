"use strict";

const webpack = require("webpack");
const Server = require("../../lib/Server");
const config = require("../fixtures/client-config/webpack.config");
const runBrowser = require("../helpers/run-browser");
const port = require("../ports-map").api;

describe("API", () => {
  it(`should work with async API`, async () => {
    const compiler = webpack(config);
    const server = new Server({ host: "127.0.0.1", port }, compiler);

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
    await server.stop();
  });

  it(`should work with callback API`, async () => {
    const compiler = webpack(config);
    const server = new Server({ host: "127.0.0.1", port }, compiler);

    await new Promise((resolve) => {
      server.startCallback(() => {
        resolve();
      });
    });

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
    await new Promise((resolve) => {
      server.stopCallback(() => {
        resolve();
      });
    });
  });

  it(`should work with deprecated API`, async () => {
    const compiler = webpack(config);
    const devServerOptions = { host: "127.0.0.1", port };
    const server = new Server(devServerOptions, compiler);

    await new Promise((resolve, reject) => {
      server.listen(devServerOptions.port, devServerOptions.host, (error) => {
        if (error) {
          reject(error);

          return;
        }

        resolve();
      });
    });

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
    await new Promise((resolve) => {
      server.close(() => {
        resolve();
      });
    });
  });
});
