"use strict";

const util = require("util");
const webpack = require("webpack");
const Server = require("../../lib/Server");
const config = require("../fixtures/client-config/webpack.config");
const runBrowser = require("../helpers/run-browser");
const port = require("../ports-map")["on-before-setup-middleware-option"];

describe("onBeforeSetupMiddleware option", () => {
  let compiler;
  let server;
  let page;
  let browser;
  let pageErrors;
  let consoleMessages;
  let utilSpy;

  beforeEach(async () => {
    compiler = webpack(config);

    utilSpy = jest.spyOn(util, "deprecate");

    server = new Server(
      {
        onBeforeSetupMiddleware: (devServer) => {
          if (!devServer) {
            throw new Error("webpack-dev-server is not defined");
          }

          devServer.app.get("/before/some/path", (_, response) => {
            response.send("before");
          });

          devServer.app.post("/before/some/path", (_, response) => {
            response.send("brefore POST");
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

  it("should handle GET request to /before/some/path route", async () => {
    page
      .on("console", (message) => {
        consoleMessages.push(message);
      })
      .on("pageerror", (error) => {
        pageErrors.push(error);
      });

    expect(utilSpy.mock.calls[0][1]).toBe(
      "'onBeforeSetupMiddleware' option is deprecated. Please use the 'setupMiddlewares' option."
    );

    const response = await page.goto(
      `http://127.0.0.1:${port}/before/some/path`,
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

  it("should handle POST request to /before/some/path route", async () => {
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

    expect(utilSpy.mock.calls[0][1]).toBe(
      "'onBeforeSetupMiddleware' option is deprecated. Please use the 'setupMiddlewares' option."
    );

    const response = await page.goto(
      `http://127.0.0.1:${port}/before/some/path`,
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
