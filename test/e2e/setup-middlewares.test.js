"use strict";

const webpack = require("webpack");
const { describe, test, beforeEach, afterEach } = require("@playwright/test");
const Server = require("../../lib/Server");
const { expect } = require("../helpers/playwright-custom-expects");
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

  test("should handle GET request to /setup-middleware/some/path route", async ({
    page,
  }) => {
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

    expect(
      response.headers()["content-type"]
    ).toMatchSnapshotWithArray();
    expect(response.status()).toMatchSnapshotWithArray();
    expect(await response.text()).toMatchSnapshotWithArray();

    const response1 = await page.goto(`http://127.0.0.1:${port}/foo/bar`, {
      waitUntil: "networkidle0",
    });

    expect(
      response1.headers()["content-type"]
    ).toMatchSnapshotWithArray();
    expect(response1.status()).toMatchSnapshotWithArray();
    expect(response1.text()).toMatchSnapshotWithArray();

    const response2 = await page.goto(`http://127.0.0.1:${port}/foo/bar/baz`, {
      waitUntil: "networkidle0",
    });

    expect(
      response2.headers()["content-type"]
    ).toMatchSnapshotWithArray();
    expect(response2.status()).toMatchSnapshotWithArray();
    expect(await response2.text()).toMatchSnapshotWithArray();

    const response3 = await page.goto(
      `http://127.0.0.1:${port}/setup-middleware/unknown`,
      {
        waitUntil: "networkidle0",
      },
    );

    expect(
      response3.headers()["content-type"]
    ).toMatchSnapshotWithArray();
    expect(response3.status()).toMatchSnapshotWithArray();
    expect(await response3.text()).toMatchSnapshotWithArray();

    expect(
      consoleMessages.map((message) => message.text())
    ).toMatchSnapshotWithArray();
    expect(pageErrors).toMatchSnapshotWithArray();
  });

  test("should handle POST request to /setup-middleware/some/path route", async ({
    page,
  }) => {
    page
      .on("console", (message) => {
        consoleMessages.push(message);
      })
      .on("pageerror", (error) => {
        pageErrors.push(error);
      })

    await page.route("**/*", (route) => {
      route.continue({ method: "POST" })
    })

    const response = await page.goto(
      `http://127.0.0.1:${port}/setup-middleware/some/path`,
      {
        waitUntil: "networkidle0",
      },
    );

    expect(
      response.headers()["content-type"]
    ).toMatchSnapshotWithArray();
    expect(response.status()).toMatchSnapshotWithArray();
    expect(await response.text()).toMatchSnapshotWithArray();
    expect(
      consoleMessages.map((message) => message.text())
    ).toMatchSnapshotWithArray();
    expect(pageErrors).toMatchSnapshotWithArray();
  });
});
