"use strict";

const webpack = require("webpack");
const { test } = require("../helpers/playwright-test");
const { expect } = require("../helpers/playwright-custom-expects");
const Server = require("../../lib/Server");
const config = require("../fixtures/mime-types-config/webpack.config");
const port = require("../ports-map")["mime-types-option"];

test.describe("mimeTypes option", () => {
  test.describe("as an object with a remapped type", () => {
    let compiler;
    let server;
    let pageErrors;
    let consoleMessages;

    test.beforeEach(async () => {
      compiler = webpack(config);

      server = new Server(
        {
          devMiddleware: {
            mimeTypes: {
              js: "text/plain",
            },
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

    test("should request file with different js mime type", async ({
      page,
    }) => {
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

      expect(response.status()).toEqual(200);

      expect(
        response.headers()["content-type"],
      ).toMatchSnapshotWithArray("content type");

      expect(consoleMessages.map((message) => message.text())).toMatchSnapshotWithArray("console messages");

      expect(pageErrors).toMatchSnapshotWithArray("page errors");
    });
  });

  test.describe("as an object with a custom type", () => {
    let compiler;
    let server;
    let pageErrors;
    let consoleMessages;

    test.beforeEach(async () => {
      compiler = webpack(config);

      server = new Server(
        {
          devMiddleware: {
            mimeTypes: {
              custom: "text/html",
            },
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

    test("should request file with different js mime type", async ({
      page,
    }) => {
      page
        .on("console", (message) => {
          consoleMessages.push(message);
        })
        .on("pageerror", (error) => {
          pageErrors.push(error);
        });

      const response = await page.goto(`http://127.0.0.1:${port}/file.custom`, {
        waitUntil: "networkidle0",
      });

      expect(response.status()).toEqual(200);

      expect(
        response.headers()["content-type"],
      ).toMatchSnapshotWithArray("content type");

      expect(
        consoleMessages.map((message) => message.text()),
      ).toMatchSnapshotWithArray("console messages");

      expect(pageErrors).toMatchSnapshotWithArray("page errors");
    });
  });
});
