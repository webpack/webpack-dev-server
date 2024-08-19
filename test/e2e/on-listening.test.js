"use strict";

const webpack = require("webpack");
const { test } = require("../helpers/playwright-test");
const { expect } = require("../helpers/playwright-custom-expects");
const Server = require("../../lib/Server");
const config = require("../fixtures/client-config/webpack.config");
const port = require("../ports-map")["on-listening-option"];

test.describe("onListening option", () => {
  let compiler;
  let server;
  let pageErrors;
  let consoleMessages;
  let onListeningIsRunning = false;

  test.beforeEach(async () => {
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

  test.afterEach(async () => {
    await server.stop();
  });

  test("should handle GET request to /listening/some/path route", async ({
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
      `http://127.0.0.1:${port}/listening/some/path`,
      {
        waitUntil: "networkidle0",
      },
    );

    expect(onListeningIsRunning).toBe(true);

    expect(response.headers()["content-type"]).toMatchSnapshotWithArray(
      "content type",
    );

    expect(response.status()).toEqual(200);

    await expect(page).toHaveScreenshot();

    expect(
      consoleMessages.map((message) => message.text()),
    ).toMatchSnapshotWithArray("console messages");

    expect(pageErrors).toMatchSnapshotWithArray("page errors");
  });

  test("should handle POST request to /listening/some/path route", async ({
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
      `http://127.0.0.1:${port}/listening/some/path`,
      {
        waitUntil: "networkidle0",
      },
    );

    expect(onListeningIsRunning).toBe(true);

    expect(response.headers()["content-type"]).toMatchSnapshotWithArray(
      "content type",
    );

    expect(response.status()).toEqual(200);

    await expect(page).toHaveScreenshot();

    expect(
      consoleMessages.map((message) => message.text()),
    ).toMatchSnapshotWithArray("console messages");

    expect(pageErrors).toMatchSnapshotWithArray("page errors");
  });
});
