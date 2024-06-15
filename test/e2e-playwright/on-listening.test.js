"use strict";

const webpack = require("webpack");
const { test } = require("@playwright/test");
const { describe } = require("@playwright/test");
const { expect } = require("@playwright/test");
const { beforeEach, afterEach } = require("@playwright/test");
const Server = require("../../lib/Server");
const config = require("../fixtures/client-config/webpack.config");
const port = require("../ports-map")["on-listening-option"];

describe("onListening option", () => {
  let compiler;
  let server;
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

    pageErrors = [];
    consoleMessages = [];
  });

  afterEach(async () => {
    await server.stop();
  });

  test("should handle GET request to /listening/some/path route", async ({ page }) => {
    page
      .on("console", (message) => {
        consoleMessages.push(message);
      })
      .on("pageerror", (error) => {
        pageErrors.push(error);
      });

    const response = await page.goto(
      `http://127.0.0.1:${port}/listening/some/path`,
      {
        waitUntil: "networkidle0",
      },
    );

    expect(onListeningIsRunning).toBe(true);

    expect(JSON.stringify(response.headers()["content-type"])).toMatchSnapshot();

    expect(JSON.stringify(response.status())).toMatchSnapshot();

    expect(JSON.stringify(await response.text())).toMatchSnapshot();

    expect(JSON.stringify(consoleMessages.map((message) => message.text()))).toMatchSnapshot();

    expect(JSON.stringify(pageErrors)).toMatchSnapshot();
  });

  test("should handle POST request to /listening/some/path route", async ({ page }) => {
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
      `http://127.0.0.1:${port}/listening/some/path`,
      {
        waitUntil: "networkidle0",
      },
    );

    expect(onListeningIsRunning).toBe(true);

    expect(JSON.stringify(response.headers()["content-type"])).toMatchSnapshot();

    expect(JSON.stringify(response.status())).toMatchSnapshot();

    expect(JSON.stringify(await response.text())).toMatchSnapshot();

    expect(JSON.stringify(consoleMessages.map((message) => message.text()))).toMatchSnapshot();

    expect(JSON.stringify(pageErrors)).toMatchSnapshot();
  });
});
