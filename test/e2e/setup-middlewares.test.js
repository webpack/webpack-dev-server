"use strict";

const webpack = require("webpack");
const Server = require("../../lib/Server");
const { test } = require("../helpers/playwright-test");
const { expect } = require("../helpers/playwright-custom-expects");
const config = require("../fixtures/client-config/webpack.config");
const port = require("../ports-map")["setup-middlewares-option"];

test.describe("setupMiddlewares option", () => {
  let compiler;
  let server;
  let pageErrors;
  let consoleMessages;

  test.beforeEach(async () => {
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

  test.afterEach(async () => {
    await server.stop();
  });

  test("should handle GET request to /setup-middleware/some/path route", async ({
    browser,
  }) => {
    const context = await browser.newContext();

    const page1 = await context.newPage();
    page1
      .on("console", (message) => {
        consoleMessages.push(message);
      })
      .on("pageerror", (error) => {
        pageErrors.push(error);
      });

    const response1 = await page1.goto(
      `http://127.0.0.1:${port}/setup-middleware/some/path`,
      {
        waitUntil: "networkidle0",
      },
    );

    expect(response1.headers()["content-type"]).toMatchSnapshotWithArray(
      "content type",
    );

    expect(response1.status()).toBe(200);

    await expect(page1).toHaveScreenshot();

    const page2 = await context.newPage();
    const response2 = await page2.goto(`http://127.0.0.1:${port}/foo/bar`, {
      waitUntil: "networkidle0",
    });

    expect(response2.headers()["content-type"]).toMatchSnapshotWithArray(
      "content type",
    );

    expect(response2.status()).toBe(200);

    await expect(page2).toHaveScreenshot();

    const page3 = await context.newPage();
    const response3 = await page3.goto(`http://127.0.0.1:${port}/foo/bar/baz`, {
      waitUntil: "networkidle0",
    });

    expect(response3.headers()["content-type"]).toMatchSnapshotWithArray(
      "content type",
    );

    expect(response3.status()).toBe(200);

    await expect(page3).toHaveScreenshot();

    const page4 = await context.newPage();
    const response4 = await page4.goto(
      `http://127.0.0.1:${port}/setup-middleware/unknown`,
      {
        waitUntil: "networkidle0",
      },
    );

    expect(response4.headers()["content-type"]).toMatchSnapshotWithArray(
      "content type",
    );

    expect(response4.status()).toBe(200);
    await expect(page4).toHaveScreenshot();

    expect(
      consoleMessages.map((message) => message.text()),
    ).toMatchSnapshotWithArray("console messages");

    expect(pageErrors).toMatchSnapshotWithArray("page errors");
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
      });

    await page.route("**/*", (route) => {
      route.continue({ method: "POST" });
    });

    const response = await page.goto(
      `http://127.0.0.1:${port}/setup-middleware/some/path`,
      {
        waitUntil: "networkidle0",
      },
    );

    expect(response.headers()["content-type"]).toMatchSnapshotWithArray(
      "content type",
    );

    expect(response.status()).toBe(200);

    await expect(page).toHaveScreenshot();

    expect(
      consoleMessages.map((message) => message.text()),
    ).toMatchSnapshotWithArray("console messages");

    expect(pageErrors).toMatchSnapshotWithArray("page errors");
  });
});
