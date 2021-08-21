"use strict";

const webpack = require("webpack");
const Server = require("../../lib/Server");
const config = require("../fixtures/client-config/webpack.config");
const runBrowser = require("../helpers/run-browser");
const port = require("../ports-map")["on-after-setup-middleware-option"];

describe("onAfterSetupMiddleware option", () => {
  let compiler;
  let server;
  let page;
  let browser;
  let pageErrors;
  let consoleMessages;

  beforeEach(async () => {
    compiler = webpack(config);
    server = new Server(
      {
        onAfterSetupMiddleware: (devServer) => {
          if (!devServer) {
            throw new Error("webpack-dev-server is not defined");
          }

          devServer.app.get("/after/some/path", (_, response) => {
            response.send("after");
          });

          devServer.app.post("/after/some/path", (_, response) => {
            response.send("after POST");
          });
        },
        port,
      },
      compiler
    );

    await server.start();

    ({ page, browser } = await runBrowser());

    pageErrors = [];
    consoleMessages = [];
  });

  afterEach(async () => {
    await browser.close();
    await server.stop();
  });

  it("should handle GET request to /after/some/path route", async () => {
    page
      .on("console", (message) => {
        consoleMessages.push(message);
      })
      .on("pageerror", (error) => {
        pageErrors.push(error);
      });

    const response = await page.goto(
      `http://127.0.0.1:${port}/after/some/path`,
      {
        waitUntil: "networkidle0",
      }
    );

    expect(response.headers()["content-type"]).toMatchSnapshot(
      "response headers content-type"
    );

    expect(response.status()).toMatchSnapshot("response status");

    expect(await response.text()).toMatchSnapshot("response text");

    expect(consoleMessages.map((message) => message.text())).toMatchSnapshot(
      "console messages"
    );

    expect(pageErrors).toMatchSnapshot("page errors");
  });

  it("should handle POST request to /after/some/path route", async () => {
    await page.setRequestInterception(true);

    page
      .on("console", (message) => {
        consoleMessages.push(message);
      })
      .on("pageerror", (error) => {
        pageErrors.push(error);
      })
      .on("request", (interceptedRequest) => {
        interceptedRequest.continue({ method: "POST" });
      });

    const response = await page.goto(
      `http://127.0.0.1:${port}/after/some/path`,
      {
        waitUntil: "networkidle0",
      }
    );

    expect(response.headers()["content-type"]).toMatchSnapshot(
      "response headers content-type"
    );

    expect(response.status()).toMatchSnapshot("response status");

    expect(await response.text()).toMatchSnapshot("response text");

    expect(consoleMessages.map((message) => message.text())).toMatchSnapshot(
      "console messages"
    );

    expect(pageErrors).toMatchSnapshot("page errors");
  });
});
