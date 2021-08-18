"use strict";

const webpack = require("webpack");
const Server = require("../../lib/Server");
const config = require("../fixtures/client-config/webpack.config");
const runBrowser = require("../helpers/run-browser");
const port = require("../ports-map")["lazy-compilation"];

describe("lazy compilation", () => {
  // TODO jest freeze due webpack do not close `eventsource`, we should uncomment this after fix it on webpack side
  it.skip(`should work`, async () => {
    const compiler = webpack({
      ...config,
      experiments: {
        lazyCompilation: true,
      },
    });
    const server = new Server({ port }, compiler);

    await server.start();

    const { page, browser } = await runBrowser();

    const pageErrors = [];
    const consoleMessages = [];

    page
      .on("console", (message) => {
        consoleMessages.push(message.text());
      })
      .on("pageerror", (error) => {
        pageErrors.push(error);
      });

    await page.goto(`http://127.0.0.1:${port}/main`, {
      waitUntil: "domcontentloaded",
    });
    await new Promise((resolve) => {
      const interval = setInterval(() => {
        if (consoleMessages.includes("Hey.")) {
          clearInterval(interval);

          resolve();
        }
      }, 100);
    });

    expect(consoleMessages).toMatchSnapshot("console messages");
    expect(pageErrors).toMatchSnapshot("page errors");

    await browser.close();
    await server.stop();
  });
});
