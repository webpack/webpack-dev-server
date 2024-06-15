"use strict";

const webpack = require("webpack");
const { test } = require("@playwright/test");
const { expect } = require("@playwright/test");
const { describe } = require("@playwright/test");
const { afterEach } = require("@playwright/test");
const { beforeEach } = require("@playwright/test");
const Server = require("../../lib/Server");
const config = require("../fixtures/client-config/webpack.config");
const port = require("../ports-map")["setup-middlewares-option"];

describe("setupMiddlewares option", () => {
  let compiler;
  let server;
  let pageErrors;
  let consoleMessages;

  beforeEach(async () => {
    compiler = webpack(config);
    server = new Server(
      {
        setupMiddlewares: (middlewares, devServer) => {
          if (!devServer) {
            throw new Error("webpack-dev-server is not defined");
          }

          devServer.app.use("/setup-middleware/some/path", (req, res, next) => {
            if (req.method === "GET") {
              res.setHeader("Content-Type", "text/html; charset=utf-8");
              res.end("setup-middlewares option GET");
              return;
            } else if (req.method === "POST") {
              res.setHeader("Content-Type", "text/html; charset=utf-8");
              res.end("setup-middlewares option POST");
              return;
            }

            return next();
          });

          middlewares.push({
            name: "hello-world-test-two",
            middleware: (req, res, next) => {
              if (req.url !== "/foo/bar/baz") {
                next();
                return;
              }

              res.setHeader("Content-Type", "text/html; charset=utf-8");
              res.end("Hello World without path!");
            },
          });
          middlewares.push({
            name: "hello-world-test-one",
            path: "/foo/bar",
            middleware: (req, res) => {
              res.setHeader("Content-Type", "text/html; charset=utf-8");
              res.end("Hello World with path!");
            },
          });
          middlewares.push((req, res) => {
            res.setHeader("Content-Type", "text/html; charset=utf-8");
            res.end("Hello World as function!");
          });

          return middlewares;
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

  test("should handle GET request to /setup-middleware/some/path route", async ({ page }) => {
    page
      .on("console", (message) => {
        consoleMessages.push(message);
      })
      .on("pageerror", (error) => {
        pageErrors.push(error);
      });

    const response = await page.goto(
      `http://127.0.0.1:${port}/setup-middleware/some/path`,
      {
        waitUntil: "networkidle0",
      },
    );

    expect(JSON.stringify(response.headers()["content-type"])).toMatchSnapshot();
    expect(JSON.stringify(response.status())).toMatchSnapshot();
    expect(JSON.stringify(await response.text())).toMatchSnapshot();

    const response1 = await page.goto(`http://127.0.0.1:${port}/foo/bar`, {
      waitUntil: "networkidle0",
    });

    expect(JSON.stringify(response1.headers()["content-type"])).toMatchSnapshot();
    expect(JSON.stringify(response1.status())).toMatchSnapshot();
    expect(JSON.stringify(response1.text())).toMatchSnapshot();

    const response2 = await page.goto(`http://127.0.0.1:${port}/foo/bar/baz`, {
      waitUntil: "networkidle0",
    });

    expect(JSON.stringify(response2.headers()["content-type"])).toMatchSnapshot();
    expect(JSON.stringify(response2.status())).toMatchSnapshot();
    expect(JSON.stringify(await response2.text())).toMatchSnapshot();

    const response3 = await page.goto(
      `http://127.0.0.1:${port}/setup-middleware/unknown`,
      {
        waitUntil: "networkidle0",
      },
    );

    expect(JSON.stringify(response3.headers()["content-type"])).toMatchSnapshot();
    expect(JSON.stringify(response3.status())).toMatchSnapshot();
    expect(JSON.stringify(await response3.text())).toMatchSnapshot();

    expect(JSON.stringify(consoleMessages.map((message) => message.text()))).toMatchSnapshot();
    expect(JSON.stringify(pageErrors)).toMatchSnapshot();
  });

  test("should handle POST request to /setup-middleware/some/path route", async ({ page }) => {
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
      `http://127.0.0.1:${port}/setup-middleware/some/path`,
      {
        waitUntil: "networkidle0",
      },
    );

    expect(JSON.stringify(response.headers()["content-type"])).toMatchSnapshot();
    expect(JSON.stringify(response.status())).toMatchSnapshot();
    expect(JSON.stringify(await response.text())).toMatchSnapshot();
    expect(JSON.stringify(consoleMessages.map((message) => message.text()))).toMatchSnapshot();
    expect(JSON.stringify(pageErrors)).toMatchSnapshot();
  });
});
