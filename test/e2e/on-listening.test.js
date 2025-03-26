"use strict";

const webpack = require("webpack");
const Server = require("../../lib/Server");
const config = require("../fixtures/client-config/webpack.config");
const runBrowser = require("../helpers/run-browser");
const port = require("../ports-map")["on-listening-option"];

describe("onListening option", () => {
  let compiler;
  let server;
  let page;
  let browser;
  let pageErrors;
  let consoleMessages;
  let onListeningIsRunning = false;

  beforeEach(async () => {
    compiler = webpack(config);
    server = new Server(
      {
        onListening: (devServer) => {
          if (!devServer) {
            throw new Error("webpack-dev-server is not defined");
          }

          onListeningIsRunning = true;

          devServer.app.use("/listening/some/path", (req, res, next) => {
            if (req.method === "GET") {
              res.setHeader("Content-Type", "text/html; charset=utf-8");
              res.end("listening");
              return;
            } else if (req.method === "POST") {
              res.setHeader("Content-Type", "text/html; charset=utf-8");
              res.end("listening POST");
              return;
            }

            return next();
          });
        },
        port,
      },
      compiler,
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

  it("should handle GET request to /listening/some/path route", async () => {
    page
      .on("console", (message) => {
        consoleMessages.push(message);
      })
      .on("pageerror", (error) => {
        pageErrors.push(error);
      });

    const response = await page.goto(
      `http://localhost:${port}/listening/some/path`,
      {
        waitUntil: "networkidle0",
      },
    );

    expect(onListeningIsRunning).toBe(true);

    expect(response.headers()["content-type"]).toMatchSnapshot(
      "response headers content-type",
    );

    expect(response.status()).toMatchSnapshot("response status");

    expect(await response.text()).toMatchSnapshot("response text");

    expect(consoleMessages.map((message) => message.text())).toMatchSnapshot(
      "console messages",
    );

    expect(pageErrors).toMatchSnapshot("page errors");
  });

  it("should handle POST request to /listening/some/path route", async () => {
    await page.setRequestInterception(true);

    page
      .on("console", (message) => {
        consoleMessages.push(message);
      })
      .on("pageerror", (error) => {
        pageErrors.push(error);
      })
      .on("request", (interceptedRequest) => {
        if (interceptedRequest.isInterceptResolutionHandled()) return;

        interceptedRequest.continue({ method: "POST" });
      });

    const response = await page.goto(
      `http://localhost:${port}/listening/some/path`,
      {
        waitUntil: "networkidle0",
      },
    );

    expect(onListeningIsRunning).toBe(true);

    expect(response.headers()["content-type"]).toMatchSnapshot(
      "response headers content-type",
    );

    expect(response.status()).toMatchSnapshot("response status");

    expect(await response.text()).toMatchSnapshot("response text");

    expect(consoleMessages.map((message) => message.text())).toMatchSnapshot(
      "console messages",
    );

    expect(pageErrors).toMatchSnapshot("page errors");
  });
});
