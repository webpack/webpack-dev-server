"use strict";

const webpack = require("webpack");
const { describe, test, beforeEach, afterEach } = require("@playwright/test");
const Server = require("../../lib/Server");
const { expect } = require("../helpers/playwright-custom-expects");
const config = require("../fixtures/simple-config-other/webpack.config");
const port = require("../ports-map")["compress-option"];

describe("compress option", { tag: "@flaky" }, () => {
  describe("enabled by default when not specified", () => {
    let compiler;
    let server;
    let pageErrors;
    let consoleMessages;

    beforeEach(async () => {
      compiler = webpack(config);

      server = new Server({ port }, compiler);

      await server.start();

      pageErrors = [];
      consoleMessages = [];
    });

    afterEach(async () => {
      await server.stop();
    });

    test("should handle GET request to bundle file", async ({ page }) => {
      page
        .on("console", (message) => {
          consoleMessages.push(message);
        })
        .on("pageerror", (error) => {
          pageErrors.push(error);
        });

      const response = await page.goto(`http://127.0.0.1:${port}/main.js`, {
        waitUntil: "networkidle0",
      });

      expect(response.status()).toMatchSnapshotWithArray();

      expect(
        response.headers()["content-encoding"])
      .toMatchSnapshotWithArray();

      expect(
        consoleMessages.map((message) => message.text()))
      .toMatchSnapshotWithArray();

      expect(pageErrors).toMatchSnapshotWithArray();
    });
  });

  describe("as true", () => {
    let compiler;
    let server;
    let pageErrors;
    let consoleMessages;

    beforeEach(async () => {
      compiler = webpack(config);

      server = new Server(
        {
          compress: true,
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

    test("should handle GET request to bundle file", async ({ page }) => {
      page
        .on("console", (message) => {
          consoleMessages.push(message);
        })
        .on("pageerror", (error) => {
          pageErrors.push(error);
        });

      const response = await page.goto(`http://127.0.0.1:${port}/main.js`, {
        waitUntil: "networkidle0",
      });

      expect(response.status()).toMatchSnapshotWithArray();

      expect(
        response.headers()["content-encoding"])
      .toMatchSnapshotWithArray();

      expect(
        consoleMessages.map((message) => message.text()))
      .toMatchSnapshotWithArray();

      expect(pageErrors).toMatchSnapshotWithArray();
    });
  });

  describe("as false", () => {
    let compiler;
    let server;
    let pageErrors;
    let consoleMessages;

    beforeEach(async () => {
      compiler = webpack(config);

      server = new Server(
        {
          compress: false,
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

    test("should handle GET request to bundle file", {
      annotation: {
        type: "fails",
        description: "https://github.com/webpack/webpack-dev-server/issues/4630#issuecomment-1588211112"
      }
    }, async ({ page }) => {
      page
        .on("console", (message) => {
          consoleMessages.push(message);
        })
        .on("pageerror", (error) => {
          pageErrors.push(error);
        });

      const response = await page.goto(`http://127.0.0.1:${port}/main.js`, {
        waitUntil: "networkidle0",
      });

      expect(response.status()).toMatchSnapshotWithArray();

      expect(
        response.headers()["content-encoding"])
      .toMatchSnapshotWithArray();

      expect(
        consoleMessages.map((message) => message.text()))
      .toMatchSnapshotWithArray();

      expect(pageErrors).toMatchSnapshotWithArray();
    });
  });
});
