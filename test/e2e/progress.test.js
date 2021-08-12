"use strict";

const fs = require("fs");
const path = require("path");
const webpack = require("webpack");
const Server = require("../../lib/Server");
const reloadConfig = require("../fixtures/reload-config-2/webpack.config");
const runBrowser = require("../helpers/run-browser");
const port = require("../ports-map").progress;

const cssFilePath = path.resolve(
  __dirname,
  "../fixtures/reload-config-2/main.css"
);

describe("progress", () => {
  it("should work and log progress in a browser console", async () => {
    fs.writeFileSync(cssFilePath, "body { background-color: rgb(0, 0, 255); }");

    const compiler = webpack(reloadConfig);
    const devServerOptions = {
      port,
      host: "0.0.0.0",
      static: false,
      hot: true,
      client: {
        progress: true,
      },
    };
    const server = new Server(devServerOptions, compiler);

    await server.start();

    const { page, browser } = await runBrowser();

    const consoleMessages = [];

    let doHotUpdate = false;

    page
      .on("console", (message) => {
        consoleMessages.push(message);
      })
      .on("request", (requestObj) => {
        if (/\.hot-update\.(json|js)$/.test(requestObj.url())) {
          doHotUpdate = true;
        }
      });

    await page.goto(`http://localhost:${port}/main`, {
      waitUntil: "networkidle0",
    });

    fs.writeFileSync(cssFilePath, "body { background-color: rgb(255, 0, 0); }");

    await new Promise((resolve) => {
      const timer = setInterval(() => {
        if (doHotUpdate) {
          clearInterval(timer);

          resolve();
        }
      }, 100);
    });

    await browser.close();

    const progressConsoleMessage = consoleMessages.filter((message) =>
      /^\[webpack-dev-server\] (\[[a-zA-Z]+\] )?[0-9]{1,3}% - /.test(
        message.text()
      )
    );

    expect(progressConsoleMessage.length > 0).toBe(true);

    fs.unlinkSync(cssFilePath);

    await server.stop();
  });
});
